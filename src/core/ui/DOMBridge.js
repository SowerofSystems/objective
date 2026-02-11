/**
 * DOMBridge.js - Connects DOM Elements to Multi-Model Computation Engine
 *
 * Part of the Multi-Model Architecture refactoring (Phase 4, Task 4.4)
 * See: docs/REFACTORING_PLAN.md
 *
 * Key architecture change:
 * - DOM is INPUT SOURCE (captures user edits) and OUTPUT SINK (displays values)
 * - Computation is driven by DEPENDENCY GRAPH, not DOM events
 * - DOM changes trigger engine.onValueChange() → graph computes → DOM updates
 * - No more cascading DOM events for calculation propagation
 *
 * Flow:
 * 1. User edits input → DOMBridge captures change
 * 2. DOMBridge calls engine.onValueChange(path, value)
 * 3. Engine updates state and computes affected nodes
 * 4. Engine notifies DOMBridge of computed values
 * 5. DOMBridge updates DOM elements with new values
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  // ============================================================================
  // DOM BRIDGE FACTORY
  // ============================================================================

  /**
   * Create a DOM bridge connecting UI elements to computation engine
   * @param {Object} options
   * @param {Object} options.state - MultiModelState instance
   * @param {Object} options.engine - MultiModelEngine instance
   * @param {Object} [options.registry] - FieldRegistry for ID translation
   * @param {HTMLElement} [options.root] - Root element to scan (default: document)
   * @returns {DOMBridge}
   */
  function createDOMBridge(options = {}) {
    const state = options.state;
    const engine = options.engine;
    const registry = options.registry || window.TEUI.FieldRegistry;
    const root = options.root || document;

    if (!state) {
      throw new Error("MultiModelState required");
    }

    if (!engine) {
      throw new Error("MultiModelEngine required");
    }

    // Track bound elements
    const boundElements = new Map(); // fieldPath -> Set<Element>
    const elementToPath = new WeakMap(); // Element -> fieldPath

    // Track event listeners for cleanup
    const eventListeners = new WeakMap(); // Element -> {event, handler}[]

    // State subscription
    let unsubscribeState = null;

    // Debounce timers for input events
    const debounceTimers = new Map();
    const DEBOUNCE_MS = 150;

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================

    /**
     * Convert legacy ID to semantic path
     * @param {string} id - Legacy ID (d_85) or semantic path
     * @returns {string|null}
     */
    function toSemanticPath(id) {
      if (!id) return null;

      // Already a semantic path?
      if (id.includes(".")) {
        return id;
      }

      // Try registry translation
      if (registry?.toSemantic) {
        return registry.toSemantic(id) || id;
      }

      return id;
    }

    /**
     * Get field path from element
     * Supports multiple attribute patterns for semantic path migration:
     *   - data-semantic="envelope.roof.rsiValue" (preferred, explicit semantic)
     *   - data-field-id="envelope.roof.rsiValue" (semantic path in field-id)
     *   - data-field-id="d_85" (legacy ID, translated via FieldRegistry)
     *
     * @param {HTMLElement} element
     * @returns {string|null}
     */
    function getFieldPath(element) {
      // Check cache first
      if (elementToPath.has(element)) {
        return elementToPath.get(element);
      }

      // PHASE 4: Prefer data-semantic for explicit semantic paths
      // This allows gradual migration: <input data-field-id="d_85" data-semantic="envelope.roof.rsiValue">
      if (element.dataset.semantic) {
        const path = element.dataset.semantic;
        elementToPath.set(element, path);
        return path;
      }

      // Look for data attributes (legacy or semantic in field-id)
      const fieldId =
        element.dataset.fieldId ||
        element.dataset.field ||
        element.id ||
        element.name;

      if (!fieldId) return null;

      const path = toSemanticPath(fieldId);
      if (path) {
        elementToPath.set(element, path);
      }
      return path;
    }

    /**
     * Get element value based on type
     * @param {HTMLElement} element
     * @returns {*}
     */
    function getElementValue(element) {
      const tagName = element.tagName.toLowerCase();

      if (tagName === "select") {
        return element.value;
      }

      if (tagName === "input") {
        const type = element.type.toLowerCase();

        if (type === "checkbox") {
          return element.checked;
        }

        if (type === "radio") {
          // Find checked radio in group
          const name = element.name;
          if (name) {
            const checked = root.querySelector(
              `input[name="${name}"]:checked`
            );
            return checked ? checked.value : null;
          }
          return element.checked ? element.value : null;
        }

        if (type === "number" || type === "range") {
          const val = parseFloat(element.value);
          return isNaN(val) ? null : val;
        }

        return element.value;
      }

      if (tagName === "textarea") {
        return element.value;
      }

      // For display elements, get text content
      return element.textContent;
    }

    /**
     * Set element value based on type
     * @param {HTMLElement} element
     * @param {*} value
     */
    function setElementValue(element, value) {
      const tagName = element.tagName.toLowerCase();

      if (tagName === "select") {
        element.value = value ?? "";
        return;
      }

      if (tagName === "input") {
        const type = element.type.toLowerCase();

        if (type === "checkbox") {
          element.checked = Boolean(value);
          return;
        }

        if (type === "radio") {
          element.checked = element.value === String(value);
          return;
        }

        element.value = value ?? "";
        return;
      }

      if (tagName === "textarea") {
        element.value = value ?? "";
        return;
      }

      // For display elements, set text content
      // BUT first check if element contains inputs - don't destroy them!
      const containedInput = element.querySelector("input, select, textarea");
      if (containedInput) {
        // Element contains an input - update the input instead of destroying it
        setElementValue(containedInput, value);
        return;
      }

      if (value === undefined || value === null) {
        element.textContent = "";
      } else if (typeof value === "number") {
        // Format numbers nicely
        element.textContent = formatNumber(value);
      } else {
        element.textContent = String(value);
      }
    }

    /**
     * Format number for display
     * @param {number} value
     * @returns {string}
     */
    function formatNumber(value) {
      if (isNaN(value)) return "";
      if (!isFinite(value)) return value > 0 ? "∞" : "-∞";

      // Use locale formatting with reasonable precision
      if (Math.abs(value) >= 1000) {
        return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
      }
      if (Math.abs(value) < 0.01 && value !== 0) {
        return value.toExponential(2);
      }
      return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    /**
     * Check if element is an input element
     * @param {HTMLElement} element
     * @returns {boolean}
     */
    function isInputElement(element) {
      const tagName = element.tagName.toLowerCase();
      return (
        tagName === "input" ||
        tagName === "select" ||
        tagName === "textarea"
      );
    }

    /**
     * Create debounced handler for input events
     * @param {string} fieldPath
     * @param {Function} handler
     * @returns {Function}
     */
    function createDebouncedHandler(fieldPath, handler) {
      return function (event) {
        // Clear existing timer
        if (debounceTimers.has(fieldPath)) {
          clearTimeout(debounceTimers.get(fieldPath));
        }

        // Set new timer
        debounceTimers.set(
          fieldPath,
          setTimeout(() => {
            debounceTimers.delete(fieldPath);
            handler(event);
          }, DEBOUNCE_MS)
        );
      };
    }

    /**
     * Handle input value change
     * @param {HTMLElement} element
     * @param {string} fieldPath
     */
    function handleValueChange(element, fieldPath) {
      const value = getElementValue(element);
      const modelId = state.getActiveModelId();

      if (!modelId) {
        console.warn("[DOMBridge] No active model");
        return;
      }

      // Send to engine - this triggers computation
      engine.onValueChange(fieldPath, value, modelId);
    }

    /**
     * Add event listeners to an input element
     * @param {HTMLElement} element
     * @param {string} fieldPath
     */
    function bindInputElement(element, fieldPath) {
      const listeners = [];

      const changeHandler = () => handleValueChange(element, fieldPath);

      // Determine event types based on element
      const tagName = element.tagName.toLowerCase();
      const inputType = element.type?.toLowerCase();

      if (tagName === "select") {
        element.addEventListener("change", changeHandler);
        listeners.push({ event: "change", handler: changeHandler });
      } else if (tagName === "input") {
        if (inputType === "checkbox" || inputType === "radio") {
          element.addEventListener("change", changeHandler);
          listeners.push({ event: "change", handler: changeHandler });
        } else if (inputType === "number" || inputType === "range") {
          // Debounce number inputs
          const debouncedHandler = createDebouncedHandler(
            fieldPath,
            changeHandler
          );
          element.addEventListener("input", debouncedHandler);
          element.addEventListener("change", changeHandler);
          listeners.push({ event: "input", handler: debouncedHandler });
          listeners.push({ event: "change", handler: changeHandler });
        } else {
          // Text inputs - debounce
          const debouncedHandler = createDebouncedHandler(
            fieldPath,
            changeHandler
          );
          element.addEventListener("input", debouncedHandler);
          element.addEventListener("change", changeHandler);
          listeners.push({ event: "input", handler: debouncedHandler });
          listeners.push({ event: "change", handler: changeHandler });
        }
      } else if (tagName === "textarea") {
        const debouncedHandler = createDebouncedHandler(
          fieldPath,
          changeHandler
        );
        element.addEventListener("input", debouncedHandler);
        element.addEventListener("change", changeHandler);
        listeners.push({ event: "input", handler: debouncedHandler });
        listeners.push({ event: "change", handler: changeHandler });
      }

      eventListeners.set(element, listeners);
    }

    /**
     * Remove event listeners from an element
     * @param {HTMLElement} element
     */
    function unbindElement(element) {
      const listeners = eventListeners.get(element);
      if (listeners) {
        for (const { event, handler } of listeners) {
          element.removeEventListener(event, handler);
        }
        eventListeners.delete(element);
      }
    }

    /**
     * Handle state change from engine
     * @param {Object} event
     */
    function handleStateChange(event) {
      if (event.type !== "valueChanged") return;

      const { fieldPath, value } = event;

      // Update all bound elements for this field
      const elements = boundElements.get(fieldPath);
      if (elements) {
        for (const element of elements) {
          // Skip if this element triggered the change (avoid feedback loop)
          if (document.activeElement === element) {
            continue;
          }
          setElementValue(element, value);
        }
      }
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    const bridge = {
      /**
       * Bind a single element to a field
       * @param {HTMLElement|string} element - Element or selector
       * @param {string} [fieldPath] - Optional explicit field path
       */
      bind(element, fieldPath) {
        if (typeof element === "string") {
          element = root.querySelector(element);
        }

        if (!element) {
          console.warn("[DOMBridge] Element not found");
          return;
        }

        const path = fieldPath || getFieldPath(element);
        if (!path) {
          console.warn(
            "[DOMBridge] No field path for element:",
            element
          );
          return;
        }

        // Track binding
        if (!boundElements.has(path)) {
          boundElements.set(path, new Set());
        }
        boundElements.get(path).add(element);
        elementToPath.set(element, path);

        // Add event listeners for input elements
        if (isInputElement(element)) {
          bindInputElement(element, path);
        }

        // Initialize with current value
        const value = state.getValue(path);
        if (value !== undefined) {
          setElementValue(element, value);
        }
      },

      /**
       * Unbind a single element
       * @param {HTMLElement|string} element
       */
      unbind(element) {
        if (typeof element === "string") {
          element = root.querySelector(element);
        }

        if (!element) return;

        const path = elementToPath.get(element);
        if (path) {
          const elements = boundElements.get(path);
          if (elements) {
            elements.delete(element);
            if (elements.size === 0) {
              boundElements.delete(path);
            }
          }
        }

        unbindElement(element);
        elementToPath.delete(element);
      },

      /**
       * Bind all elements within a container
       * @param {HTMLElement|string} [container] - Container element (default: root)
       * @param {string} [selector] - CSS selector for elements to bind
       */
      bindAll(container, selector = "[data-field-id], [data-field], [data-semantic]") {
        if (typeof container === "string") {
          container = root.querySelector(container);
        }
        container = container || root;

        const elements = container.querySelectorAll(selector);
        for (const element of elements) {
          this.bind(element);
        }

        console.log(`[DOMBridge] Bound ${elements.length} elements`);
      },

      /**
       * Unbind all elements
       */
      unbindAll() {
        for (const [path, elements] of boundElements) {
          for (const element of elements) {
            unbindElement(element);
          }
        }
        boundElements.clear();
        debounceTimers.clear();
      },

      /**
       * Start listening for state changes
       */
      connect() {
        if (unsubscribeState) {
          console.warn("[DOMBridge] Already connected");
          return;
        }

        unsubscribeState = state.addListener(handleStateChange);
        console.log("[DOMBridge] Connected to state");
      },

      /**
       * Stop listening for state changes
       */
      disconnect() {
        if (unsubscribeState) {
          unsubscribeState();
          unsubscribeState = null;
          console.log("[DOMBridge] Disconnected from state");
        }
      },

      /**
       * Full initialization - bind elements and connect
       * @param {HTMLElement|string} [container]
       * @param {string} [selector]
       */
      initialize(container, selector) {
        this.bindAll(container, selector);
        this.connect();
        console.log("[DOMBridge] Initialized");
      },

      /**
       * Full cleanup - unbind and disconnect
       */
      destroy() {
        this.unbindAll();
        this.disconnect();
        console.log("[DOMBridge] Destroyed");
      },

      /**
       * Sync all bound elements with current state
       */
      syncFromState() {
        for (const [path, elements] of boundElements) {
          const value = state.getValue(path);
          for (const element of elements) {
            setElementValue(element, value);
          }
        }
      },

      /**
       * Sync all input elements to state (useful for initial load)
       */
      syncToState() {
        const changes = {};

        for (const [path, elements] of boundElements) {
          for (const element of elements) {
            if (isInputElement(element)) {
              changes[path] = getElementValue(element);
              break; // Only need one value per path
            }
          }
        }

        if (Object.keys(changes).length > 0) {
          engine.onBatchChange(changes, state.getActiveModelId());
        }
      },

      /**
       * Get bound element count
       * @returns {number}
       */
      getBoundCount() {
        let count = 0;
        for (const elements of boundElements.values()) {
          count += elements.size;
        }
        return count;
      },

      /**
       * Get bound field paths
       * @returns {string[]}
       */
      getBoundPaths() {
        return Array.from(boundElements.keys());
      },

      /**
       * Check if a path has bound elements
       * @param {string} fieldPath
       * @returns {boolean}
       */
      isBound(fieldPath) {
        return boundElements.has(fieldPath);
      },

      /**
       * Get elements bound to a path
       * @param {string} fieldPath
       * @returns {HTMLElement[]}
       */
      getElements(fieldPath) {
        const elements = boundElements.get(fieldPath);
        return elements ? Array.from(elements) : [];
      },

      /**
       * Debug output
       */
      debug() {
        console.group("[DOMBridge] Debug");
        console.log("Bound paths:", boundElements.size);
        console.log("Total elements:", this.getBoundCount());
        console.log("Connected:", !!unsubscribeState);
        for (const [path, elements] of boundElements) {
          console.log(`  ${path}:`, elements.size, "elements");
        }
        console.groupEnd();
      }
    };

    return bridge;
  }

  // ============================================================================
  // GRAPH-TO-DOM STAMPER
  // ============================================================================
  //
  // updateFromGraph() reads computed values from MultiModelState and stamps
  // them directly to DOM elements. It runs LAST in the calculation pipeline,
  // overwriting any corruption from legacy section code cascades.
  //
  // One-way: reads MultiModelState → writes DOM. Never touches StateManager.
  // Mode-aware: reads Target or Reference model via isReferenceMode().
  // Skips contenteditable: user-input fields untouched.
  // ============================================================================

  // Fields needing non-default format (default: "number-2dp-comma")
  // Built from scanning each section's updateCalculatedDisplayValues()
  // and cross-referencing with graph node compute() return types.
  //
  // "raw" = graph returns pre-formatted string (e.g. "52%", "tier3", "✓")
  // "integer-percent" = graph returns whole number that IS a percentage (e.g. 176 → "176%")
  const FORMAT_OVERRIDES = {
    // S01 Key Values: 1 decimal place for numeric fields
    e_10: "number-1dp", e_8: "number-1dp", e_6: "number-1dp",
    h_10: "number-1dp", h_8: "number-1dp", h_6: "number-1dp",
    k_10: "number-1dp", k_8: "number-1dp", k_6: "number-1dp",
    i_10: "raw", f_10: "raw",       // tier labels (strings like "tier3")
    m_6: "raw", m_8: "raw", m_10: "raw",  // graph returns "99%", "48%" strings
    j_8: "raw", j_10: "raw",              // graph returns "52%" strings

    // S03 Climate: integers
    d_20: "integer", d_21: "integer",
    d_22: "integer", h_22: "integer",
    d_25: "integer", l_22: "integer", l_24: "integer",
    e_23: "integer-nocomma", i_23: "integer-nocomma",
    e_24: "integer-nocomma", i_24: "integer-nocomma",
    e_25: "integer-nocomma",
    j_19: "number-1dp",                // climate zone
    m_23: "raw", m_24: "raw",          // graph returns formatted strings
    n_23: "raw", n_24: "raw",          // graph returns "✓" / "✗"

    // S04 Energy: emission factor integers, nuclear waste 4dp
    l_27: "integer",
    l_28: "integer", l_29: "integer", l_30: "integer", l_31: "integer",
    l_33: "number-4dp",

    // S13 Cooling: compliance ratios (graph returns whole numbers like 176 = 176%)
    // and pass/fail checkmarks (graph returns "✓"/"✗" strings)
    m_113: "integer-percent", m_115: "integer-percent", m_116: "integer-percent",
    m_117: "integer-percent", m_118: "integer-percent", m_119: "integer-percent",
    n_113: "raw", n_115: "raw", n_116: "raw",
    n_117: "raw", n_118: "raw", n_119: "raw",
    n_124: "raw",
    m_124: "integer",
  };

  /**
   * Read computed values from MultiModelState and write directly to DOM.
   * Runs as final step after section updateCalculatedDisplayValues().
   */
  function updateFromGraph() {
    const CI = window.TEUI.ComputationIntegration;
    if (!CI?.isInitialized?.()) return;

    const graph = CI.getGraph();
    const state = CI.getState();
    if (!graph || !state) return;

    const isRef = window.TEUI.ReferenceToggle?.isReferenceMode?.() || false;
    const modelId = isRef ? CI.getRefModelId() : state.getActiveModelId();
    if (!modelId) return;

    const fmt = window.TEUI.formatNumber;
    const parse = window.TEUI.parseNumeric;
    if (!fmt || !parse) return;

    // Process computed nodes
    const nodeIds = graph.getAllNodeIds ? graph.getAllNodeIds() : [];
    for (const nodeId of nodeIds) {
      const node = graph.getNode(nodeId);
      if (!node?.legacyId) continue;

      stampField(node.legacyId, state.getValueForModel(modelId, nodeId), fmt, parse);
    }

    // Process input nodes (they also have computed values in the model)
    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
    for (const inputId of inputIds) {
      const input = graph.getInput(inputId);
      if (!input?.legacyId) continue;

      stampField(input.legacyId, state.getValueForModel(modelId, inputId), fmt, parse);
    }
  }

  /**
   * Stamp a single field value to the DOM element.
   * @param {string} legacyId - The data-field-id attribute value
   * @param {*} value - The raw value from MultiModelState
   * @param {Function} fmt - window.TEUI.formatNumber
   * @param {Function} parse - window.TEUI.parseNumeric
   */
  function stampField(legacyId, value, fmt, parse) {
    const el = document.querySelector(`[data-field-id="${legacyId}"]`);
    if (!el) return;

    // Skip user-input elements
    if (el.hasAttribute("contenteditable")) return;
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;

    // Skip elements containing form controls (dropdowns rendered inside TD cells)
    if (el.querySelector("input, select, textarea")) return;

    if (value === undefined || value === null) return;

    const formatType = FORMAT_OVERRIDES[legacyId] || "number-2dp-comma";

    if (formatType === "raw") {
      el.textContent = String(value);
      return;
    }

    // "integer-percent": graph returns whole number (176) meaning 176%
    if (formatType === "integer-percent") {
      const n = parse(value, NaN);
      if (!isNaN(n)) {
        el.textContent = Math.round(n) + "%";
      }
      return;
    }

    const n = parse(value, NaN);
    if (!isNaN(n)) {
      el.textContent = fmt(n, formatType);
    }
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  window.TEUI.DOMBridge = {
    create: createDOMBridge,
    updateFromGraph: updateFromGraph,
    FORMAT_OVERRIDES: FORMAT_OVERRIDES
  };

  console.log("[DOMBridge] Module loaded");
})();
