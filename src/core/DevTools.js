/**
 * DevTools.js - Developer Tools for New Computation System Validation
 *
 * Provides UI controls for:
 * - Comparing old vs new computation systems
 * - Running the new system independently
 * - Debugging and diagnostics
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  // No hardcoded mappings - we'll use the graph's legacyId properties

  /**
   * Initialize dev tools - attach event listeners
   */
  function initialize() {
    document.addEventListener('DOMContentLoaded', () => {
      const validateBtn = document.getElementById('validateSystemBtn');
      const detailedBtn = document.getElementById('detailedValidationBtn');
      const computeBtn = document.getElementById('computeSystemBtn');
      const debugBtn = document.getElementById('debugSystemBtn');

      if (validateBtn) {
        validateBtn.addEventListener('click', (e) => {
          e.preventDefault();
          runValidation();
        });
      }

      if (detailedBtn) {
        detailedBtn.addEventListener('click', (e) => {
          e.preventDefault();
          runDetailedValidation();
        });
      }

      if (computeBtn) {
        computeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          runNewSystem();
        });
      }

      if (debugBtn) {
        debugBtn.addEventListener('click', (e) => {
          e.preventDefault();
          showDebugInfo();
        });
      }

      console.log('[DevTools] Initialized');
    });
  }

  /**
   * Run validation comparing old vs new system
   */
  function runValidation() {
    console.group('[DevTools] Validation: Old vs New System');

    const StateManager = window.TEUI?.StateManager;
    if (!StateManager) {
      console.error('StateManager not available');
      alert('Error: StateManager not loaded');
      console.groupEnd();
      return;
    }

    try {
      // Initialize new computation system if needed
      const CI = window.TEUI.ComputationIntegration;
      if (!CI?.isInitialized()) {
        console.log('Initializing new computation system...');
        CI.initialize();
      }

      const graph = CI.getGraph();
      const state = CI.getState();
      const engine = CI.getEngine();

      if (!graph || !state || !engine) {
        console.error('Computation system components not available');
        alert('Error: New computation system not properly initialized');
        console.groupEnd();
        return;
      }

      // Sync values from StateManager to new system
      console.log('Syncing values from StateManager...');
      const targetId = state.getActiveModelId();
      const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
      let syncCount = 0;

      // Sync inputs
      for (const semanticPath of inputIds) {
        const inputNode = graph.getInput(semanticPath);
        const legacyId = inputNode?.legacyId;

        if (legacyId) {
          const value = StateManager.getValue(legacyId);
          if (value !== undefined && value !== null && value !== '') {
            state.setValueForModel(targetId, semanticPath, value);
            syncCount++;
          }
        }
      }
      console.log(`Synced ${syncCount} input values`);

      // Compute with new system
      const computeStart = performance.now();
      const result = engine.computeAllForModel(targetId);
      const computeDuration = performance.now() - computeStart;

      console.log(`Computed ${result.computedNodes} nodes in ${computeDuration.toFixed(2)}ms`);

      // Build validation fields from graph's legacyId properties
      const VALIDATION_FIELDS = {};

      // Get all computed nodes with legacyIds
      const allNodeIds = graph.getAllNodeIds ? graph.getAllNodeIds() : [];
      for (const nodeId of allNodeIds) {
        const node = graph.getNode(nodeId);
        if (node?.legacyId) {
          VALIDATION_FIELDS[nodeId] = node.legacyId;
        }
      }

      console.log(`Found ${Object.keys(VALIDATION_FIELDS).length} nodes with legacyId mappings`);

      // Compare values
      const comparisons = [];
      let matchCount = 0;
      let closeCount = 0;
      let mismatchCount = 0;
      let missingCount = 0;

      for (const [semanticPath, legacyId] of Object.entries(VALIDATION_FIELDS)) {
        const oldValue = StateManager.getValue(legacyId);
        const newValue = state.getValue(semanticPath);

        const comparison = {
          semanticPath,
          legacyId,
          oldValue,
          newValue,
          status: 'missing',
          diff: null
        };

        if (oldValue === undefined || oldValue === null || oldValue === '' || oldValue === 'N/A') {
          comparison.status = 'missing';
          missingCount++;
        } else if (newValue === undefined || newValue === null) {
          comparison.status = 'missing';
          missingCount++;
        } else {
          const oldNum = parseFloat(String(oldValue).replace(/,/g, ''));
          const newNum = parseFloat(String(newValue));

          if (isNaN(oldNum) || isNaN(newNum)) {
            // String comparison
            if (String(oldValue) === String(newValue)) {
              comparison.status = 'match';
              matchCount++;
            } else {
              comparison.status = 'mismatch';
              mismatchCount++;
            }
          } else {
            // Numeric comparison
            const diff = Math.abs(oldNum - newNum);
            const relDiff = oldNum !== 0 ? (diff / Math.abs(oldNum)) * 100 : (diff === 0 ? 0 : 100);
            comparison.diff = relDiff;

            if (diff < 0.001 || relDiff < 0.01) {
              comparison.status = 'match';
              matchCount++;
            } else if (relDiff < 1) {
              comparison.status = 'close';
              closeCount++;
            } else {
              comparison.status = 'mismatch';
              mismatchCount++;
            }
          }
        }

        comparisons.push(comparison);
      }

      // Log results
      console.log('\n=== VALIDATION SUMMARY ===');
      console.log(`Fields compared: ${comparisons.length}`);
      console.log(`Exact matches: ${matchCount}`);
      console.log(`Close (<1%): ${closeCount}`);
      console.log(`Mismatches: ${mismatchCount}`);
      console.log(`Missing: ${missingCount}`);

      // Show mismatches
      const mismatches = comparisons.filter(c => c.status === 'mismatch');
      if (mismatches.length > 0) {
        console.log('\n=== MISMATCHES ===');
        mismatches.forEach(m => {
          console.log(`${m.semanticPath} (${m.legacyId}): OLD=${m.oldValue} | NEW=${m.newValue} | DIFF=${m.diff?.toFixed(2) || 'N/A'}%`);
        });
      }

      // Show missing
      const missing = comparisons.filter(c => c.status === 'missing');
      if (missing.length > 0) {
        console.log('\n=== MISSING ===');
        missing.forEach(m => {
          console.log(`${m.semanticPath} (${m.legacyId}): OLD=${m.oldValue} | NEW=${m.newValue}`);
        });
      }

      // Show all comparisons for debugging
      console.log('\n=== ALL COMPARISONS ===');
      comparisons.forEach(c => {
        const emoji = c.status === 'match' ? '✓' : c.status === 'close' ? '~' : c.status === 'mismatch' ? '✗' : '?';
        console.log(`${emoji} ${c.semanticPath}: OLD=${c.oldValue} | NEW=${c.newValue}`);
      });

      // Show alert with summary
      const statusEmoji = mismatchCount === 0 ? '✓' : '✗';
      alert(
        `${statusEmoji} Validation Complete\n\n` +
        `Fields compared: ${comparisons.length}\n` +
        `Exact matches: ${matchCount}\n` +
        `Close (<1%): ${closeCount}\n` +
        `Mismatches: ${mismatchCount}\n` +
        `Missing: ${missingCount}\n\n` +
        `Check browser console for details.`
      );

    } catch (e) {
      console.error('Validation failed:', e);
      alert('Validation error: ' + e.message);
    }

    console.groupEnd();
  }

  /**
   * Run detailed validation with categorized output
   */
  function runDetailedValidation() {
    console.group('[DevTools] Detailed Validation');

    const StateManager = window.TEUI?.StateManager;
    const CI = window.TEUI?.ComputationIntegration;

    if (!StateManager) {
      console.error('StateManager not available');
      alert('Error: StateManager not loaded');
      console.groupEnd();
      return;
    }

    try {
      if (!CI?.isInitialized()) {
        CI?.initialize();
      }

      const graph = CI.getGraph();
      const state = CI.getState();
      const engine = CI.getEngine();
      const targetId = state.getActiveModelId();

      // Sync inputs from StateManager
      const inputIds = graph.getAllInputIds();
      for (const semanticPath of inputIds) {
        const inputNode = graph.getInput(semanticPath);
        const legacyId = inputNode?.legacyId;
        if (legacyId) {
          const value = StateManager.getValue(legacyId);
          if (value !== undefined && value !== null && value !== '') {
            state.setValueForModel(targetId, semanticPath, value);
            // Debug: log climate, ventilation, and occupancy inputs
            if (legacyId === 'd_19' || legacyId === 'h_19' || legacyId === 'h_20' ||
                legacyId === 'd_105' || legacyId === 'l_118' || legacyId === 'g_118' ||
                legacyId === 'i_63' || legacyId === 'j_63') {
              console.log(`[DEBUG] Synced ${semanticPath} (${legacyId}) = "${value}"`);
            }
          }
        }
      }

      // Compute
      engine.computeAllForModel(targetId);

      // Debug: show computed vs legacy HDD
      const computedHDD = state.getValue('climate.heating.degreedays');
      const legacyHDD = StateManager.getValue('d_20');
      console.log(`[DEBUG] HDD - Legacy d_20: ${legacyHDD}, Computed: ${computedHDD}`);

      // Compare and categorize
      const results = { matches: [], close: [], mismatches: [], missing: [] };
      const allNodeIds = graph.getAllNodeIds();

      for (const nodeId of allNodeIds) {
        const node = graph.getNode(nodeId);
        if (!node?.legacyId) continue;

        const oldValue = StateManager.getValue(node.legacyId);
        const newValue = state.getValue(nodeId);

        if (oldValue === undefined || oldValue === null || oldValue === '' ||
            oldValue === 'N/A' || newValue === undefined || newValue === null ||
            newValue === 'Unavailable') {
          results.missing.push({ nodeId, legacyId: node.legacyId, old: oldValue, new: newValue });
          continue;
        }

        const oldNum = parseFloat(String(oldValue).replace(/,/g, ''));
        const newNum = parseFloat(String(newValue));

        if (isNaN(oldNum) || isNaN(newNum)) {
          if (String(oldValue) === String(newValue)) {
            results.matches.push({ nodeId, legacyId: node.legacyId, old: oldValue, new: newValue });
          } else {
            results.mismatches.push({ nodeId, legacyId: node.legacyId, old: oldValue, new: newValue, diff: 'string' });
          }
        } else {
          const diff = Math.abs(oldNum - newNum);
          const relDiff = oldNum !== 0 ? (diff / Math.abs(oldNum)) * 100 : (diff === 0 ? 0 : 100);

          if (diff < 0.001 || relDiff < 0.01) {
            results.matches.push({ nodeId, legacyId: node.legacyId, old: oldValue, new: newValue });
          } else if (relDiff < 1) {
            results.close.push({ nodeId, legacyId: node.legacyId, old: oldNum, new: newNum, diff: relDiff.toFixed(2) + '%' });
          } else {
            results.mismatches.push({ nodeId, legacyId: node.legacyId, old: oldNum, new: newNum, diff: relDiff.toFixed(2) + '%' });
          }
        }
      }

      // Output
      console.log('=== VALIDATION SUMMARY ===');
      console.log('Matches:', results.matches.length);
      console.log('Close (<1%):', results.close.length);
      console.log('Mismatches:', results.mismatches.length);
      console.log('Missing:', results.missing.length);

      console.log('\n=== MISMATCHES ===');
      results.mismatches.forEach(m => console.log(`${m.nodeId} (${m.legacyId}): OLD=${m.old} | NEW=${m.new} | DIFF=${m.diff}`));

      console.log('\n=== CLOSE VALUES ===');
      results.close.forEach(m => console.log(`${m.nodeId} (${m.legacyId}): OLD=${m.old} | NEW=${m.new} | DIFF=${m.diff}`));

      console.log('\n=== MISSING ===');
      results.missing.forEach(m => console.log(`${m.nodeId} (${m.legacyId}): OLD=${m.old} | NEW=${m.new}`));

      alert(
        `Detailed Validation Complete\n\n` +
        `Matches: ${results.matches.length}\n` +
        `Close (<1%): ${results.close.length}\n` +
        `Mismatches: ${results.mismatches.length}\n` +
        `Missing: ${results.missing.length}\n\n` +
        `Check browser console for details.`
      );

    } catch (e) {
      console.error('Detailed validation failed:', e);
      alert('Error: ' + e.message);
    }

    console.groupEnd();
  }

  /**
   * Run the new computation system independently
   */
  function runNewSystem() {
    console.group('[DevTools] Running New Computation System');

    try {
      const CI = window.TEUI.ComputationIntegration;

      if (!CI?.isInitialized()) {
        console.log('Initializing...');
        CI.initialize();
      }

      // Re-sync from StateManager
      const StateManager = window.TEUI?.StateManager;
      const graph = CI.getGraph();
      const state = CI.getState();
      const engine = CI.getEngine();
      const targetId = state.getActiveModelId();

      if (StateManager) {
        const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
        let syncCount = 0;

        for (const semanticPath of inputIds) {
          const inputNode = graph.getInput(semanticPath);
          const legacyId = inputNode?.legacyId;

          if (legacyId) {
            const value = StateManager.getValue(legacyId);
            if (value !== undefined && value !== null && value !== '') {
              state.setValueForModel(targetId, semanticPath, value);
              syncCount++;
            }
          }
        }
        console.log(`Synced ${syncCount} values from StateManager`);
      }

      // Compute
      const result = engine.computeAllForModel(targetId);

      console.log('=== COMPUTATION RESULTS ===');
      console.log(`Nodes computed: ${result.computedNodes}`);
      console.log(`Duration: ${result.duration.toFixed(2)}ms`);
      console.log(`Speed: ${(result.computedNodes / result.duration * 1000).toFixed(0)} nodes/sec`);

      // Show key metrics
      console.log('\n=== KEY METRICS ===');
      console.log(`TEUI: ${state.getValue('energy.teui')?.toFixed(1) || 'N/A'} kWh/m²/yr`);
      console.log(`TEDI: ${state.getValue('energy.tedi')?.toFixed(1) || 'N/A'} kWh/m²/yr`);
      console.log(`GHGI: ${state.getValue('emissions.ghgi')?.toFixed(1) || 'N/A'} kgCO2e/m²/yr`);
      console.log(`Total Heat Loss: ${state.getValue('envelope.total.heatLoss')?.toFixed(0) || 'N/A'} kWh/yr`);

      alert(
        `New System Computed\n\n` +
        `Nodes: ${result.computedNodes}\n` +
        `Duration: ${result.duration.toFixed(2)}ms\n\n` +
        `TEUI: ${state.getValue('energy.teui')?.toFixed(1) || 'N/A'} kWh/m²/yr\n` +
        `TEDI: ${state.getValue('energy.tedi')?.toFixed(1) || 'N/A'} kWh/m²/yr\n` +
        `GHGI: ${state.getValue('emissions.ghgi')?.toFixed(1) || 'N/A'} kgCO2e/m²/yr\n\n` +
        `Check console for full details.`
      );

    } catch (e) {
      console.error('Computation failed:', e);
      alert('Error: ' + e.message);
    }

    console.groupEnd();
  }

  /**
   * Show debug info about both systems
   */
  function showDebugInfo() {
    console.group('[DevTools] Debug Info');

    try {
      const CI = window.TEUI.ComputationIntegration;
      const StateManager = window.TEUI?.StateManager;

      console.log('=== OLD SYSTEM (StateManager) ===');
      if (StateManager) {
        const values = StateManager.getAllValues ? StateManager.getAllValues() : {};
        console.log(`Total values: ${Object.keys(values).length}`);
      } else {
        console.log('Not available');
      }

      console.log('\n=== NEW SYSTEM ===');
      if (CI?.isInitialized()) {
        const stats = CI.getStats();
        console.log('Graph:', stats.graph);
        console.log('State:', stats.state);
        console.log('Engine:', stats.engine);

        // List all registered nodes
        const graph = CI.getGraph();
        const nodeStats = graph.getStats();
        console.log(`\nNodes: ${nodeStats.nodeCount}`);
        console.log(`Inputs: ${nodeStats.inputCount}`);
      } else {
        console.log('Not initialized');
      }

      alert(
        'Debug Info\n\n' +
        `StateManager: ${StateManager ? 'Available' : 'Not loaded'}\n` +
        `New System: ${CI?.isInitialized() ? 'Initialized' : 'Not initialized'}\n\n` +
        'Check browser console for details.'
      );

    } catch (e) {
      console.error('Debug failed:', e);
    }

    console.groupEnd();
  }

  /**
   * Debug a specific mismatch by showing its dependency chain
   * Usage: TEUI.DevTools.debugMismatch('mechanical.heating.copHeat')
   */
  function debugMismatch(nodeId) {
    console.group(`[DevTools] Debug Mismatch: ${nodeId}`);

    try {
      const CI = window.TEUI.ComputationIntegration;
      const StateManager = window.TEUI?.StateManager;
      const graph = CI.getGraph();
      const state = CI.getState();
      const node = graph.getNode(nodeId);

      if (!node) {
        console.error(`Node not found: ${nodeId}`);
        console.groupEnd();
        return;
      }

      console.log('=== NODE INFO ===');
      console.log(`ID: ${nodeId}`);
      console.log(`Legacy ID: ${node.legacyId}`);
      console.log(`Dependencies: ${node.dependencies?.join(', ') || 'none'}`);

      console.log('\n=== VALUES ===');
      const oldValue = StateManager?.getValue(node.legacyId);
      const newValue = state.getValue(nodeId);
      console.log(`Legacy (${node.legacyId}): ${oldValue}`);
      console.log(`Computed: ${newValue}`);

      if (node.dependencies?.length > 0) {
        console.log('\n=== DEPENDENCY VALUES ===');
        for (const depId of node.dependencies) {
          const depNode = graph.getNode(depId) || graph.getInput(depId);
          const depLegacyId = depNode?.legacyId;
          const depOld = depLegacyId ? StateManager?.getValue(depLegacyId) : 'N/A';
          const depNew = state.getValue(depId);
          const status = depOld == depNew ? '✓' : '✗';
          console.log(`${status} ${depId} (${depLegacyId || 'no legacyId'}): legacy=${depOld} | computed=${depNew}`);
        }
      }

    } catch (e) {
      console.error('Debug failed:', e);
    }

    console.groupEnd();
  }

  /**
   * Debug all mismatches at once - shows input sync issues
   */
  function debugAllMismatches() {
    console.group('[DevTools] Debug All Mismatches');

    try {
      const CI = window.TEUI.ComputationIntegration;
      const StateManager = window.TEUI?.StateManager;
      const graph = CI.getGraph();
      const state = CI.getState();

      // Find input sync issues
      console.log('=== INPUT SYNC STATUS ===');
      const inputIds = graph.getAllInputIds();
      let syncIssues = 0;

      for (const semanticPath of inputIds) {
        const inputNode = graph.getInput(semanticPath);
        const legacyId = inputNode?.legacyId;
        if (!legacyId) continue;

        const legacyValue = StateManager?.getValue(legacyId);
        const stateValue = state.getValue(semanticPath);

        // Check for sync issues
        if (legacyValue !== undefined && legacyValue !== null && legacyValue !== '') {
          if (String(legacyValue) !== String(stateValue)) {
            console.log(`✗ ${semanticPath} (${legacyId}): legacy="${legacyValue}" | state="${stateValue}"`);
            syncIssues++;
          }
        }
      }

      if (syncIssues === 0) {
        console.log('All inputs synced correctly!');
      } else {
        console.log(`\n${syncIssues} input sync issues found`);
      }

    } catch (e) {
      console.error('Debug failed:', e);
    }

    console.groupEnd();
  }

  // Auto-initialize
  initialize();

  // Export for manual use
  window.TEUI.DevTools = {
    runValidation,
    runDetailedValidation,
    runNewSystem,
    showDebugInfo,
    debugMismatch,
    debugAllMismatches
  };

  console.log('[DevTools] Module loaded');
})();
