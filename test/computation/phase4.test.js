/**
 * Phase 4 Tests - UI Integration
 *
 * Tests for: LegacyAdapter, ModelSelector, ComparisonView, DOMBridge
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  // ============================================================================
  // TEST FRAMEWORK
  // ============================================================================

  const tests = [];
  let passed = 0;
  let failed = 0;

  function describe(suite, fn) {
    console.log(`\n📦 ${suite}`);
    fn();
  }

  function test(name, fn) {
    tests.push({ name, fn });
  }

  function expect(actual) {
    return {
      toBe(expected) {
        if (actual !== expected) {
          throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
      },
      toEqual(expected) {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        if (actualStr !== expectedStr) {
          throw new Error(`Expected ${expectedStr}, got ${actualStr}`);
        }
      },
      toBeDefined() {
        if (actual === undefined) {
          throw new Error("Expected value to be defined");
        }
      },
      toBeUndefined() {
        if (actual !== undefined) {
          throw new Error(`Expected undefined, got ${JSON.stringify(actual)}`);
        }
      },
      toBeNull() {
        if (actual !== null) {
          throw new Error(`Expected null, got ${JSON.stringify(actual)}`);
        }
      },
      toBeGreaterThan(expected) {
        if (!(actual > expected)) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      },
      toBeLessThan(expected) {
        if (!(actual < expected)) {
          throw new Error(`Expected ${actual} to be less than ${expected}`);
        }
      },
      toContain(expected) {
        if (Array.isArray(actual)) {
          if (!actual.includes(expected)) {
            throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
          }
        } else if (typeof actual === "string") {
          if (!actual.includes(expected)) {
            throw new Error(`Expected string to contain "${expected}"`);
          }
        } else {
          throw new Error("toContain requires array or string");
        }
      },
      toThrow() {
        if (typeof actual !== "function") {
          throw new Error("toThrow requires a function");
        }
        let threw = false;
        try {
          actual();
        } catch (e) {
          threw = true;
        }
        if (!threw) {
          throw new Error("Expected function to throw");
        }
      },
      toBeInstanceOf(expected) {
        if (!(actual instanceof expected)) {
          throw new Error(`Expected instance of ${expected.name}`);
        }
      },
      toHaveProperty(prop) {
        if (!(prop in actual)) {
          throw new Error(`Expected object to have property "${prop}"`);
        }
      }
    };
  }

  async function runTests(filterSuite = null) {
    passed = 0;
    failed = 0;

    for (const { name, fn } of tests) {
      if (filterSuite && !name.startsWith(filterSuite)) {
        continue;
      }

      try {
        await fn();
        passed++;
        console.log(`  ✓ ${name}`);
      } catch (e) {
        failed++;
        console.log(`  ✗ ${name}`);
        console.log(`    ${e.message}`);
      }
    }

    console.log(`\n${passed} passed, ${failed} failed`);
    return { passed, failed };
  }

  // ============================================================================
  // TEST UTILITIES
  // ============================================================================

  function createTestState() {
    const state = window.TEUI.MultiModelState.create();
    state.addModel({
      id: "target-1",
      label: "Target Building",
      modelType: "target"
    });
    state.addModel({
      id: "ref-1",
      label: "Reference Building",
      modelType: "reference"
    });
    return state;
  }

  function createTestEngine(state, graph) {
    return window.TEUI.MultiModelEngine.create({
      state,
      graph: graph || window.TEUI.ComputationGraph.create()
    });
  }

  function createTestDOM() {
    const container = document.createElement("div");
    container.innerHTML = `
      <input type="number" data-field-id="test.value1" value="100">
      <input type="text" data-field-id="test.value2" value="hello">
      <select data-field-id="test.select1">
        <option value="a">A</option>
        <option value="b" selected>B</option>
      </select>
      <input type="checkbox" data-field-id="test.check1" checked>
      <span data-field-id="test.output1"></span>
      <div data-field="test.display1"></div>
    `;
    document.body.appendChild(container);
    return container;
  }

  function cleanupDOM(container) {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }

  // ============================================================================
  // LEGACY ADAPTER TESTS
  // ============================================================================

  describe("LegacyAdapter", () => {
    test("LegacyAdapter: creates with required options", () => {
      const state = createTestState();
      const engine = createTestEngine(state);

      const adapter = window.TEUI.LegacyAdapter.create({ state, engine });
      expect(adapter).toBeDefined();
      expect(typeof adapter.getValue).toBe("function");
      expect(typeof adapter.setValue).toBe("function");
    });

    test("LegacyAdapter: throws without state", () => {
      expect(() => {
        window.TEUI.LegacyAdapter.create({ engine: {} });
      }).toThrow();
    });

    test("LegacyAdapter: throws without engine", () => {
      const state = createTestState();
      expect(() => {
        window.TEUI.LegacyAdapter.create({ state });
      }).toThrow();
    });

    test("LegacyAdapter: getValue returns state value", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const adapter = window.TEUI.LegacyAdapter.create({ state, engine });

      state.setValue("test.field", 42);
      expect(adapter.getValue("test.field")).toBe(42);
    });

    test("LegacyAdapter: getValues returns multiple values", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const adapter = window.TEUI.LegacyAdapter.create({ state, engine });

      state.setValue("test.a", 1);
      state.setValue("test.b", 2);

      const values = adapter.getValues(["test.a", "test.b"]);
      expect(values["test.a"]).toBe(1);
      expect(values["test.b"]).toBe(2);
    });

    test("LegacyAdapter: parseFieldId handles ref_ prefix", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const adapter = window.TEUI.LegacyAdapter.create({ state, engine });

      // Set value on reference model
      state.setValueForModel("ref-1", "test.field", 99);

      // Access via ref_ prefix
      const value = adapter.getValue("ref_test.field");
      expect(value).toBe(99);
    });

    test("LegacyAdapter: getActiveModelId returns correct ID", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const adapter = window.TEUI.LegacyAdapter.create({ state, engine });

      expect(adapter.getActiveModelId()).toBe("target-1");
    });

    test("LegacyAdapter: getReferenceModelId returns reference model", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const adapter = window.TEUI.LegacyAdapter.create({ state, engine });

      expect(adapter.getReferenceModelId()).toBe("ref-1");
    });

    test("LegacyAdapter: isReferenceMode returns false for target", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const adapter = window.TEUI.LegacyAdapter.create({ state, engine });

      expect(adapter.isReferenceMode()).toBe(false);
    });

    test("LegacyAdapter: isReferenceMode returns true when reference active", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const adapter = window.TEUI.LegacyAdapter.create({ state, engine });

      state.setActiveModel("ref-1");
      expect(adapter.isReferenceMode()).toBe(true);
    });

    test("LegacyAdapter: install/uninstall tracking", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const adapter = window.TEUI.LegacyAdapter.create({ state, engine });

      expect(adapter.isInstalled()).toBe(false);
      adapter.install();
      expect(adapter.isInstalled()).toBe(true);
      adapter.uninstall();
      expect(adapter.isInstalled()).toBe(false);
    });

    test("LegacyAdapter: getState returns state instance", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const adapter = window.TEUI.LegacyAdapter.create({ state, engine });

      expect(adapter.getState()).toBe(state);
    });

    test("LegacyAdapter: getEngine returns engine instance", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const adapter = window.TEUI.LegacyAdapter.create({ state, engine });

      expect(adapter.getEngine()).toBe(engine);
    });
  });

  // ============================================================================
  // MODEL SELECTOR TESTS
  // ============================================================================

  describe("ModelSelector", () => {
    test("ModelSelector: creates with required options", () => {
      const state = createTestState();
      const selector = window.TEUI.ModelSelector.create({ state });

      expect(selector).toBeDefined();
      expect(typeof selector.mount).toBe("function");
      expect(typeof selector.selectModel).toBe("function");
    });

    test("ModelSelector: throws without state", () => {
      expect(() => {
        window.TEUI.ModelSelector.create({});
      }).toThrow();
    });

    test("ModelSelector: mounts to container", () => {
      const state = createTestState();
      const selector = window.TEUI.ModelSelector.create({ state });

      const container = document.createElement("div");
      document.body.appendChild(container);

      selector.mount(container);
      expect(selector.getElement()).toBeDefined();
      expect(container.children.length).toBeGreaterThan(0);

      selector.unmount();
      cleanupDOM(container);
    });

    test("ModelSelector: renders dropdown mode by default", () => {
      const state = createTestState();
      const selector = window.TEUI.ModelSelector.create({ state });

      expect(selector.getMode()).toBe("dropdown");
    });

    test("ModelSelector: respects mode option", () => {
      const state = createTestState();
      const selector = window.TEUI.ModelSelector.create({
        state,
        mode: "tabs"
      });

      expect(selector.getMode()).toBe("tabs");
    });

    test("ModelSelector: getSelectedModelId returns active model", () => {
      const state = createTestState();
      const selector = window.TEUI.ModelSelector.create({ state });

      expect(selector.getSelectedModelId()).toBe("target-1");
    });

    test("ModelSelector: selectModel changes active model", () => {
      const state = createTestState();
      const selector = window.TEUI.ModelSelector.create({ state });

      selector.selectModel("ref-1");
      expect(state.getActiveModelId()).toBe("ref-1");
    });

    test("ModelSelector: onModelChange callback fires", () => {
      const state = createTestState();
      let callbackCalled = false;
      let callbackModelId = null;

      const selector = window.TEUI.ModelSelector.create({
        state,
        onModelChange: (modelId) => {
          callbackCalled = true;
          callbackModelId = modelId;
        }
      });

      selector.selectModel("ref-1");
      expect(callbackCalled).toBe(true);
      expect(callbackModelId).toBe("ref-1");
    });

    test("ModelSelector: unmount removes element", () => {
      const state = createTestState();
      const selector = window.TEUI.ModelSelector.create({ state });

      const container = document.createElement("div");
      document.body.appendChild(container);

      selector.mount(container);
      expect(container.children.length).toBeGreaterThan(0);

      selector.unmount();
      expect(selector.getElement()).toBeNull();

      cleanupDOM(container);
    });
  });

  // ============================================================================
  // COMPARISON VIEW TESTS
  // ============================================================================

  describe("ComparisonView", () => {
    test("ComparisonView: creates with required options", () => {
      const state = createTestState();
      const view = window.TEUI.ComparisonView.create({ state });

      expect(view).toBeDefined();
      expect(typeof view.mount).toBe("function");
      expect(typeof view.setModels).toBe("function");
    });

    test("ComparisonView: throws without state", () => {
      expect(() => {
        window.TEUI.ComparisonView.create({});
      }).toThrow();
    });

    test("ComparisonView: mounts to container", () => {
      const state = createTestState();
      const view = window.TEUI.ComparisonView.create({ state });

      const container = document.createElement("div");
      document.body.appendChild(container);

      view.mount(container);
      expect(view.getElement()).toBeDefined();

      view.unmount();
      cleanupDOM(container);
    });

    test("ComparisonView: setModels configures comparison", () => {
      const state = createTestState();
      state.setValue("test.value", 100);
      state.setValueForModel("ref-1", "test.value", 80);

      const view = window.TEUI.ComparisonView.create({ state });
      view.setModels("target-1", "ref-1");

      const data = view.getComparisonData();
      expect(data.length).toBeGreaterThan(0);
    });

    test("ComparisonView: compareTargetToReference auto-selects models", () => {
      const state = createTestState();
      const view = window.TEUI.ComparisonView.create({ state });

      view.compareTargetToReference();
      // Should not throw, models should be set
      const data = view.getComparisonData();
      expect(Array.isArray(data)).toBe(true);
    });

    test("ComparisonView: getComparisonData returns correct structure", () => {
      const state = createTestState();
      state.setValue("test.energy", 1000);
      state.setValueForModel("ref-1", "test.energy", 800);

      const view = window.TEUI.ComparisonView.create({ state });
      view.setModels("target-1", "ref-1");

      const data = view.getComparisonData();
      const energyField = data.find((d) => d.fieldPath === "test.energy");

      expect(energyField).toBeDefined();
      expect(energyField.leftValue).toBe(1000);
      expect(energyField.rightValue).toBe(800);
      expect(energyField.delta).toBe(200);
    });

    test("ComparisonView: exportCSV returns CSV string", () => {
      const state = createTestState();
      state.setValue("test.value", 50);
      state.setValueForModel("ref-1", "test.value", 40);

      const view = window.TEUI.ComparisonView.create({ state });
      view.setModels("target-1", "ref-1");

      const csv = view.exportCSV();
      expect(typeof csv).toBe("string");
      expect(csv).toContain("Field");
      expect(csv).toContain("Target Building");
      expect(csv).toContain("Reference Building");
    });

    test("ComparisonView: setFieldFilter limits displayed fields", () => {
      const state = createTestState();
      state.setValue("test.a", 1);
      state.setValue("test.b", 2);
      state.setValue("test.c", 3);

      const view = window.TEUI.ComparisonView.create({ state });
      view.setModels("target-1", "ref-1");
      view.setFieldFilter(["test.a", "test.b"]);

      const data = view.getComparisonData();
      expect(data.length).toBe(2);
    });
  });

  // ============================================================================
  // DOM BRIDGE TESTS
  // ============================================================================

  describe("DOMBridge", () => {
    test("DOMBridge: creates with required options", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const bridge = window.TEUI.DOMBridge.create({ state, engine });

      expect(bridge).toBeDefined();
      expect(typeof bridge.bind).toBe("function");
      expect(typeof bridge.connect).toBe("function");
    });

    test("DOMBridge: throws without state", () => {
      expect(() => {
        window.TEUI.DOMBridge.create({ engine: {} });
      }).toThrow();
    });

    test("DOMBridge: throws without engine", () => {
      const state = createTestState();
      expect(() => {
        window.TEUI.DOMBridge.create({ state });
      }).toThrow();
    });

    test("DOMBridge: bind registers element", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const bridge = window.TEUI.DOMBridge.create({ state, engine });

      const container = createTestDOM();

      bridge.bind(container.querySelector("[data-field-id='test.value1']"));
      expect(bridge.getBoundCount()).toBe(1);
      expect(bridge.isBound("test.value1")).toBe(true);

      bridge.unbindAll();
      cleanupDOM(container);
    });

    test("DOMBridge: bindAll registers multiple elements", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const bridge = window.TEUI.DOMBridge.create({ state, engine });

      const container = createTestDOM();

      bridge.bindAll(container);
      expect(bridge.getBoundCount()).toBe(6); // All elements with data-field-id or data-field

      bridge.unbindAll();
      cleanupDOM(container);
    });

    test("DOMBridge: unbind removes element", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const bridge = window.TEUI.DOMBridge.create({ state, engine });

      const container = createTestDOM();
      const element = container.querySelector("[data-field-id='test.value1']");

      bridge.bind(element);
      expect(bridge.getBoundCount()).toBe(1);

      bridge.unbind(element);
      expect(bridge.getBoundCount()).toBe(0);

      cleanupDOM(container);
    });

    test("DOMBridge: getBoundPaths returns all bound paths", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const bridge = window.TEUI.DOMBridge.create({ state, engine });

      const container = createTestDOM();
      bridge.bindAll(container);

      const paths = bridge.getBoundPaths();
      expect(paths).toContain("test.value1");
      expect(paths).toContain("test.value2");
      expect(paths).toContain("test.select1");

      bridge.unbindAll();
      cleanupDOM(container);
    });

    test("DOMBridge: getElements returns bound elements", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const bridge = window.TEUI.DOMBridge.create({ state, engine });

      const container = createTestDOM();
      bridge.bindAll(container);

      const elements = bridge.getElements("test.value1");
      expect(elements.length).toBe(1);

      bridge.unbindAll();
      cleanupDOM(container);
    });

    test("DOMBridge: syncFromState updates elements", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const bridge = window.TEUI.DOMBridge.create({ state, engine });

      const container = createTestDOM();
      bridge.bindAll(container);

      state.setValue("test.output1", "Updated Value");
      bridge.syncFromState();

      const output = container.querySelector("[data-field-id='test.output1']");
      expect(output.textContent).toBe("Updated Value");

      bridge.unbindAll();
      cleanupDOM(container);
    });

    test("DOMBridge: connect subscribes to state changes", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const bridge = window.TEUI.DOMBridge.create({ state, engine });

      const container = createTestDOM();
      bridge.bindAll(container);
      bridge.connect();

      // Verify connection by checking that disconnect works
      bridge.disconnect();
      // Should not throw

      bridge.unbindAll();
      cleanupDOM(container);
    });

    test("DOMBridge: initialize does bindAll and connect", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const bridge = window.TEUI.DOMBridge.create({ state, engine });

      const container = createTestDOM();
      bridge.initialize(container);

      expect(bridge.getBoundCount()).toBeGreaterThan(0);

      bridge.destroy();
      expect(bridge.getBoundCount()).toBe(0);

      cleanupDOM(container);
    });

    test("DOMBridge: destroy cleans up everything", () => {
      const state = createTestState();
      const engine = createTestEngine(state);
      const bridge = window.TEUI.DOMBridge.create({ state, engine });

      const container = createTestDOM();
      bridge.initialize(container);
      bridge.destroy();

      expect(bridge.getBoundCount()).toBe(0);

      cleanupDOM(container);
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe("Integration", () => {
    test("Integration: LegacyAdapter setValue triggers engine computation", (done) => {
      const state = createTestState();
      const graph = window.TEUI.ComputationGraph.create();

      // Add a simple computation
      graph.registerInput({ id: "test.input", defaultValue: 0 });
      graph.registerNode({
        id: "test.output",
        dependencies: ["test.input"],
        compute: (deps) => deps["test.input"] * 2
      });

      const engine = createTestEngine(state, graph);
      const adapter = window.TEUI.LegacyAdapter.create({ state, engine });

      state.setValue("test.input", 5);
      adapter.setValueImmediate("test.input", 10);

      // Check result after engine processes
      setTimeout(() => {
        const output = state.getValue("test.output");
        expect(output).toBe(20);
        done();
      }, 50);
    });

    test("Integration: DOMBridge input change triggers computation", (done) => {
      const state = createTestState();
      const graph = window.TEUI.ComputationGraph.create();

      graph.registerInput({ id: "test.value1", defaultValue: 0 });
      graph.registerNode({
        id: "test.computed",
        dependencies: ["test.value1"],
        compute: (deps) => (deps["test.value1"] || 0) + 50
      });

      const engine = createTestEngine(state, graph);
      const bridge = window.TEUI.DOMBridge.create({ state, engine });

      const container = createTestDOM();
      bridge.initialize(container);

      // Simulate input change
      const input = container.querySelector("[data-field-id='test.value1']");
      input.value = "25";
      input.dispatchEvent(new Event("change"));

      setTimeout(() => {
        const computed = state.getValue("test.computed");
        expect(computed).toBe(75);

        bridge.destroy();
        cleanupDOM(container);
        done();
      }, 200);
    });

    test("Integration: ModelSelector change updates active model", () => {
      const state = createTestState();
      const selector = window.TEUI.ModelSelector.create({ state });

      expect(state.getActiveModelId()).toBe("target-1");
      selector.selectModel("ref-1");
      expect(state.getActiveModelId()).toBe("ref-1");
    });

    test("Integration: Full pipeline DOM → Engine → State → DOM", (done) => {
      const state = createTestState();
      const graph = window.TEUI.ComputationGraph.create();

      graph.registerInput({ id: "test.value1", defaultValue: 0 });
      graph.registerNode({
        id: "test.output1",
        dependencies: ["test.value1"],
        compute: (deps) => `Result: ${deps["test.value1"] || 0}`
      });

      const engine = createTestEngine(state, graph);
      const bridge = window.TEUI.DOMBridge.create({ state, engine });

      const container = createTestDOM();
      bridge.initialize(container);

      // Change input
      const input = container.querySelector("[data-field-id='test.value1']");
      input.value = "42";
      input.dispatchEvent(new Event("change"));

      setTimeout(() => {
        // Sync output
        bridge.syncFromState();
        const output = container.querySelector("[data-field-id='test.output1']");
        expect(output.textContent).toBe("Result: 42");

        bridge.destroy();
        cleanupDOM(container);
        done();
      }, 200);
    });
  });

  // ============================================================================
  // TEST RUNNER
  // ============================================================================

  window.TEUI.Phase4Tests = {
    runAll() {
      return runTests();
    },

    runSuite(name) {
      return runTests(name);
    },

    getTestCount() {
      return tests.length;
    },

    getSuites() {
      const suites = new Set();
      for (const { name } of tests) {
        const suite = name.split(":")[0];
        suites.add(suite);
      }
      return Array.from(suites);
    }
  };

  console.log(`[Phase4Tests] Loaded ${tests.length} tests`);
})();
