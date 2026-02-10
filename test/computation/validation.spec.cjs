// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * Validation Test - Compares legacy StateManager values to ComputationGraph values
 *
 * The computation graph must produce IDENTICAL results to the legacy Section code.
 * Any mismatch means the graph cannot safely replace the legacy system.
 *
 * Field mappings use { semanticPath: legacyId } where:
 * - semanticPath is the computation graph node ID
 * - legacyId is the StateManager key set by legacy Section code
 */

// All fields the graph must match against legacy
const FIELD_MAPPINGS = {
  // Climate (S03)
  'climate.location.province': 'd_19',
  'climate.heating.degreedays': 'd_20',
  'climate.cooling.degreedays': 'd_21',
  'climate.zone': 'j_19',

  // Building (S02)
  'building.conditionedFloorArea': 'h_15',
  'building.majorOccupancy': 'd_12',
  'building.serviceLife': 'h_13',

  // Internal Gains (S09)
  'internal.plugLoads.annual': 'h_65',
  'internal.lighting.annual': 'h_66',
  'internal.equipment.annual': 'h_67',
  'energy.plugLoads.subtotal': 'h_70',
  'internal.occupants.annual': 'h_64',

  // Radiant Gains (S10)
  'radiantGains.usableGains': 'i_80',

  // Transmission Loss (S11)
  'transmissionLoss.thermalBridgePenalty': 'd_97',
  'transmissionLoss.components.subtotalHeatLoss': 'i_98',
  'transmissionLoss.thermalBridgePenalty.heatLoss': 'i_97',

  // Volume (S12)
  'volume.conditioned': 'd_105',
  'envelope.airFacing.area': 'd_101',
  'envelope.groundFacing.area': 'd_102',
  'envelope.airFacing.uValue': 'g_101',
  'envelope.groundFacing.uValue': 'g_102',

  // Ventilation (S13)
  'ventilation.volumetricRate': 'd_120',
  'ventilation.grossHeatLoss': 'd_121',
  'ventilation.netHeatLoss': 'm_121',

  // Energy (S14/S15)
  'energy.ted.heating': 'd_127',
  'mechanical.heating.demand': 'd_114',
  'energy.total.all': 'd_136',

  // Emissions (S04)
  'energy.target.electricity': 'j_27',
  'emissions.target.electricity': 'k_27',
  'emissions.target.subtotal': 'k_32',

  // Key Values (S01)
  'keyValues.target.annualCarbon': 'h_8',
  'keyValues.target.lifetimeCarbon': 'h_6',
};

