// Paste this in the browser console after the app loads
// Validation Script: Compares old StateManager values to new ComputationGraph values

(function runValidation() {
  const StateManager = window.TEUI?.StateManager;
  if (!StateManager) {
    console.error('StateManager not found! Load the main app first.');
    return;
  }

  console.log('=== VALIDATION: Old vs New Computation System ===\n');

  // Field mappings to compare
  const FIELD_MAPPINGS = {
    // Climate (S03)
    'climate.heating.degreedays': 'd_20',
    'climate.cooling.degreedays': 'd_21',
    'climate.zone': 'd_19',

    // Building (S02)
    'building.conditionedFloorArea': 'd_12',

    // Volume (S12)
    'volume.conditioned': 'd_105',
    'envelope.airFacing.area': 'd_101',
    'envelope.groundFacing.area': 'd_102',
    'envelope.airFacing.uValue': 'g_101',
    'envelope.groundFacing.uValue': 'g_102',

    // Air Tightness (S12)
    'airTightness.method': 'd_108',
    'airTightness.nrl50': 'g_108',
    'airTightness.nFactor': 'g_110',
    'airTightness.heatLoss': 'i_103',
    'airTightness.heatGain': 'k_103',

    // Transmission Loss (S11)
    'transmissionLoss.thermalBridgePenalty': 'd_97',
    'transmissionLoss.components.subtotalHeatLoss': 'i_98',
    'transmissionLoss.thermalBridgePenalty.heatLoss': 'i_97',

    // Ventilation (S13)
    'ventilation.volumetricRate': 'd_120',
    'ventilation.grossHeatLoss': 'd_121',
    'ventilation.netHeatLoss': 'm_121',
    'ventilation.energyRecovered': 'h_121',
    'cooling.latentLoadFactor': 'cooling_latentLoadFactor',
    'ventilation.heatGain': 'd_122',
    'ventilation.energyRecoveredCooling': 'd_123',
    'cooling.freeCoolingLimit': 'h_124',
    'cooling.daysActiveCooling': 'm_124',

    // Energy Demand (S14) - d_129 components: k_71 + k_79 + k_98 + d_122
    'internal.coolingLoad.occupants': 'k_71',
    'radiantGains.subtotal.coolingGain': 'k_79',
    'transmissionLoss.components.subtotalHeatGain': 'k_98',
    'energy.ced.unmitigated': 'd_129',
    'energy.ced.mitigated': 'm_129',

    // Mechanical Cooling (S13)
    'mechanical.cooling.electricalDemand': 'd_117',
    'mechanical.cooling.intensity': 'f_117',
    'mechanical.cooling.coolingSink': 'l_116',

    // Occupancy
    'occupancy.occupiedHours': 'i_63',
    'occupancy.totalHours': 'j_63',

    // Energy totals
    'energy.teui': 'k_6',
    'energy.tedi': 'h_6',
    'emissions.ghgi': 'h_8',
  };

  // Create computation system
  const graph = window.TEUI.ComputationGraph.create();

  // Register all nodes
  const nodes = window.TEUI.ComputationNodes || {};
  const moduleOrder = [
    'Climate', 'BuildingInfo', 'Envelope', 'Mechanical',
    'SpaceHeating', 'WaterHeating', 'Renewable', 'Energy',
    'Forestry', 'Emissions', 'Occupancy',
    'RadiantGains', 'TransmissionLoss', 'VolumeMetrics', 'Ventilation',
    'KeyValues'
  ];

  let moduleCount = 0;
  for (const name of moduleOrder) {
    if (nodes[name]) {
      nodes[name].register(graph);
      moduleCount++;
    }
  }
  console.log(`Loaded ${moduleCount} modules`);

  // Create engine and sync from StateManager
  const engine = window.TEUI.IncrementalEngine.create(graph);

  // Sync inputs
  const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
  let syncCount = 0;

  for (const semanticPath of inputIds) {
    const inputNode = graph.getInput(semanticPath);
    const legacyId = inputNode?.legacyId;

    if (legacyId) {
      const value = StateManager.getValue(legacyId);
      if (value !== undefined && value !== null && value !== '') {
        engine.setInput(semanticPath, value);
        syncCount++;
      }
    }
  }
  console.log(`Synced ${syncCount} values from StateManager\n`);

  // Compute
  const startTime = performance.now();
  const computedCount = engine.computeAll();
  const duration = performance.now() - startTime;
  console.log(`Computed ${computedCount} nodes in ${duration.toFixed(2)}ms\n`);

  // Compare values
  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === 'N/A' || value === 'Unavailable') return defaultVal;
    const num = parseFloat(String(value).replace(/,/g, ''));
    return isNaN(num) ? defaultVal : num;
  }

  const results = { match: [], close: [], mismatch: [], missing: [] };

  for (const [semanticPath, legacyId] of Object.entries(FIELD_MAPPINGS)) {
    const oldValue = StateManager.getValue(legacyId);
    const newValue = engine.getValue(semanticPath);

    if (oldValue === undefined || oldValue === null || oldValue === '' || oldValue === 'N/A') {
      results.missing.push({ legacyId, semanticPath, oldValue, newValue });
      continue;
    }
    if (newValue === undefined || newValue === null) {
      results.missing.push({ legacyId, semanticPath, oldValue, newValue });
      continue;
    }

    const oldNum = parseNum(oldValue);
    const newNum = parseNum(newValue);
    const diff = Math.abs(oldNum - newNum);
    const relDiff = oldNum !== 0 ? (diff / Math.abs(oldNum)) * 100 : (diff === 0 ? 0 : 100);

    const item = { legacyId, semanticPath, oldValue: oldNum, newValue: newNum, diff: relDiff };

    if (diff < 0.001 || relDiff < 0.01) {
      results.match.push(item);
    } else if (relDiff < 1) {
      results.close.push(item);
    } else {
      results.mismatch.push(item);
    }
  }

  // Report
  console.log('=== SUMMARY ===');
  console.log(`✓ Exact match: ${results.match.length}`);
  console.log(`~ Close (<1%): ${results.close.length}`);
  console.log(`✗ Mismatch:    ${results.mismatch.length}`);
  console.log(`? Missing:     ${results.missing.length}`);
  console.log('');

  if (results.mismatch.length > 0) {
    console.log('=== MISMATCHES ===');
    console.table(results.mismatch.map(r => ({
      Field: r.legacyId,
      Path: r.semanticPath,
      OLD: typeof r.oldValue === 'number' ? r.oldValue.toFixed(4) : r.oldValue,
      NEW: typeof r.newValue === 'number' ? r.newValue.toFixed(4) : r.newValue,
      'Diff%': r.diff.toFixed(2) + '%'
    })));
  }

  if (results.close.length > 0) {
    console.log('\n=== CLOSE (within 1%) ===');
    console.table(results.close.map(r => ({
      Field: r.legacyId,
      Path: r.semanticPath,
      OLD: typeof r.oldValue === 'number' ? r.oldValue.toFixed(4) : r.oldValue,
      NEW: typeof r.newValue === 'number' ? r.newValue.toFixed(4) : r.newValue,
      'Diff%': r.diff.toFixed(2) + '%'
    })));
  }

  if (results.missing.length > 0) {
    console.log('\n=== MISSING ===');
    console.table(results.missing.map(r => ({
      Field: r.legacyId,
      Path: r.semanticPath,
      OLD: r.oldValue,
      NEW: r.newValue
    })));
  }

  const total = results.match.length + results.close.length + results.mismatch.length;
  const matchRate = total > 0 ? ((results.match.length + results.close.length) / total * 100).toFixed(1) : 0;
  console.log(`\n=== Match rate: ${matchRate}% ===`);

  return results;
})();
