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

    if (nodes.Climate) {
      nodes.Climate.register(g);
      log("Registered ClimateNodes");
    }

    if (nodes.Envelope) {
      nodes.Envelope.register(g);
      log("Registered EnvelopeNodes");
    }

    if (nodes.Mechanical) {
      nodes.Mechanical.register(g);
      log("Registered MechanicalNodes");
    }

    if (nodes.Energy) {
      nodes.Energy.register(g);
      log("Registered EnergyNodes");
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
          const refLegacyId = "ref_" + legacyId;
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
   * @param {string} [containerSelector] - CSS selector for container
   */
  function enableDOMBridge(containerSelector = "[data-render-section]") {
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

      // Find and bind all field elements
      const containers = document.querySelectorAll(containerSelector);
      let boundCount = 0;

      containers.forEach(container => {
        const inputs = container.querySelectorAll("input, select");
        inputs.forEach(el => {
          const fieldId = el.id || el.dataset.fieldId;
          if (fieldId) {
            domBridge.bind(fieldId, el);
            boundCount++;
          }
        });
      });

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

    // Computation
    computeAll,

    // Configuration
    getConfig,
    setConfig,

    // Debug
    getStats,
    debug
  };

  log("Module loaded");
})();
