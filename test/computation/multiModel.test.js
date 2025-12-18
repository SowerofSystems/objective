/**
 * multiModel.test.js - Unit Tests for Multi-Model System
 *
 * Part of the Multi-Model Architecture refactoring (Phase 3, Task 3.5)
 * See: docs/REFACTORING_PLAN.md
 *
 * Tests for: ModelMetadata, MultiModelState, MultiModelEngine, ModelOperations
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
  let currentSuite = "";

  function describe(suiteName, fn) {
    currentSuite = suiteName;
    fn();
    currentSuite = "";
  }

  function test(name, fn) {
    tests.push({
      suite: currentSuite,
      name: currentSuite ? `${currentSuite}: ${name}` : name,
      fn
    });
  }

  function assertEqual(actual, expected, message = "") {
    if (actual !== expected) {
      throw new Error(
        `${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`
      );
    }
  }

  function assertClose(actual, expected, tolerance = 0.01, message = "") {
    const diff = Math.abs(actual - expected);
    if (diff > tolerance) {
      throw new Error(
        `${message}\nExpected: ${expected} (±${tolerance})\nActual: ${actual}`
      );
    }
  }

  function assertTrue(condition, message = "") {
    if (!condition) {
      throw new Error(message || "Expected true but got false");
    }
  }

  function assertFalse(condition, message = "") {
    if (condition) {
      throw new Error(message || "Expected false but got true");
    }
  }

  function assertDefined(value, message = "") {
    if (value === undefined || value === null) {
      throw new Error(message || "Expected value to be defined");
    }
  }

  function assertThrows(fn, message = "") {
    let threw = false;
    try {
      fn();
    } catch (e) {
      threw = true;
    }
    if (!threw) {
      throw new Error(message || "Expected function to throw");
    }
  }

  async function runTests(suiteFilter = null) {
    passed = 0;
    failed = 0;
    const results = [];

    console.log("\n=== Multi-Model System Tests ===\n");

    const testsToRun = suiteFilter
      ? tests.filter((t) => t.suite === suiteFilter)
      : tests;

    for (const { name, fn } of testsToRun) {
      try {
        await fn();
        console.log(`✓ ${name}`);
        passed++;
        results.push({ name, passed: true });
      } catch (error) {
        console.log(`✗ ${name}`);
        console.log(`  ${error.message}`);
        failed++;
        results.push({ name, passed: false, error: error.message });
      }
    }

    console.log(`\n${passed} passed, ${failed} failed\n`);
    return { passed, failed, results };
  }

  // ============================================================================
  // MODEL METADATA TESTS
  // ============================================================================

  describe("ModelMetadata", function () {
    test("module is loaded", function () {
      assertDefined(window.TEUI.ModelMetadata, "ModelMetadata not loaded");
    });

    test("create target model", function () {
      const ModelMetadata = window.TEUI.ModelMetadata;
      const model = ModelMetadata.createTarget("My Building");

      assertDefined(model.id, "Model should have id");
      assertEqual(model.label, "My Building");
      assertEqual(model.modelType, "target");
      assertEqual(model.parentId, null);
    });

    test("create reference model", function () {
      const ModelMetadata = window.TEUI.ModelMetadata;
      const model = ModelMetadata.createReference("OBC SB-10");

      assertEqual(model.modelType, "reference");
      assertEqual(model.standard, "OBC SB-10");
      assertEqual(model.label, "OBC SB-10");
    });

    test("create variant model", function () {
      const ModelMetadata = window.TEUI.ModelMetadata;
      const parent = ModelMetadata.createTarget("Parent");
      const variant = ModelMetadata.createVariant(parent, "Variant A");

      assertEqual(variant.modelType, "variant");
      assertEqual(variant.parentId, parent.id);
      assertEqual(variant.label, "Variant A");
    });

    test("variant without parent throws", function () {
      const ModelMetadata = window.TEUI.ModelMetadata;

      assertThrows(() => {
        ModelMetadata.create({ modelType: "variant" });
      }, "Should throw when creating variant without parent");
    });

    test("type checks work", function () {
      const ModelMetadata = window.TEUI.ModelMetadata;
      const target = ModelMetadata.createTarget("T");
      const ref = ModelMetadata.createReference("R");
      const variant = ModelMetadata.createVariant(target, "V");

      assertTrue(ModelMetadata.isTarget(target));
      assertFalse(ModelMetadata.isTarget(ref));

      assertTrue(ModelMetadata.isReference(ref));
      assertFalse(ModelMetadata.isReference(target));

      assertTrue(ModelMetadata.isVariant(variant));
      assertFalse(ModelMetadata.isVariant(target));
    });

    test("getDisplayName formats correctly", function () {
      const ModelMetadata = window.TEUI.ModelMetadata;
      const target = ModelMetadata.createTarget("My Building");
      const ref = ModelMetadata.createReference("OBC SB-10");
      const variant = ModelMetadata.createVariant(target, "Option A");

      assertEqual(ModelMetadata.getDisplayName(target), "My Building");
      assertEqual(ModelMetadata.getDisplayName(ref), "[REF] OBC SB-10");
      assertEqual(ModelMetadata.getDisplayName(variant), "Option A (variant)");
    });

    test("metadata is frozen (immutable)", function () {
      const ModelMetadata = window.TEUI.ModelMetadata;
      const model = ModelMetadata.createTarget("Test");

      assertThrows(() => {
        model.label = "Changed";
      }, "Should not be able to modify frozen metadata");
    });
  });

  // ============================================================================
  // MULTI-MODEL STATE TESTS
  // ============================================================================

  describe("MultiModelState", function () {
    test("module is loaded", function () {
      assertDefined(window.TEUI.MultiModelState, "MultiModelState not loaded");
    });

    test("create state manager", function () {
      const state = window.TEUI.MultiModelState.create();
      assertDefined(state);
      assertEqual(state.getModelCount(), 0);
    });

    test("add model", function () {
      const state = window.TEUI.MultiModelState.create();
      const ModelMetadata = window.TEUI.ModelMetadata;
      const model = ModelMetadata.createTarget("Test");

      state.addModel(model);

      assertEqual(state.getModelCount(), 1);
      assertTrue(state.hasModel(model.id));
      assertEqual(state.getActiveModelId(), model.id);
    });

    test("first model becomes active", function () {
      const state = window.TEUI.MultiModelState.create();
      const ModelMetadata = window.TEUI.ModelMetadata;

      state.addModel(ModelMetadata.createTarget("First"));
      state.addModel(ModelMetadata.createTarget("Second"));

      const activeModel = state.getActiveModel();
      assertEqual(activeModel.label, "First");
    });

    test("set and get values", function () {
      const state = window.TEUI.MultiModelState.create();
      const ModelMetadata = window.TEUI.ModelMetadata;

      state.addModel(ModelMetadata.createTarget("Test"));

      state.setValue("energy.teui", 85);
      assertEqual(state.getValue("energy.teui"), 85);
    });

    test("G-fields are shared across models", function () {
      const state = window.TEUI.MultiModelState.create();
      const ModelMetadata = window.TEUI.ModelMetadata;

      const model1 = ModelMetadata.createTarget("Model 1");
      const model2 = ModelMetadata.createTarget("Model 2");

      state.addModel(model1);
      state.addModel(model2);

      // Set G-field (geometry) on model1
      state.setValueForModel(model1.id, "geometry.area", 5000);

      // Should be visible from model2
      assertEqual(state.getValueForModel(model2.id, "geometry.area"), 5000);
    });

    test("C-fields are model-specific", function () {
      const state = window.TEUI.MultiModelState.create();
      const ModelMetadata = window.TEUI.ModelMetadata;

      const model1 = ModelMetadata.createTarget("Model 1");
      const model2 = ModelMetadata.createTarget("Model 2");

      state.addModel(model1);
      state.addModel(model2);

      // Set C-field on model1
      state.setValueForModel(model1.id, "envelope.roof.rsi", 8.0);
      state.setValueForModel(model2.id, "envelope.roof.rsi", 5.0);

      // Should be different per model
      assertEqual(state.getValueForModel(model1.id, "envelope.roof.rsi"), 8.0);
      assertEqual(state.getValueForModel(model2.id, "envelope.roof.rsi"), 5.0);
    });

    test("remove model", function () {
      const state = window.TEUI.MultiModelState.create();
      const ModelMetadata = window.TEUI.ModelMetadata;

      const model = ModelMetadata.createTarget("Test");
      state.addModel(model);
      state.removeModel(model.id);

      assertEqual(state.getModelCount(), 0);
      assertFalse(state.hasModel(model.id));
    });

    test("export and import state", function () {
      const state = window.TEUI.MultiModelState.create();
      const ModelMetadata = window.TEUI.ModelMetadata;

      state.addModel(ModelMetadata.createTarget("Test"));
      state.setValue("geometry.area", 5000);
      state.setValue("envelope.roof.rsi", 8.0);

      const exported = state.exportState();

      // Create new state and import
      const state2 = window.TEUI.MultiModelState.create();
      state2.importState(exported);

      assertEqual(state2.getModelCount(), 1);
      assertEqual(state2.getValue("geometry.area"), 5000);
      assertEqual(state2.getValue("envelope.roof.rsi"), 8.0);
    });

    test("change listeners are called", function () {
      const state = window.TEUI.MultiModelState.create();
      const ModelMetadata = window.TEUI.ModelMetadata;

      let eventReceived = null;
      state.addListener((event) => {
        eventReceived = event;
      });

      state.addModel(ModelMetadata.createTarget("Test"));
      assertEqual(eventReceived.type, "modelAdded");

      state.setValue("energy.teui", 85);
      assertEqual(eventReceived.type, "valueChanged");
      assertEqual(eventReceived.fieldPath, "energy.teui");
    });
  });

  // ============================================================================
  // MULTI-MODEL ENGINE TESTS
  // ============================================================================

  describe("MultiModelEngine", function () {
    test("module is loaded", function () {
      assertDefined(window.TEUI.MultiModelEngine, "MultiModelEngine not loaded");
    });

    test("create engine", function () {
      const state = window.TEUI.MultiModelState.create();
      const graph = window.TEUI.ComputationGraph.create();

      const engine = window.TEUI.MultiModelEngine.create({ state, graph });
      assertDefined(engine);
    });

    test("onValueChange returns affected models", function () {
      const state = window.TEUI.MultiModelState.create();
      const graph = window.TEUI.ComputationGraph.create();
      const ModelMetadata = window.TEUI.ModelMetadata;

      // Add a simple computation node
      graph.registerInput({ id: "input.a", defaultValue: 10 });
      graph.registerNode({
        id: "computed.b",
        dependencies: ["input.a"],
        compute: (inputs) => inputs["input.a"] * 2
      });

      const engine = window.TEUI.MultiModelEngine.create({ state, graph });

      state.addModel(ModelMetadata.createTarget("Test"));

      const result = engine.onValueChange("input.a", 20);

      assertEqual(result.affectedModels.length, 1);
      assertTrue(result.computedNodes.includes("computed.b"));
    });

    test("G-field change affects all models", function () {
      const state = window.TEUI.MultiModelState.create();
      const graph = window.TEUI.ComputationGraph.create();
      const ModelMetadata = window.TEUI.ModelMetadata;

      graph.registerInput({ id: "geometry.area", defaultValue: 5000 });

      const engine = window.TEUI.MultiModelEngine.create({ state, graph });

      state.addModel(ModelMetadata.createTarget("Model 1"));
      state.addModel(ModelMetadata.createTarget("Model 2"));

      const result = engine.onValueChange("geometry.area", 6000);

      assertEqual(result.affectedModels.length, 2);
    });

    test("compareModels finds differences", function () {
      const state = window.TEUI.MultiModelState.create();
      const graph = window.TEUI.ComputationGraph.create();
      const ModelMetadata = window.TEUI.ModelMetadata;

      graph.registerInput({ id: "energy.teui", defaultValue: 0 });

      const engine = window.TEUI.MultiModelEngine.create({ state, graph });

      const model1 = ModelMetadata.createTarget("Model 1");
      const model2 = ModelMetadata.createTarget("Model 2");

      state.addModel(model1);
      state.addModel(model2);

      state.setValueForModel(model1.id, "energy.teui", 85);
      state.setValueForModel(model2.id, "energy.teui", 110);

      const comparison = engine.compareModels(model1.id, model2.id, ["energy.teui"]);

      assertEqual(comparison.diffCount, 1);
      assertEqual(comparison.differences[0].model1, 85);
      assertEqual(comparison.differences[0].model2, 110);
    });
  });

  // ============================================================================
  // MODEL OPERATIONS TESTS
  // ============================================================================

  describe("ModelOperations", function () {
    test("module is loaded", function () {
      assertDefined(window.TEUI.ModelOperations, "ModelOperations not loaded");
    });

    test("createTarget creates and computes", function () {
      const state = window.TEUI.MultiModelState.create();
      const graph = window.TEUI.ComputationGraph.create();
      const engine = window.TEUI.MultiModelEngine.create({ state, graph });
      const ops = window.TEUI.ModelOperations.create({ state, engine });

      const model = ops.createTarget("My Building", { "envelope.roof.rsi": 8.0 });

      assertDefined(model);
      assertEqual(model.label, "My Building");
      assertEqual(state.getValue("envelope.roof.rsi"), 8.0);
    });

    test("createVariant copies state", function () {
      const state = window.TEUI.MultiModelState.create();
      const graph = window.TEUI.ComputationGraph.create();
      const engine = window.TEUI.MultiModelEngine.create({ state, graph });
      const ops = window.TEUI.ModelOperations.create({ state, engine });

      const target = ops.createTarget("Original", { "envelope.roof.rsi": 8.0 });
      const variant = ops.createVariant(target.id, "Variant A");

      assertEqual(variant.parentId, target.id);
      assertEqual(state.getValueForModel(variant.id, "envelope.roof.rsi"), 8.0);
    });

    test("cloneWithModifications applies changes", function () {
      const state = window.TEUI.MultiModelState.create();
      const graph = window.TEUI.ComputationGraph.create();

      graph.registerInput({ id: "envelope.roof.rsi", defaultValue: 5.0 });

      const engine = window.TEUI.MultiModelEngine.create({ state, graph });
      const ops = window.TEUI.ModelOperations.create({ state, engine });

      const original = ops.createTarget("Original", { "envelope.roof.rsi": 5.0 });
      const modified = ops.cloneWithModifications(original.id, "Modified", {
        "envelope.roof.rsi": 10.0
      });

      assertEqual(state.getValueForModel(original.id, "envelope.roof.rsi"), 5.0);
      assertEqual(state.getValueForModel(modified.id, "envelope.roof.rsi"), 10.0);
    });

    test("getTargets filters correctly", function () {
      const state = window.TEUI.MultiModelState.create();
      const graph = window.TEUI.ComputationGraph.create();
      const engine = window.TEUI.MultiModelEngine.create({ state, graph });
      const ops = window.TEUI.ModelOperations.create({ state, engine });

      ops.createTarget("Target 1");
      ops.createTarget("Target 2");
      ops.createReference("OBC SB-10");

      const targets = ops.getTargets();
      assertEqual(targets.length, 2);
    });

    test("getLineage returns parent chain", function () {
      const state = window.TEUI.MultiModelState.create();
      const graph = window.TEUI.ComputationGraph.create();
      const engine = window.TEUI.MultiModelEngine.create({ state, graph });
      const ops = window.TEUI.ModelOperations.create({ state, engine });

      const parent = ops.createTarget("Parent");
      const child = ops.createVariant(parent.id, "Child");
      const grandchild = ops.createVariant(child.id, "Grandchild");

      const lineage = ops.getLineage(grandchild.id);

      assertEqual(lineage.length, 3);
      assertEqual(lineage[0].label, "Grandchild");
      assertEqual(lineage[1].label, "Child");
      assertEqual(lineage[2].label, "Parent");
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe("Integration", function () {
    test("full workflow: create models, modify, compare", function () {
      const state = window.TEUI.MultiModelState.create();
      const graph = window.TEUI.ComputationGraph.create();

      // Register some simple nodes
      graph.registerInput({ id: "geometry.area", defaultValue: 5000 });
      graph.registerInput({ id: "envelope.roof.rsi", defaultValue: 5.0 });
      graph.registerNode({
        id: "envelope.roof.uValue",
        dependencies: ["envelope.roof.rsi"],
        compute: (inputs) => {
          const rsi = inputs["envelope.roof.rsi"] || 5;
          return +(1 / rsi).toFixed(3);
        }
      });

      const engine = window.TEUI.MultiModelEngine.create({ state, graph });
      const ops = window.TEUI.ModelOperations.create({ state, engine });

      // Create target
      const target = ops.createTarget("My Building", {
        "geometry.area": 5000,
        "envelope.roof.rsi": 8.0
      });

      // Create reference
      const ref = ops.createReference("OBC SB-10", {
        "envelope.roof.rsi": 5.0
      });

      // Compute both
      engine.computeAllForModel(target.id);
      engine.computeAllForModel(ref.id);

      // Compare
      const comparison = ops.compareModels(target.id, ref.id);

      assertTrue(comparison.diffCount > 0);
    });

    test("change propagation across models", function () {
      const state = window.TEUI.MultiModelState.create();
      const graph = window.TEUI.ComputationGraph.create();

      // Geometry (shared)
      graph.registerInput({ id: "geometry.area", defaultValue: 5000 });

      // Energy calculation depends on area
      graph.registerNode({
        id: "energy.intensity",
        dependencies: ["geometry.area", "energy.total"],
        compute: (inputs) => {
          const area = inputs["geometry.area"] || 5000;
          const total = inputs["energy.total"] || 0;
          return area > 0 ? +(total / area).toFixed(2) : 0;
        }
      });

      graph.registerInput({ id: "energy.total", defaultValue: 100000 });

      const engine = window.TEUI.MultiModelEngine.create({ state, graph });
      const ops = window.TEUI.ModelOperations.create({ state, engine });

      ops.createTarget("Model 1", { "energy.total": 100000 });
      ops.createTarget("Model 2", { "energy.total": 150000 });

      // Change shared geometry
      const result = engine.onValueChange("geometry.area", 6000);

      // Both models should be affected
      assertEqual(result.affectedModels.length, 2);
    });
  });

  // ============================================================================
  // EXPORT
  // ============================================================================

  window.TEUI.MultiModelTests = {
    runAll: () => runTests(),
    runSuite: (name) => runTests(name),
    getTestCount: () => tests.length,
    getSuites: () => [...new Set(tests.map((t) => t.suite))]
  };

  console.log(`[MultiModelTests] Loaded ${tests.length} tests`);
})();
