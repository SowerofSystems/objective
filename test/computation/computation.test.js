/**
 * computation.test.js - Unit Tests for Computation Infrastructure
 *
 * Part of the Multi-Model Architecture refactoring (Phase 1, Task 1.5)
 * See: docs/REFACTORING_PLAN.md
 *
 * Run these tests in the browser console after loading the main application,
 * or use the test HTML page: test/computation/test.html
 *
 * Usage:
 *   TEUI.ComputationTests.runAll()        // Run all tests
 *   TEUI.ComputationTests.runSuite('Graph') // Run specific suite
 */
(function () {
  "use strict";

  // Ensure TEUI namespace exists
  window.TEUI = window.TEUI || {};

  // ============================================================================
  // TEST FRAMEWORK (minimal, no dependencies)
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

  function assertDeepEqual(actual, expected, message = "") {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        `${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`
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

    console.log("\n=== Computation Infrastructure Tests ===\n");

    const testsToRun = suiteFilter
      ? tests.filter((t) => t.suite === suiteFilter)
      : tests;

    for (const { name, fn } of testsToRun) {
      try {
        await fn();
        console.log(`%c✓ ${name}`, "color: green");
        passed++;
        results.push({ name, passed: true });
      } catch (error) {
        console.log(`%c✗ ${name}`, "color: red");
        console.log(`  ${error.message}\n`);
        failed++;
        results.push({ name, passed: false, error: error.message });
      }
    }

    console.log(
      `\n%c${passed} passed, ${failed} failed`,
      failed > 0 ? "color: red; font-weight: bold" : "color: green; font-weight: bold"
    );

    return { passed, failed, results };
  }

  // ============================================================================
  // COMPUTATION TYPES TESTS
  // ============================================================================

  describe("ComputationTypes", () => {
    test("isComputationNode validates correctly", () => {
      const Types = TEUI.ComputationTypes;

      assertTrue(
        Types.isComputationNode({
          id: "test",
          compute: () => 1,
          dependencies: []
        })
      );

      assertFalse(Types.isComputationNode({ id: "test" }));
      assertFalse(Types.isComputationNode(null));
      assertFalse(Types.isComputationNode("string"));
    });

    test("isInputNode validates correctly", () => {
      const Types = TEUI.ComputationTypes;

      assertTrue(Types.isInputNode({ id: "test", defaultValue: 5 }));
      assertFalse(
        Types.isInputNode({ id: "test", defaultValue: 5, compute: () => 1 })
      );
      assertFalse(Types.isInputNode({ id: "test" }));
    });

    test("isValidClassification checks G/C/A", () => {
      const Types = TEUI.ComputationTypes;

      assertTrue(Types.isValidClassification("G"));
      assertTrue(Types.isValidClassification("C"));
      assertTrue(Types.isValidClassification("A"));
      assertFalse(Types.isValidClassification("X"));
      assertFalse(Types.isValidClassification(""));
    });

    test("createPath joins components", () => {
      const Types = TEUI.ComputationTypes;

      assertEqual(
        Types.createPath("envelope", "roof", "rsiValue"),
        "envelope.roof.rsiValue"
      );
      assertEqual(Types.createPath("climate"), "climate");
    });

    test("parsePath splits components", () => {
      const Types = TEUI.ComputationTypes;

      assertDeepEqual(Types.parsePath("envelope.roof.rsiValue"), [
        "envelope",
        "roof",
        "rsiValue"
      ]);
    });

    test("validateComputationNode returns errors for invalid nodes", () => {
      const Types = TEUI.ComputationTypes;

      const errors = Types.validateComputationNode({});
      assertTrue(errors.length > 0);

      const validErrors = Types.validateComputationNode({
        id: "test",
        compute: () => 1,
        dependencies: []
      });
      assertEqual(validErrors.length, 0);
    });
  });

  // ============================================================================
  // COMPUTATION GRAPH TESTS
  // ============================================================================

  describe("ComputationGraph", () => {
    test("creates empty graph", () => {
      const graph = TEUI.createComputationGraph();

      assertEqual(graph.getAllNodeIds().length, 0);
      assertEqual(graph.getAllInputIds().length, 0);
    });

    test("registers computation nodes", () => {
      const graph = TEUI.createComputationGraph();

      graph.registerNode({
        id: "test.node",
        dependencies: [],
        compute: () => 1
      });

      assertEqual(graph.getAllNodeIds().length, 1);
      assertTrue(graph.hasNode("test.node"));
      assertTrue(graph.isComputationNode("test.node"));
    });

    test("registers input nodes", () => {
      const graph = TEUI.createComputationGraph();

      graph.registerInput({
        id: "test.input",
        defaultValue: 5
      });

      assertEqual(graph.getAllInputIds().length, 1);
      assertTrue(graph.hasNode("test.input"));
      assertTrue(graph.isInputNode("test.input"));
    });

    test("tracks dependencies correctly", () => {
      const graph = TEUI.createComputationGraph();

      graph.registerInput({ id: "a", defaultValue: 1 });
      graph.registerNode({
        id: "b",
        dependencies: ["a"],
        compute: (inputs) => inputs.a * 2
      });

      assertDeepEqual(graph.getImmediateDownstream("a"), ["b"]);
      assertDeepEqual(graph.getImmediateUpstream("b"), ["a"]);
    });

    test("getDownstream finds all transitive dependents", () => {
      const graph = TEUI.createComputationGraph();

      // Chain: a → b → c → d
      graph.registerInput({ id: "a", defaultValue: 1 });
      graph.registerNode({ id: "b", dependencies: ["a"], compute: () => 2 });
      graph.registerNode({ id: "c", dependencies: ["b"], compute: () => 3 });
      graph.registerNode({ id: "d", dependencies: ["c"], compute: () => 4 });

      const downstream = graph.getDownstream("a");

      assertEqual(downstream.length, 3);
      assertTrue(downstream.includes("b"));
      assertTrue(downstream.includes("c"));
      assertTrue(downstream.includes("d"));
    });

    test("getUpstream finds all transitive dependencies", () => {
      const graph = TEUI.createComputationGraph();

      // Chain: a → b → c → d
      graph.registerInput({ id: "a", defaultValue: 1 });
      graph.registerNode({ id: "b", dependencies: ["a"], compute: () => 2 });
      graph.registerNode({ id: "c", dependencies: ["b"], compute: () => 3 });
      graph.registerNode({ id: "d", dependencies: ["c"], compute: () => 4 });

      const upstream = graph.getUpstream("d");

      assertEqual(upstream.length, 3);
      assertTrue(upstream.includes("a"));
      assertTrue(upstream.includes("b"));
      assertTrue(upstream.includes("c"));
    });

    test("topologicalSort orders correctly", () => {
      const graph = TEUI.createComputationGraph();

      graph.registerInput({ id: "a", defaultValue: 1 });
      graph.registerNode({ id: "b", dependencies: ["a"], compute: () => 2 });
      graph.registerNode({
        id: "c",
        dependencies: ["a", "b"],
        compute: () => 3
      });

      const order = graph.topologicalSort(["a", "b", "c"]);

      // 'a' must come before 'b' and 'c'
      assertTrue(order.indexOf("a") < order.indexOf("b"));
      assertTrue(order.indexOf("a") < order.indexOf("c"));
      // 'b' must come before 'c'
      assertTrue(order.indexOf("b") < order.indexOf("c"));
    });

    test("getStats returns correct statistics", () => {
      const graph = TEUI.createComputationGraph();

      graph.registerInput({ id: "input1", defaultValue: 1 });
      graph.registerNode({ id: "node1", dependencies: ["input1"], compute: () => 1 });
      graph.registerNode({ id: "node2", dependencies: ["node1"], compute: () => 2 });

      const stats = graph.getStats();

      assertEqual(stats.nodeCount, 2);
      assertEqual(stats.inputCount, 1);
      assertEqual(stats.totalCount, 3);
    });

    test("exportForVisualization returns D3-compatible format", () => {
      const graph = TEUI.createComputationGraph();

      graph.registerInput({ id: "a", defaultValue: 1 });
      graph.registerNode({ id: "b", dependencies: ["a"], compute: () => 2 });

      const viz = graph.exportForVisualization();

      assertEqual(viz.nodes.length, 2);
      assertEqual(viz.links.length, 1);
      assertEqual(viz.links[0].source, "a");
      assertEqual(viz.links[0].target, "b");
    });
  });

  // ============================================================================
  // INCREMENTAL ENGINE TESTS
  // ============================================================================

  describe("IncrementalEngine", () => {
    test("computes simple chain correctly", () => {
      const graph = TEUI.createComputationGraph();

      graph.registerInput({ id: "input", defaultValue: 5 });
      graph.registerNode({
        id: "doubled",
        dependencies: ["input"],
        compute: (inputs) => inputs.input * 2
      });
      graph.registerNode({
        id: "plusTen",
        dependencies: ["doubled"],
        compute: (inputs) => inputs.doubled + 10
      });

      const engine = TEUI.createIncrementalEngine(graph);
      engine.recompute("input", 5);

      assertEqual(engine.getValue("input"), 5);
      assertEqual(engine.getValue("doubled"), 10);
      assertEqual(engine.getValue("plusTen"), 20);
    });

    test("incremental update only affects downstream", () => {
      const graph = TEUI.createComputationGraph();

      // Two independent branches
      graph.registerInput({ id: "a", defaultValue: 1 });
      graph.registerInput({ id: "b", defaultValue: 2 });
      graph.registerNode({
        id: "a2",
        dependencies: ["a"],
        compute: (inputs) => inputs.a * 2
      });
      graph.registerNode({
        id: "b2",
        dependencies: ["b"],
        compute: (inputs) => inputs.b * 2
      });

      const engine = TEUI.createIncrementalEngine(graph);

      // Initialize both branches
      engine.recompute("a", 1);
      engine.recompute("b", 2);

      // Change 'a' - should only recompute 'a2'
      const result = engine.recompute("a", 10);

      assertEqual(result.computed.length, 1);
      assertEqual(result.computed[0], "a2");
      assertEqual(engine.getValue("a2"), 20);
      assertEqual(engine.getValue("b2"), 4); // Unchanged
    });

    test("batch update handles multiple changes efficiently", () => {
      const graph = TEUI.createComputationGraph();

      graph.registerInput({ id: "x", defaultValue: 0 });
      graph.registerInput({ id: "y", defaultValue: 0 });
      graph.registerNode({
        id: "sum",
        dependencies: ["x", "y"],
        compute: (inputs) => inputs.x + inputs.y
      });

      const engine = TEUI.createIncrementalEngine(graph);
      const result = engine.recomputeBatch({ x: 5, y: 3 });

      assertEqual(engine.getValue("sum"), 8);
      assertTrue(result.computed.includes("sum"));
    });

    test("computeAll processes all nodes", () => {
      const graph = TEUI.createComputationGraph();

      graph.registerInput({ id: "a", defaultValue: 2 });
      graph.registerNode({
        id: "b",
        dependencies: ["a"],
        compute: (inputs) => inputs.a * 3
      });
      graph.registerNode({
        id: "c",
        dependencies: ["b"],
        compute: (inputs) => inputs.b + 1
      });

      const engine = TEUI.createIncrementalEngine(graph);
      engine.setState(new Map([["a", 2]]));

      const result = engine.computeAll();

      assertEqual(engine.getValue("b"), 6);
      assertEqual(engine.getValue("c"), 7);
      assertEqual(result.computed.length, 2);
    });

    test("getStats returns computation statistics", () => {
      const graph = TEUI.createComputationGraph();

      graph.registerInput({ id: "a", defaultValue: 1 });
      graph.registerNode({
        id: "b",
        dependencies: ["a"],
        compute: (inputs) => inputs.a * 2
      });

      const engine = TEUI.createIncrementalEngine(graph);
      engine.recompute("a", 5);

      const stats = engine.getStats();

      assertEqual(stats.lastComputeCount, 1);
      assertTrue(typeof stats.lastComputeTimeMs === "string");
    });

    test("analyzeImpact shows what would be affected", () => {
      const graph = TEUI.createComputationGraph();

      graph.registerInput({ id: "a", defaultValue: 1 });
      graph.registerNode({ id: "b", dependencies: ["a"], compute: () => 2 });
      graph.registerNode({ id: "c", dependencies: ["b"], compute: () => 3 });

      const engine = TEUI.createIncrementalEngine(graph);
      const impact = engine.analyzeImpact("a");

      assertEqual(impact.changedNode, "a");
      assertEqual(impact.affectedCount, 2);
      assertTrue(impact.computeOrder.includes("b"));
      assertTrue(impact.computeOrder.includes("c"));
    });
  });

  // ============================================================================
  // FIELD REGISTRY TESTS
  // ============================================================================

  describe("FieldRegistry", () => {
    test("legacy to semantic lookup works", () => {
      const Registry = TEUI.FieldRegistry;

      // d_85 should map to envelope.roof.rsiValue (from initial fields)
      assertEqual(Registry.toSemantic("d_85"), "envelope.roof.rsiValue");
    });

    test("semantic to legacy lookup works", () => {
      const Registry = TEUI.FieldRegistry;

      assertEqual(Registry.toLegacy("envelope.roof.rsiValue"), "d_85");
    });

    test("classification lookup works", () => {
      const Registry = TEUI.FieldRegistry;

      // h_15 (conditioned floor area) should be G-field
      assertEqual(Registry.getClassification("h_15"), "G");
      // d_85 (roof RSI) should be C-field
      assertEqual(Registry.getClassification("d_85"), "C");
    });

    test("isShared identifies G-fields", () => {
      const Registry = TEUI.FieldRegistry;

      assertTrue(Registry.isShared("h_15")); // Floor area is shared
      assertFalse(Registry.isShared("d_85")); // RSI is not shared
    });

    test("getFieldsBySection returns correct fields", () => {
      const Registry = TEUI.FieldRegistry;

      const s03Fields = Registry.getFieldsBySection("S03");

      assertTrue(s03Fields.length > 0);
      assertTrue(s03Fields.some((f) => f.semanticPath === "climate.location.province"));
    });

    test("getSharedFields returns G-fields", () => {
      const Registry = TEUI.FieldRegistry;

      const gFields = Registry.getSharedFields();

      assertTrue(gFields.length > 0);
      assertTrue(gFields.every((f) => f.classification === "G"));
    });

    test("normalize handles ref_ prefix", () => {
      const Registry = TEUI.FieldRegistry;

      const result = Registry.normalize("ref_d_85");

      assertTrue(result.isRef);
      assertEqual(result.baseId, "d_85");
      assertEqual(result.semanticPath, "envelope.roof.rsiValue");
    });

    test("hasLegacy and hasSemantic work correctly", () => {
      const Registry = TEUI.FieldRegistry;

      assertTrue(Registry.hasLegacy("d_85"));
      assertFalse(Registry.hasLegacy("unknown_id"));

      assertTrue(Registry.hasSemantic("envelope.roof.rsiValue"));
      assertFalse(Registry.hasSemantic("unknown.path"));
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe("Integration", () => {
    test("real calculation chain: RSI → U-factor → UA → Load", () => {
      const graph = TEUI.createComputationGraph();

      // Simulate envelope → UA → heating load chain
      graph.registerInput({
        id: "envelope.roof.area",
        defaultValue: 500
      });
      graph.registerInput({
        id: "envelope.roof.rsiValue",
        defaultValue: 5.0
      });
      graph.registerInput({
        id: "climate.heating.degreedays",
        defaultValue: 3652
      });

      graph.registerNode({
        id: "envelope.roof.uFactor",
        dependencies: ["envelope.roof.rsiValue"],
        compute: (inputs) => 1 / inputs["envelope.roof.rsiValue"]
      });

      graph.registerNode({
        id: "envelope.roof.ua",
        dependencies: ["envelope.roof.area", "envelope.roof.uFactor"],
        compute: (inputs) =>
          inputs["envelope.roof.area"] * inputs["envelope.roof.uFactor"]
      });

      graph.registerNode({
        id: "energy.heating.load",
        dependencies: ["envelope.roof.ua", "climate.heating.degreedays"],
        compute: (inputs) =>
          (inputs["envelope.roof.ua"] *
            inputs["climate.heating.degreedays"] *
            24) /
          1000
      });

      const engine = TEUI.createIncrementalEngine(graph);

      // Set initial values
      engine.recomputeBatch({
        "envelope.roof.area": 500,
        "envelope.roof.rsiValue": 5.0,
        "climate.heating.degreedays": 3652
      });

      // Verify chain computation
      assertEqual(engine.getValue("envelope.roof.uFactor"), 0.2);
      assertEqual(engine.getValue("envelope.roof.ua"), 100);

      // Change RSI - should only recompute downstream
      const result = engine.recompute("envelope.roof.rsiValue", 10.0);

      assertEqual(result.computed.length, 3); // uFactor, ua, load
      assertEqual(engine.getValue("envelope.roof.uFactor"), 0.1);
      assertEqual(engine.getValue("envelope.roof.ua"), 50);
    });

    test("field registry integration with graph", () => {
      const Registry = TEUI.FieldRegistry;
      const graph = TEUI.createComputationGraph();

      // Get a field from registry
      const roofRsiMeta = Registry.getMetadata("d_85");

      // Register it with the graph using semantic path
      graph.registerInput({
        id: roofRsiMeta.semanticPath,
        defaultValue: roofRsiMeta.defaultValue,
        legacyId: roofRsiMeta.legacyId,
        classification: roofRsiMeta.classification
      });

      assertTrue(graph.hasNode("envelope.roof.rsiValue"));
      assertEqual(graph.getInput("envelope.roof.rsiValue").defaultValue, 5.0);
    });
  });

  // ============================================================================
  // EXPORT TEST RUNNER
  // ============================================================================

  window.TEUI.ComputationTests = {
    /**
     * Run all tests
     * @returns {Promise<{passed: number, failed: number, results: Array}>}
     */
    runAll: () => runTests(),

    /**
     * Run tests for a specific suite
     * @param {string} suiteName - e.g., 'ComputationGraph', 'IncrementalEngine'
     * @returns {Promise<{passed: number, failed: number, results: Array}>}
     */
    runSuite: (suiteName) => runTests(suiteName),

    /**
     * Get list of test suites
     * @returns {string[]}
     */
    getSuites: () => [...new Set(tests.map((t) => t.suite))],

    /**
     * Get total test count
     * @returns {number}
     */
    getTestCount: () => tests.length
  };

  console.log(
    `[ComputationTests] Loaded ${tests.length} tests. Run with: TEUI.ComputationTests.runAll()`
  );
})();
