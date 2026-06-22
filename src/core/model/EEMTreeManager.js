/**
 * EEMTreeManager.js - Energy Efficiency Measures Tree Management
 *
 * Implements a tree structure for EEMs with prototypal inheritance.
 * Child EEMs inherit parent values via Object.create(), so a child
 * automatically traverses up to the parent for unoverridden values.
 *
 * Features:
 * - Hierarchical inheritance (child overrides parent)
 * - Active EEM pointer for UI/state interactions
 * - Multiple baselines (each EEM can reference another EEM as baseline)
 * - Integration with StateManager, DOMBridge, and Calculator
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  // ============================================================================
  // EEM NODE CLASS
  // ============================================================================

  let nextEemId = 1;

  /**
   * Create a unique EEM ID
   * @returns {string}
   */
  function generateEemId() {
    return `eem-${nextEemId++}`;
  }

  /**
   * Reset ID counter (for testing)
   */
  function resetEemIdCounter() {
    nextEemId = 1;
  }

  /**
   * Create an EEM Node
   * @param {Object} options
   * @param {string} options.name - Display name
   * @param {EEMNode|null} options.parent - Parent node (null for root)
   * @param {string|null} options.baselineId - ID of the EEM to use as baseline
   * @returns {EEMNode}
   */
  function createEEMNode(options = {}) {
    const id = generateEemId();
    const name = options.name || "Untitled EEM";
    const parent = options.parent || null;
    const baselineId = options.baselineId || null;

    // Prototypal inheritance: child state inherits from parent state.
    // If the child doesn't have a value, JS automatically traverses up.
    const state = parent ? Object.create(parent.state) : Object.create(null);

    const children = [];

    const node = {
      id,
      name,
      parent,
      baselineId,
      state,
      children,

      /**
       * Get a value from this EEM's state (with prototypal lookup)
       * @param {string} fieldId
       * @returns {any}
       */
      getValue(fieldId) {
        return state[fieldId] !== undefined ? state[fieldId] : null;
      },

      /**
       * Set a value directly on this EEM (overriding parent)
       * @param {string} fieldId
       * @param {any} value
       */
      setValue(fieldId, value) {
        state[fieldId] = value;
      },

      /**
       * Check if this EEM has its own override for a field
       * @param {string} fieldId
       * @returns {boolean}
       */
      hasOwnValue(fieldId) {
        return Object.prototype.hasOwnProperty.call(state, fieldId);
      },

      /**
       * Remove this EEM's override, reverting to parent's value
       * @param {string} fieldId
       */
      revertToParent(fieldId) {
        if (Object.prototype.hasOwnProperty.call(state, fieldId)) {
          delete state[fieldId];
        }
      },

      /**
       * Get all own (overridden) field IDs
       * @returns {string[]}
       */
      getOwnFieldIds() {
        return Object.keys(state);
      },

      /**
       * Add a child EEM node
       * @param {EEMNode} child
       */
      addChild(child) {
        children.push(child);
      },

      /**
       * Remove a child EEM node
       * @param {string} childId
       * @returns {boolean}
       */
      removeChild(childId) {
        const idx = children.findIndex(c => c.id === childId);
        if (idx >= 0) {
          children.splice(idx, 1);
          return true;
        }
        return false;
      },
    };

    // Register as child of parent
    if (parent) {
      parent.addChild(node);
    }

    return node;
  }

  // ============================================================================
  // EEM TREE MANAGER
  // ============================================================================

  /**
   * Create an EEM Tree Manager
   * @returns {EEMTreeManager}
   */
  function createEEMTreeManager() {
    let root = null;
    let activeEEM = null;
    const nodesById = new Map();
    const listeners = new Set();

    // ========================================================================
    // TREE OPERATIONS
    // ========================================================================

    /**
     * Initialize the tree with a root node (base building data)
     * @param {string} name - Root node name
     * @returns {EEMNode}
     */
    function initRoot(name = "Base Building") {
      root = createEEMNode({ name, parent: null, baselineId: null });
      nodesById.set(root.id, root);
      activeEEM = root;
      notifyListeners("init", root);
      return root;
    }

    /**
     * Create a child EEM under a parent
     * @param {string} parentId - Parent EEM ID
     * @param {string} name - Child name
     * @param {string|null} baselineId - Baseline EEM ID (defaults to parent)
     * @returns {EEMNode|null}
     */
    function createChild(parentId, name, baselineId = null) {
      const parent = nodesById.get(parentId);
      if (!parent) {
        console.warn(`[EEMTreeManager] Parent node not found: ${parentId}`);
        return null;
      }

      const child = createEEMNode({
        name,
        parent,
        baselineId: baselineId || parentId,
      });

      nodesById.set(child.id, child);
      notifyListeners("create", child);
      return child;
    }

    /**
     * Remove an EEM node and its subtree
     * @param {string} nodeId
     * @returns {boolean}
     */
    function removeNode(nodeId) {
      const node = nodesById.get(nodeId);
      if (!node) return false;
      if (node === root) {
        console.warn("[EEMTreeManager] Cannot remove root node");
        return false;
      }

      // Remove subtree recursively
      function removeSubtree(n) {
        for (const child of [...n.children]) {
          removeSubtree(child);
        }
        nodesById.delete(n.id);
      }
      removeSubtree(node);

      // Remove from parent
      if (node.parent) {
        node.parent.removeChild(nodeId);
      }

      // If active was removed, fall back to parent or root
      if (activeEEM && !nodesById.has(activeEEM.id)) {
        activeEEM = node.parent || root;
      }

      notifyListeners("remove", node);
      return true;
    }

    /**
     * Get a node by ID
     * @param {string} nodeId
     * @returns {EEMNode|null}
     */
    function getNode(nodeId) {
      return nodesById.get(nodeId) || null;
    }

    /**
     * Get the root node
     * @returns {EEMNode|null}
     */
    function getRoot() {
      return root;
    }

    /**
     * Get all nodes as a flat array
     * @returns {EEMNode[]}
     */
    function getAllNodes() {
      return Array.from(nodesById.values());
    }

    // ========================================================================
    // ACTIVE EEM MANAGEMENT
    // ========================================================================

    /**
     * Set the active EEM
     * @param {string} nodeId
     * @returns {boolean}
     */
    function setActiveEEM(nodeId) {
      const node = nodesById.get(nodeId);
      if (!node) return false;

      const prev = activeEEM;
      activeEEM = node;
      notifyListeners("activate", node, prev);
      return true;
    }

    /**
     * Get the active EEM
     * @returns {EEMNode|null}
     */
    function getActiveEEM() {
      return activeEEM;
    }

    // ========================================================================
    // BASELINE OPERATIONS
    // ========================================================================

    /**
     * Get the baseline EEM for a given node
     * @param {string} nodeId
     * @returns {EEMNode|null}
     */
    function getBaseline(nodeId) {
      const node = nodesById.get(nodeId);
      if (!node) return null;

      if (node.baselineId) {
        return nodesById.get(node.baselineId) || null;
      }

      // Default: parent is baseline
      return node.parent || null;
    }

    /**
     * Set the baseline for an EEM
     * @param {string} nodeId - The EEM to update
     * @param {string} baselineId - The EEM to use as baseline
     * @returns {boolean}
     */
    function setBaseline(nodeId, baselineId) {
      const node = nodesById.get(nodeId);
      const baseline = nodesById.get(baselineId);
      if (!node || !baseline) return false;

      node.baselineId = baselineId;
      notifyListeners("baseline-change", node);
      return true;
    }

    // ========================================================================
    // STATE INTEGRATION
    // ========================================================================

    /**
     * Write a value to the active EEM's state.
     * Called by StateManager when a user modifies an input.
     * @param {string} fieldId
     * @param {any} value
     */
    function setValueForActiveEEM(fieldId, value) {
      if (!activeEEM) return;
      activeEEM.setValue(fieldId, value);
    }

    /**
     * Read a value from the active EEM's state (with inheritance).
     * @param {string} fieldId
     * @returns {any}
     */
    function getValueFromActiveEEM(fieldId) {
      if (!activeEEM) return null;
      return activeEEM.getValue(fieldId);
    }

    // ========================================================================
    // LISTENERS
    // ========================================================================

    /**
     * Add a change listener
     * @param {Function} listener - Called with (eventType, node, extra)
     */
    function addListener(listener) {
      listeners.add(listener);
    }

    /**
     * Remove a change listener
     * @param {Function} listener
     */
    function removeListener(listener) {
      listeners.delete(listener);
    }

    /**
     * Notify all listeners
     */
    function notifyListeners(eventType, node, extra) {
      for (const listener of listeners) {
        try {
          listener(eventType, node, extra);
        } catch (e) {
          console.error("[EEMTreeManager] Listener error:", e);
        }
      }
    }

    // ========================================================================
    // SERIALIZATION
    // ========================================================================

    /**
     * Serialize the tree to a plain object (for save/load)
     * @returns {Object}
     */
    function serialize() {
      function serializeNode(node) {
        return {
          id: node.id,
          name: node.name,
          baselineId: node.baselineId,
          ownState: Object.fromEntries(
            Object.keys(node.state)
              .filter(k => Object.prototype.hasOwnProperty.call(node.state, k))
              .map(k => [k, node.state[k]])
          ),
          children: node.children.map(serializeNode),
        };
      }

      return {
        root: root ? serializeNode(root) : null,
        activeEEMId: activeEEM ? activeEEM.id : null,
      };
    }

    // ========================================================================
    // EXPORT API
    // ========================================================================

    return {
      // Tree operations
      initRoot,
      createChild,
      removeNode,
      getNode,
      getRoot,
      getAllNodes,

      // Active EEM
      setActiveEEM,
      getActiveEEM,

      // Baselines
      getBaseline,
      setBaseline,

      // State integration
      setValueForActiveEEM,
      getValueFromActiveEEM,

      // Listeners
      addListener,
      removeListener,

      // Serialization
      serialize,
    };
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  window.TEUI.EEMTreeManager = {
    create: createEEMTreeManager,
    createNode: createEEMNode,
    resetIdCounter: resetEemIdCounter,
  };

  console.log("[EEMTreeManager] Module loaded");
})();