test.describe('Computation Graph Parity', () => {
  test('graph must exactly match legacy StateManager values', async ({ page }) => {
    const fileUrl = 'file://' + path.join(__dirname, '../../index.html');
    await page.goto(fileUrl);

    await page.waitForFunction(() => {
      return window.TEUI?.StateManager?.getValue !== undefined;
    }, { timeout: 30000 });

    // Wait for legacy calculations to settle
    await page.waitForTimeout(2000);

    const results = await page.evaluate((fieldMappings) => {
      const StateManager = window.TEUI.StateManager;

      // Create computation graph
      const graph = window.TEUI.ComputationGraph.create();
      const nodes = window.TEUI.ComputationNodes || {};
      const moduleOrder = [
        'Climate', 'BuildingInfo', 'Envelope', 'Mechanical',
        'SpaceHeating', 'WaterHeating', 'Renewable', 'Energy',
        'Forestry', 'Emissions', 'Occupancy', 'InternalGains',
        'RadiantGains', 'TransmissionLoss', 'VolumeMetrics',
        'Cooling', 'Ventilation', 'KeyValues'
      ];

      let moduleCount = 0;
      for (const name of moduleOrder) {
        if (nodes[name]) {
          nodes[name].register(graph);
          moduleCount++;
        }
      }

      // Create state and sync inputs from StateManager
      const state = window.TEUI.MultiModelState.create();
      const targetMeta = window.TEUI.ModelMetadata.createTarget('Validation');
      state.addModel(targetMeta);

      const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
      let syncCount = 0;

      for (const semanticPath of inputIds) {
        const inputNode = graph.getInput(semanticPath);
        const legacyId = inputNode?.legacyId;
        if (legacyId) {
          const value = StateManager.getValue(legacyId);
          if (value !== undefined && value !== null && value !== '') {
            state.setValueForModel(targetMeta.id, semanticPath, value);
            syncCount++;
          }
        }
      }

      // Compute
      const engine = window.TEUI.MultiModelEngine.create({ state, graph });
      const computeResult = engine.computeAllForModel(targetMeta.id);

      // Compare
      function parseNum(value, defaultVal = NaN) {
        if (value === null || value === undefined || value === 'N/A' || value === 'Unavailable') return defaultVal;
        const num = parseFloat(String(value).replace(/,/g, ''));
        return isNaN(num) ? defaultVal : num;
      }

      const comparisons = [];

      for (const [semanticPath, legacyId] of Object.entries(fieldMappings)) {
        const legacyValue = StateManager.getValue(legacyId);
        const graphValue = state.getValue(semanticPath);

        const c = { semanticPath, legacyId, legacyValue, graphValue, status: 'unknown' };

        // Both missing = skip
        if ((legacyValue === undefined || legacyValue === null || legacyValue === '') &&
            (graphValue === undefined || graphValue === null)) {
          c.status = 'both_missing';
          comparisons.push(c);
          continue;
        }

        // One missing
        if (legacyValue === undefined || legacyValue === null || legacyValue === '') {
          c.status = 'legacy_missing';
          comparisons.push(c);
          continue;
        }
        if (graphValue === undefined || graphValue === null) {
          c.status = 'graph_missing';
          comparisons.push(c);
          continue;
        }

        // String comparison for non-numeric
        const legacyNum = parseNum(legacyValue);
        const graphNum = parseNum(graphValue);

        if (isNaN(legacyNum) || isNaN(graphNum)) {
          c.status = String(legacyValue) === String(graphValue) ? 'match' : 'mismatch';
          comparisons.push(c);
          continue;
        }

        // Numeric comparison: must match within 0.1% or absolute 0.01
        const absDiff = Math.abs(legacyNum - graphNum);
        const relDiff = legacyNum !== 0 ? (absDiff / Math.abs(legacyNum)) * 100 : (absDiff === 0 ? 0 : 100);
        c.absDiff = absDiff;
        c.relDiff = relDiff;

        if (absDiff < 0.01 || relDiff < 0.1) {
          c.status = 'match';
        } else {
          c.status = 'mismatch';
        }

        comparisons.push(c);
      }

      return { moduleCount, syncCount, computeResult, comparisons };
    }, FIELD_MAPPINGS);

    // Report
    const matches = results.comparisons.filter(c => c.status === 'match');
    const mismatches = results.comparisons.filter(c => c.status === 'mismatch');
    const graphMissing = results.comparisons.filter(c => c.status === 'graph_missing');
    const bothMissing = results.comparisons.filter(c => c.status === 'both_missing');

    console.log(`\n=== COMPUTATION GRAPH PARITY ===`);
    console.log(`Modules: ${results.moduleCount} | Inputs synced: ${results.syncCount} | Nodes computed: ${results.computeResult.computedNodes}`);
    console.log(`Fields tested: ${results.comparisons.length}`);
    console.log(`  Match: ${matches.length}`);
    console.log(`  Mismatch: ${mismatches.length}`);
    console.log(`  Graph missing: ${graphMissing.length}`);
    console.log(`  Both missing: ${bothMissing.length}`);

    if (mismatches.length > 0) {
      console.log(`\n--- MISMATCHES (test will FAIL) ---`);
      for (const c of mismatches) {
        const diffStr = c.relDiff !== undefined ? ` (${c.relDiff.toFixed(1)}% / ${c.absDiff.toFixed(4)} abs)` : '';
        console.log(`  ${c.legacyId} (${c.semanticPath}): legacy=${c.legacyValue} graph=${c.graphValue}${diffStr}`);
      }
    }

    if (graphMissing.length > 0) {
      console.log(`\n--- GRAPH MISSING (test will FAIL) ---`);
      for (const c of graphMissing) {
        console.log(`  ${c.legacyId} (${c.semanticPath}): legacy=${c.legacyValue} graph=undefined`);
      }
    }

    // STRICT: zero mismatches, zero missing
    expect(mismatches.length, `${mismatches.length} fields mismatch between graph and legacy`).toBe(0);
    expect(graphMissing.length, `${graphMissing.length} fields missing from graph`).toBe(0);
  });
});
