/**
 * ComputationIntegration.js - Wire New Computation System into Calculator
 *
 * Part of the Multi-Model Architecture refactoring (Phase 4)
 * See: docs/REFACTORING_PLAN.md
 *
 * This module integrates the new incremental computation system
 * with the existing calculator, running both systems in parallel
 * for validation before full migration.
 *
 * Usage:
 *   // After existing init completes:
 *   TEUI.ComputationIntegration.initialize();
 *
 *   // To enable LegacyAdapter (intercept StateManager):
 *   TEUI.ComputationIntegration.enableAdapter();
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  // ============================================================================
  // STATE
  // ============================================================================

  let initialized = false;
  let graph = null;
  let state = null;
  let engine = null;
  let adapter = null;
  let domBridge = null;

  // Configuration
  const config = {
    enableLogging: true,
    runInParallel: true,      // Run both old and new systems
    validateResults: false,   // Compare old vs new (expensive)
    autoSync: true            // Auto-sync from StateManager on init
  };

  // ============================================================================
  // LOGGING
  // ============================================================================

  function log(msg, ...args) {
    if (config.enableLogging) {
      console.log(`[ComputationIntegration] ${msg}`, ...args);
    }
  }

  function warn(msg, ...args) {
    console.warn(`[ComputationIntegration] ${msg}`, ...args);
  }

  function error(msg, ...args) {
    console.error(`[ComputationIntegration] ${msg}`, ...args);
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize the new computation system
   * @param {Object} options - Configuration options
   * @returns {boolean} - Success status
   */
  function initialize(options = {}) {
    if (initialized) {
      warn("Already initialized");
      return true;
    }

    Object.assign(config, options);

    log("Initializing new computation system...");

    try {
      // Step 1: Create computation graph
      graph = createGraph();
      if (!graph) {
        error("Failed to create computation graph");
        return false;
      }

      // Step 1.5: Populate FieldRegistry from graph (enables semantic path lookups)
      const FieldRegistry = window.TEUI.FieldRegistry;
      if (FieldRegistry?.populateFromGraph) {
        const fieldCount = FieldRegistry.populateFromGraph(graph);
        log(`FieldRegistry populated with ${fieldCount} additional fields from graph`);
      }

      // Step 2: Create multi-model state
      state = createState();
      if (!state) {
        error("Failed to create multi-model state");
        return false;
      }

      // Step 3: Create computation engine
      engine = createEngine();
      if (!engine) {
        error("Failed to create computation engine");
        return false;
      }

      // Step 4: Sync initial values from StateManager
      if (config.autoSync) {
        syncFromStateManager();
      }

      // Step 5: Run initial computation
      const result = engine.computeAllForModel(state.getActiveModelId());
      log(`Initial computation complete: ${result.computedNodes} nodes in ${result.duration.toFixed(2)}ms`);

      initialized = true;
      log("Initialization complete");

      // Expose for debugging
      window.TEUI.ComputationSystem = {
        graph,
        state,
        engine,
        getAdapter: () => adapter,
        getDOMBridge: () => domBridge
      };

      return true;
    } catch (e) {
      error("Initialization failed:", e);
      return false;
    }
  }

  /**
   * Create and configure the computation graph
   */
  function createGraph() {
    const ComputationGraph = window.TEUI.ComputationGraph;
    if (!ComputationGraph) {
      error("ComputationGraph module not loaded");
      return null;
    }

    const g = ComputationGraph.create();

    // Register all section nodes
    const nodes = window.TEUI.ComputationNodes || {};

    // Core infrastructure nodes
    if (nodes.Climate) {
      nodes.Climate.register(g);
      log("Registered ClimateNodes");
    }

    if (nodes.BuildingInfo) {
      nodes.BuildingInfo.register(g);
      log("Registered BuildingInfoNodes");
    }

    // EnvelopeNodes removed - consolidated into TransmissionLossNodes + VolumeMetricsNodes

    if (nodes.Mechanical) {
      nodes.Mechanical.register(g);
      log("Registered MechanicalNodes");
    }

    // Energy system nodes
    if (nodes.SpaceHeating) {
      nodes.SpaceHeating.register(g);
      log("Registered SpaceHeatingNodes");
    }

    if (nodes.WaterHeating) {
      nodes.WaterHeating.register(g);
      log("Registered WaterHeatingNodes");
    }

    if (nodes.Renewable) {
      nodes.Renewable.register(g);
      log("Registered RenewableNodes");
    }

    if (nodes.Energy) {
      nodes.Energy.register(g);
      log("Registered EnergyNodes");
    }

    // Emissions and carbon nodes
    if (nodes.Forestry) {
      nodes.Forestry.register(g);
      log("Registered ForestryNodes");
    }

    if (nodes.Emissions) {
      nodes.Emissions.register(g);
      log("Registered EmissionsNodes");
    }

    // Building use nodes
    if (nodes.Occupancy) {
      nodes.Occupancy.register(g);
      log("Registered OccupancyNodes");
    }

    // Envelope gains and losses (S10, S11)
    if (nodes.RadiantGains) {
      nodes.RadiantGains.register(g);
      log("Registered RadiantGainsNodes");
    }

    if (nodes.TransmissionLoss) {
      nodes.TransmissionLoss.register(g);
      log("Registered TransmissionLossNodes");
    }

    // Volume metrics and air leakage (S12)
    if (nodes.VolumeMetrics) {
      nodes.VolumeMetrics.register(g);
      log("Registered VolumeMetricsNodes");
    }

    // Ventilation and mechanical (S13)
    if (nodes.Ventilation) {
      nodes.Ventilation.register(g);
      log("Registered VentilationNodes");
    }

    // Dashboard consumer node (depends on all others)
    if (nodes.KeyValues) {
      nodes.KeyValues.register(g);
      log("Registered KeyValuesNodes");
    }

    const stats = g.getStats();
    log(`Graph created: ${stats.nodeCount} nodes, ${stats.inputCount} inputs`);

    return g;
  }

  /**
   * Create multi-model state with Target and Reference models
   */
  function createState() {
    const MultiModelState = window.TEUI.MultiModelState;
    const ModelMetadata = window.TEUI.ModelMetadata;

    if (!MultiModelState || !ModelMetadata) {
      error("MultiModelState or ModelMetadata not loaded");
      return null;
    }

    const s = MultiModelState.create();

    // Create Target model (active by default)
    const targetMeta = ModelMetadata.createTarget("Target Building");
    s.addModel(targetMeta);

    // Create Reference model
    const refMeta = ModelMetadata.createReference("Reference Building");
    s.addModel(refMeta);

    log("Created Target and Reference models");

    return s;
  }

  /**
   * Create computation engine
   */
  function createEngine() {
    const MultiModelEngine = window.TEUI.MultiModelEngine;

    if (!MultiModelEngine) {
      error("MultiModelEngine not loaded");
      return null;
    }

    return MultiModelEngine.create({ state, graph });
  }

  /**
   * Sync values from existing StateManager to new state
   */
  function syncFromStateManager() {
    const StateManager = window.TEUI.StateManager;

    if (!StateManager) {
      warn("StateManager not available for sync");
      return;
    }

    log("Syncing from StateManager...");

    const targetId = state.getActiveModelId();
    let syncCount = 0;

    // Get all registered input IDs and use their legacyId property
    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];

    for (const semanticPath of inputIds) {
      // Get the input node to access its legacyId
      const inputNode = graph.getInput(semanticPath);
      const legacyId = inputNode?.legacyId;

      if (legacyId) {
        const value = StateManager.getValue(legacyId);
        if (value !== undefined && value !== null && value !== "") {
          state.setValueForModel(targetId, semanticPath, value);
          syncCount++;
        }
      }
    }

    // Also sync Reference model
    const refModelId = getRefModelId();
    if (refModelId) {
      let refSyncCount = 0;
      for (const semanticPath of inputIds) {
        const inputNode = graph.getInput(semanticPath);
        const legacyId = inputNode?.legacyId;

        if (legacyId) {
          // Reference values use ref_ prefix
          // Don't add ref_ prefix if legacyId already starts with ref_
          const refLegacyId = legacyId.startsWith("ref_") ? legacyId : "ref_" + legacyId;
          const value = StateManager.getValue(refLegacyId);
          if (value !== undefined && value !== null && value !== "") {
            state.setValueForModel(refModelId, semanticPath, value);
            refSyncCount++;
          }
        }
      }
      if (refSyncCount > 0) {
        log(`Synced ${refSyncCount} reference values`);
      }
    }

    log(`Synced ${syncCount} values from StateManager`);
  }

  /**
   * Sync computed values FROM ComputationGraph back TO StateManager
   * This keeps StateManager in sync when bypassing legacy calculations
   */
  function syncToStateManager() {
    const StateManager = window.TEUI.StateManager;
    const FieldRegistry = window.TEUI.FieldRegistry;

    if (!StateManager) {
      warn("StateManager not available for sync");
      return;
    }

    const targetId = state.getActiveModelId();
    let syncCount = 0;

    // Get all computed node IDs and sync their values to StateManager
    const nodeIds = graph.getAllNodeIds ? graph.getAllNodeIds() : [];

    for (const semanticPath of nodeIds) {
      const node = graph.getNode(semanticPath);
      const legacyId = node?.legacyId;

      if (legacyId) {
        const value = state.getValue(semanticPath);
        if (value !== undefined && value !== null) {
          // Don't trigger recalculation - just set the value
          StateManager.setValue(legacyId, value, "computed");
          syncCount++;
        }
      }
    }

    // Also sync input values that may have been normalized
    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];

    for (const semanticPath of inputIds) {
      const inputNode = graph.getInput(semanticPath);
      const legacyId = inputNode?.legacyId;

      if (legacyId) {
        const value = state.getValue(semanticPath);
        if (value !== undefined && value !== null) {
          StateManager.setValue(legacyId, value, "computed");
          syncCount++;
        }
      }
    }

    log(`Synced ${syncCount} computed values to StateManager`);
  }

  /**
   * Get Reference model ID
   */
  function getRefModelId() {
    if (!state) return null;
    const models = state.getAllModels();
    const refModel = models.find(m => m.modelType === "reference");
    return refModel?.id || null;
  }

  // ============================================================================
  // LEGACY ADAPTER
  // ============================================================================

  /**
   * Enable LegacyAdapter to intercept StateManager calls
   * This makes the new system the primary computation engine
   */
  function enableAdapter() {
    if (!initialized) {
      error("Must initialize before enabling adapter");
      return false;
    }

    if (adapter) {
      warn("Adapter already enabled");
      return true;
    }

    const LegacyAdapter = window.TEUI.LegacyAdapter;
    if (!LegacyAdapter) {
      error("LegacyAdapter module not loaded");
      return false;
    }

    try {
      adapter = LegacyAdapter.create({ state, engine, graph });
      adapter.install();
      log("LegacyAdapter installed - intercepting StateManager");
      return true;
    } catch (e) {
      error("Failed to enable adapter:", e);
      return false;
    }
  }

  /**
   * Disable LegacyAdapter and restore original StateManager
   */
  function disableAdapter() {
    if (adapter) {
      adapter.uninstall();
      adapter = null;
      log("LegacyAdapter uninstalled - StateManager restored");
    }
  }

  // ============================================================================
  // DOM BRIDGE
  // ============================================================================

  /**
   * Enable DOMBridge for automatic DOM synchronization
   * @param {string} [containerSelector] - CSS selector for container (optional)
   */
  function enableDOMBridge(containerSelector) {
    if (!initialized) {
      error("Must initialize before enabling DOMBridge");
      return false;
    }

    if (domBridge) {
      warn("DOMBridge already enabled");
      return true;
    }

    const DOMBridge = window.TEUI.DOMBridge;
    if (!DOMBridge) {
      error("DOMBridge module not loaded");
      return false;
    }

    try {
      domBridge = DOMBridge.create({ state, engine });

      // Bind ALL elements with data-field-id attribute (inputs, outputs, displays)
      // This includes Key Values table cells, computed result displays, etc.
      const allFieldElements = document.querySelectorAll("[data-field-id]");
      let boundCount = 0;

      allFieldElements.forEach(el => {
        const fieldId = el.dataset.fieldId;
        if (fieldId) {
          domBridge.bind(el, fieldId);
          boundCount++;
        }
      });

      // Also bind elements in specific containers if provided
      if (containerSelector) {
        const containers = document.querySelectorAll(containerSelector);
        containers.forEach(container => {
          const inputs = container.querySelectorAll("input[id], select[id]");
          inputs.forEach(el => {
            if (el.id && !el.dataset.fieldId) {
              domBridge.bind(el, el.id);
              boundCount++;
            }
          });
        });
      }

      domBridge.connect();
      log(`DOMBridge enabled - bound ${boundCount} elements`);
      return true;
    } catch (e) {
      error("Failed to enable DOMBridge:", e);
      return false;
    }
  }

  /**
   * Disable DOMBridge
   */
  function disableDOMBridge() {
    if (domBridge) {
      domBridge.destroy();
      domBridge = null;
      log("DOMBridge disabled");
    }
  }

  // ============================================================================
  // VALUE CHANGE HANDLING
  // ============================================================================

  /**
   * Handle a value change from the old system
   * Used when running in parallel mode
   * @param {string} legacyId - Legacy field ID (e.g., "d_12")
   * @param {*} value - New value
   */
  function onLegacyValueChange(legacyId, value) {
    if (!initialized || !config.runInParallel) return;

    const FieldRegistry = window.TEUI.FieldRegistry;
    const semanticPath = FieldRegistry?.toSemantic(legacyId);

    if (semanticPath) {
      // Update new system
      const result = engine.onValueChange(semanticPath, value);

      if (config.validateResults) {
        validateAgainstOldSystem(result.computedNodes);
      }
    }
  }

  /**
   * Validate new system results against old system
   * @param {string[]} computedPaths - Paths that were computed
   */
  function validateAgainstOldSystem(computedPaths) {
    const StateManager = window.TEUI.StateManager;
    const FieldRegistry = window.TEUI.FieldRegistry;

    if (!StateManager || !FieldRegistry) return;

    const mismatches = [];

    for (const path of computedPaths) {
      const newValue = state.getValue(path);
      const legacyId = FieldRegistry.toLegacy(path);

      if (legacyId) {
        const oldValue = StateManager.getValue(legacyId);

        if (oldValue !== undefined && oldValue !== null) {
          const oldNum = parseFloat(oldValue);
          const newNum = parseFloat(newValue);

          if (!isNaN(oldNum) && !isNaN(newNum)) {
            const diff = Math.abs(oldNum - newNum);
            if (diff > 0.01 && diff / Math.abs(oldNum) > 0.01) {
              mismatches.push({ path, legacyId, oldValue, newValue });
            }
          }
        }
      }
    }

    if (mismatches.length > 0) {
      warn("Validation mismatches:", mismatches);
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Get the computation graph
   */
  function getGraph() {
    return graph;
  }

  /**
   * Get the multi-model state
   */
  function getState() {
    return state;
  }

  /**
   * Get the computation engine
   */
  function getEngine() {
    return engine;
  }

  /**
   * Check if initialized
   */
  function isInitialized() {
    return initialized;
  }

  /**
   * Get configuration
   */
  function getConfig() {
    return { ...config };
  }

  /**
   * Update configuration
   */
  function setConfig(newConfig) {
    Object.assign(config, newConfig);
  }

  /**
   * Manually trigger computation for all models
   */
  function computeAll() {
    if (!initialized) {
      error("Not initialized");
      return null;
    }
    return engine.computeAll();
  }

  /**
   * Get statistics
   */
  function getStats() {
    if (!initialized) return null;

    return {
      graph: graph.getStats(),
      state: state.getStats(),
      engine: engine.getStats()
    };
  }

  /**
   * Debug output
   */
  function debug() {
    if (!initialized) {
      console.log("[ComputationIntegration] Not initialized");
      return;
    }

    console.group("[ComputationIntegration] Debug");
    console.log("Config:", config);
    console.log("Graph:", graph.getStats());
    console.log("State:", state.getStats());
    console.log("Engine:", engine.getStats());
    console.log("Adapter:", adapter ? "installed" : "not installed");
    console.log("DOMBridge:", domBridge ? "enabled" : "not enabled");
    console.groupEnd();
  }

  // ============================================================================
  // REFERENCE MODEL POPULATION
  // ============================================================================

  /**
   * Populate Reference model inputs from ReferenceValues.js
   * This eliminates dependency on legacy Section calculations for Reference model
   *
   * Strategy:
   * 1. G-fields (geometry/climate): Copy from Target model
   * 2. C-fields (code/performance): Load from ReferenceValues.js based on selected standard
   */
  function populateReferenceModel() {
    const StateManager = window.TEUI.StateManager;
    const ReferenceValues = window.TEUI.ReferenceValues;

    if (!StateManager || !ReferenceValues) {
      warn("StateManager or ReferenceValues not available for Reference population");
      return { gFieldsCopied: 0, cFieldsLoaded: 0, debug: null };
    }

    const refModelId = getRefModelId();
    if (!refModelId) {
      warn("No Reference model found");
      return { gFieldsCopied: 0, cFieldsLoaded: 0, debug: null };
    }

    const targetId = state.getActiveModelId();

    // Get selected reference standard (d_13 contains the standard name)
    const standardName = StateManager.getValue("d_13") || "OBC SB12 3.1.1.2.C4";
    const standardValues = ReferenceValues[standardName] || ReferenceValues["OBC SB12 3.1.1.2.C4"];

    if (!standardValues) {
      warn(`Reference standard "${standardName}" not found, using OBC SB12 default`);
    }

    log(`Populating Reference model from standard: ${standardName}`);

    let gFieldsCopied = 0;
    let cFieldsLoaded = 0;

    // Debug tracking
    const debug = {
      standardName,
      gFields: [],
      cFieldsFromStandard: [],
      cFieldsFromStateManager: [],
      cFieldsCopiedFromTarget: [],
      cFieldsMissing: []
    };

    // Get all registered inputs
    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];

    for (const semanticPath of inputIds) {
      const inputNode = graph.getInput(semanticPath);
      if (!inputNode) continue;

      const legacyId = inputNode.legacyId;
      const classification = inputNode.classification || "C";

      if (classification === "G") {
        // G-field: Copy value from Target model
        const targetValue = state.getValueForModel(targetId, semanticPath);
        if (targetValue !== undefined && targetValue !== null) {
          state.setValueForModel(refModelId, semanticPath, targetValue);
          gFieldsCopied++;
          debug.gFields.push({ legacyId, semanticPath, value: targetValue });
        }
      } else {
        // C-field: Load from ReferenceValues.js if available, otherwise copy from Target
        if (legacyId && standardValues && standardValues[legacyId] !== undefined) {
          const stdValue = standardValues[legacyId];
          state.setValueForModel(refModelId, semanticPath, stdValue);
          cFieldsLoaded++;
          debug.cFieldsFromStandard.push({ legacyId, semanticPath, value: stdValue });
        } else {
          // Fallback: Use ref_legacyId from StateManager or copy from Target
          // Don't add ref_ prefix if legacyId already starts with ref_
          const refLegacyId = legacyId.startsWith("ref_") ? legacyId : "ref_" + legacyId;
          const refValue = StateManager.getValue(refLegacyId);
          if (refValue !== undefined && refValue !== null && refValue !== "") {
            state.setValueForModel(refModelId, semanticPath, refValue);
            debug.cFieldsFromStateManager.push({ legacyId, semanticPath, value: refValue });
          } else {
            // Last resort: copy from Target (shared input)
            const targetValue = state.getValueForModel(targetId, semanticPath);
            if (targetValue !== undefined && targetValue !== null) {
              state.setValueForModel(refModelId, semanticPath, targetValue);
              debug.cFieldsCopiedFromTarget.push({ legacyId, semanticPath, value: targetValue });
            } else {
              debug.cFieldsMissing.push({ legacyId, semanticPath });
            }
          }
        }
      }
    }

    log(`Reference model populated: ${gFieldsCopied} G-fields copied, ${cFieldsLoaded} C-fields from standard`);
    log(`  - C-fields from StateManager: ${debug.cFieldsFromStateManager.length}`);
    log(`  - C-fields copied from Target: ${debug.cFieldsCopiedFromTarget.length}`);
    log(`  - C-fields missing: ${debug.cFieldsMissing.length}`);

    // CRITICAL: Copy reference.* inputs to Target model state
    // This allows nodes like keyValues.reference.teui to access Reference inputs
    // when computing in the Target model context
    let refInputsCopiedToTarget = 0;
    for (const semanticPath of inputIds) {
      if (semanticPath.startsWith("reference.")) {
        const refValue = state.getValueForModel(refModelId, semanticPath);
        if (refValue !== undefined && refValue !== null) {
          state.setValueForModel(targetId, semanticPath, refValue);
          refInputsCopiedToTarget++;
        }
      }
    }
    log(`  - reference.* inputs copied to Target: ${refInputsCopiedToTarget}`);

    return { gFieldsCopied, cFieldsLoaded, refInputsCopiedToTarget, debug };
  }

  /**
   * Compute both Target and Reference models
   * Returns combined results
   */
  function computeAllWithReference() {
    if (!initialized) {
      error("Not initialized");
      return null;
    }

    const targetId = state.getActiveModelId();
    const refModelId = getRefModelId();

    // Compute Target model
    const targetResult = engine.computeAllForModel(targetId);

    // Compute Reference model if it exists
    let refResult = null;
    if (refModelId) {
      refResult = engine.computeAllForModel(refModelId);
    }

    return {
      target: targetResult,
      reference: refResult,
      totalComputed: (targetResult?.computedNodes || 0) + (refResult?.computedNodes || 0),
      totalDuration: (targetResult?.duration || 0) + (refResult?.duration || 0)
    };
  }

  /**
   * Sync Reference computed values back to StateManager
   */
  function syncReferenceToStateManager() {
    const StateManager = window.TEUI.StateManager;

    if (!StateManager) {
      warn("StateManager not available for Reference sync");
      return 0;
    }

    const refModelId = getRefModelId();
    if (!refModelId) return 0;

    let syncCount = 0;

    // Sync computed nodes
    const nodeIds = graph.getAllNodeIds ? graph.getAllNodeIds() : [];

    for (const semanticPath of nodeIds) {
      const node = graph.getNode(semanticPath);
      const legacyId = node?.legacyId;

      if (legacyId) {
        const value = state.getValueForModel(refModelId, semanticPath);
        if (value !== undefined && value !== null) {
          // Reference values use ref_ prefix
          StateManager.setValue("ref_" + legacyId, value, "computed");
          syncCount++;
        }
      }
    }

    // Sync input values
    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];

    for (const semanticPath of inputIds) {
      const inputNode = graph.getInput(semanticPath);
      const legacyId = inputNode?.legacyId;

      if (legacyId) {
        const value = state.getValueForModel(refModelId, semanticPath);
        if (value !== undefined && value !== null) {
          StateManager.setValue("ref_" + legacyId, value, "computed");
          syncCount++;
        }
      }
    }

    log(`Synced ${syncCount} Reference values to StateManager`);
    return syncCount;
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  window.TEUI.ComputationIntegration = {
    initialize,
    isInitialized,

    // Core access
    getGraph,
    getState,
    getEngine,

    // Adapter control
    enableAdapter,
    disableAdapter,

    // DOM Bridge control
    enableDOMBridge,
    disableDOMBridge,

    // Parallel mode
    onLegacyValueChange,

    // Sync from StateManager (call after CSV import, file load, etc.)
    syncFromStateManager,

    // Sync TO StateManager (call after computeAll when bypassing legacy)
    syncToStateManager,

    // Reference model support
    populateReferenceModel,
    syncReferenceToStateManager,

    // Computation
    computeAll,
    computeAllWithReference,

    // Configuration
    getConfig,
    setConfig,

    // Debug
    getStats,
    debug
  };

  log("Module loaded");
})();
