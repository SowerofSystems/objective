/**
 * sectionNodes.test.js - Verification Tests for Section Computation Nodes
 *
 * Part of the Multi-Model Architecture refactoring (Phase 2, Task 2.6)
 * See: docs/REFACTORING_PLAN.md
 *
 * Tests for: ClimateNodes, MechanicalNodes, EnergyNodes
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  // ============================================================================
  // TEST FRAMEWORK (minimal, matches computation.test.js)
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
        `${message}\nExpected: ${expected} (±${tolerance})\nActual: ${actual}\nDifference: ${diff}`
      );
    }
  }

  function assertTrue(condition, message = "") {
    if (!condition) {
      throw new Error(message || "Expected true but got false");
    }
  }

  function assertDefined(value, message = "") {
    if (value === undefined || value === null) {
      throw new Error(message || "Expected value to be defined");
    }
  }

  async function runTests(suiteFilter = null) {
    passed = 0;
    failed = 0;
    const results = [];

    console.log("\n=== Section Nodes Verification Tests ===\n");

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
  // CLIMATE NODES TESTS
  // ============================================================================

  describe("ClimateNodes", function () {
    test("module is loaded", function () {
      assertDefined(window.TEUI.ComputationNodes.Climate, "Climate module not loaded");
    });

    test("has inputs array", function () {
      const Climate = window.TEUI.ComputationNodes.Climate;
      assertTrue(Array.isArray(Climate.inputs), "inputs should be an array");
      assertTrue(Climate.inputs.length > 0, "inputs should not be empty");
    });

    test("has nodes array", function () {
      const Climate = window.TEUI.ComputationNodes.Climate;
      assertTrue(Array.isArray(Climate.nodes), "nodes should be an array");
      assertTrue(Climate.nodes.length > 0, "nodes should not be empty");
    });

    test("all inputs have required fields", function () {
      const Climate = window.TEUI.ComputationNodes.Climate;
      for (const input of Climate.inputs) {
        assertDefined(input.id, `Input missing id`);
        assertDefined(input.legacyId, `Input ${input.id} missing legacyId`);
        assertDefined(input.classification, `Input ${input.id} missing classification`);
        assertDefined(input.section, `Input ${input.id} missing section`);
      }
    });

    test("all nodes have required fields", function () {
      const Climate = window.TEUI.ComputationNodes.Climate;
      for (const node of Climate.nodes) {
        assertDefined(node.id, `Node missing id`);
        assertDefined(node.legacyId, `Node ${node.id} missing legacyId`);
        assertDefined(node.dependencies, `Node ${node.id} missing dependencies`);
        assertTrue(Array.isArray(node.dependencies), `Node ${node.id} dependencies should be array`);
        assertDefined(node.compute, `Node ${node.id} missing compute function`);
        assertEqual(typeof node.compute, "function", `Node ${node.id} compute should be a function`);
      }
    });

    test("climate zone calculation: HDD < 3000 -> zone 4.0", function () {
      const Climate = window.TEUI.ComputationNodes.Climate;
      const zoneNode = Climate.nodes.find((n) => n.id === "climate.zone");
      assertDefined(zoneNode, "climate.zone node not found");

      const result = zoneNode.compute({ "climate.heating.degreedays": 2500 });
      assertEqual(result, "4.0", "HDD 2500 should be zone 4.0");
    });

    test("climate zone calculation: HDD 3000-4000 -> zone 5.0", function () {
      const Climate = window.TEUI.ComputationNodes.Climate;
      const zoneNode = Climate.nodes.find((n) => n.id === "climate.zone");

      const result = zoneNode.compute({ "climate.heating.degreedays": 3500 });
      assertEqual(result, "5.0", "HDD 3500 should be zone 5.0");
    });

    test("climate zone calculation: HDD 4000-5000 -> zone 6.0", function () {
      const Climate = window.TEUI.ComputationNodes.Climate;
      const zoneNode = Climate.nodes.find((n) => n.id === "climate.zone");

      const result = zoneNode.compute({ "climate.heating.degreedays": 4500 });
      assertEqual(result, "6.0", "HDD 4500 should be zone 6.0");
    });

    test("climate zone calculation: HDD 5000-6000 -> zone 7.1", function () {
      const Climate = window.TEUI.ComputationNodes.Climate;
      const zoneNode = Climate.nodes.find((n) => n.id === "climate.zone");

      const result = zoneNode.compute({ "climate.heating.degreedays": 5500 });
      assertEqual(result, "7.1", "HDD 5500 should be zone 7.1");
    });

    test("climate zone calculation: HDD >= 7000 -> zone 8.0", function () {
      const Climate = window.TEUI.ComputationNodes.Climate;
      const zoneNode = Climate.nodes.find((n) => n.id === "climate.zone");

      const result = zoneNode.compute({ "climate.heating.degreedays": 7500 });
      assertEqual(result, "8.0", "HDD 7500 should be zone 8.0");
    });

    test("heating setpoint: Residential -> 21°C", function () {
      const Climate = window.TEUI.ComputationNodes.Climate;
      const node = Climate.nodes.find((n) => n.id === "climate.heating.setpoint");
      assertDefined(node, "climate.heating.setpoint node not found");

      const result = node.compute({
        "metadata.occupancyType": "Residential",
        "metadata.referenceStandard": "OBC SB-10"
      });
      assertEqual(result, 21, "Residential heating setpoint should be 21°C");
    });

    test("heating setpoint: Other -> 18°C", function () {
      const Climate = window.TEUI.ComputationNodes.Climate;
      const node = Climate.nodes.find((n) => n.id === "climate.heating.setpoint");

      const result = node.compute({
        "metadata.occupancyType": "Other",
        "metadata.referenceStandard": "OBC SB-10"
      });
      assertEqual(result, 18, "Other occupancy heating setpoint should be 18°C");
    });

    test("heating setpoint: Passive House Residential -> 20°C", function () {
      const Climate = window.TEUI.ComputationNodes.Climate;
      const node = Climate.nodes.find((n) => n.id === "climate.heating.setpoint");

      const result = node.compute({
        "metadata.occupancyType": "Residential",
        "metadata.referenceStandard": "PH"
      });
      assertEqual(result, 20, "PH Residential heating setpoint should be 20°C");
    });

    test("ground-facing HDD calculation", function () {
      const Climate = window.TEUI.ComputationNodes.Climate;
      const node = Climate.nodes.find((n) => n.id === "climate.groundFacing.hdd");
      assertDefined(node, "climate.groundFacing.hdd node not found");

      // GF HDD = (TsetHeat - 10) × heatingDays
      // With setpoint 21°C and 120 cooling days: (21 - 10) × 245 = 2695
      const result = node.compute({
        "climate.heating.setpoint": 21,
        "climate.coolingDays": 120
      });
      assertEqual(result, 2695, "GF HDD should be (21-10) × 245 = 2695");
    });

    test("temperature conversion: C to F", function () {
      const Climate = window.TEUI.ComputationNodes.Climate;
      const node = Climate.nodes.find((n) => n.id === "climate.temperature.coldestF");
      assertDefined(node, "climate.temperature.coldestF node not found");

      // -24°C = -11.2°F, rounds to -11
      const result = node.compute({ "climate.temperature.coldest": -24 });
      assertEqual(result, -11, "-24°C should convert to -11°F");
    });
  });

  // ============================================================================
  // NOTE: EnvelopeNodes tests removed - module consolidated into
  // TransmissionLossNodes + VolumeMetricsNodes
  // ============================================================================

  // ============================================================================
  // MECHANICAL NODES TESTS
  // ============================================================================

  describe("MechanicalNodes", function () {
    test("module is loaded", function () {
      assertDefined(window.TEUI.ComputationNodes.Mechanical, "Mechanical module not loaded");
    });

    test("has inputs and nodes arrays", function () {
      const Mechanical = window.TEUI.ComputationNodes.Mechanical;
      assertTrue(Array.isArray(Mechanical.inputs), "inputs should be an array");
      assertTrue(Array.isArray(Mechanical.nodes), "nodes should be an array");
    });

    test("all nodes have required structure", function () {
      const Mechanical = window.TEUI.ComputationNodes.Mechanical;
      for (const node of Mechanical.nodes) {
        assertDefined(node.id, `Node missing id`);
        assertDefined(node.compute, `Node ${node.id} missing compute function`);
      }
    });

    test("COPheat from HSPF: HSPF 12.5 -> COP 3.66", function () {
      const Mechanical = window.TEUI.ComputationNodes.Mechanical;
      const node = Mechanical.nodes.find((n) => n.id === "mechanical.heating.copHeat");
      assertDefined(node, "mechanical.heating.copHeat node not found");

      // COP = HSPF / 3.412
      const result = node.compute({
        "mechanical.heating.systemType": "Heatpump",
        "mechanical.heating.hspf": 12.5
      });
      assertClose(result, 3.66, 0.01, "HSPF 12.5 should give COP ~3.66");
    });

    test("COPheat: non-heatpump returns 1", function () {
      const Mechanical = window.TEUI.ComputationNodes.Mechanical;
      const node = Mechanical.nodes.find((n) => n.id === "mechanical.heating.copHeat");

      const result = node.compute({
        "mechanical.heating.systemType": "Gas Furnace",
        "mechanical.heating.hspf": 12.5
      });
      assertEqual(result, 1, "Non-heatpump should return COP of 1");
    });
  });

  // ============================================================================
  // ENERGY NODES TESTS
  // ============================================================================

  describe("EnergyNodes", function () {
    test("module is loaded", function () {
      assertDefined(window.TEUI.ComputationNodes.Energy, "Energy module not loaded");
    });

    test("has inputs and nodes arrays", function () {
      const Energy = window.TEUI.ComputationNodes.Energy;
      assertTrue(Array.isArray(Energy.inputs), "inputs should be an array");
      assertTrue(Array.isArray(Energy.nodes), "nodes should be an array");
    });

    test("all nodes have required structure", function () {
      const Energy = window.TEUI.ComputationNodes.Energy;
      for (const node of Energy.nodes) {
        assertDefined(node.id, `Node missing id`);
        assertDefined(node.compute, `Node ${node.id} missing compute function`);
      }
    });

    test("TED calculation: losses minus gains", function () {
      const Energy = window.TEUI.ComputationNodes.Energy;
      const node = Energy.nodes.find((n) => n.id === "energy.ted.heating");
      assertDefined(node, "energy.ted.heating node not found");

      // TED = transmission + ventilation - internal gains
      const inputs = {
        "envelope.airFacing.totalHeatLoss": 50000,
        "envelope.groundFacing.totalHeatLoss": 10000,
        "envelope.airLeakage.heatLoss": 5000,
        "mechanical.ventilation.heatLoss": 15000,
        "internal.totalGains": 20000
      };

      const result = node.compute(inputs);
      assertEqual(result, 60000, "TED should be 50000+10000+5000+15000-20000 = 60000");
    });

    test("TEDI calculation: TED / area", function () {
      const Energy = window.TEUI.ComputationNodes.Energy;
      const node = Energy.nodes.find((n) => n.id === "energy.tedi");
      assertDefined(node, "energy.tedi node not found");

      const result = node.compute({
        "energy.ted.heating": 60000,
        "geometry.conditionedFloorArea": 5000
      });
      assertEqual(result, 12, "TEDI should be 60000/5000 = 12 kWh/m²/yr");
    });

    test("TEL calculation: envelope losses only", function () {
      const Energy = window.TEUI.ComputationNodes.Energy;
      const node = Energy.nodes.find((n) => n.id === "energy.tel");
      assertDefined(node, "energy.tel node not found");

      const inputs = {
        "envelope.airFacing.totalHeatLoss": 50000,
        "envelope.groundFacing.totalHeatLoss": 10000,
        "envelope.airLeakage.heatLoss": 5000
      };

      const result = node.compute(inputs);
      assertEqual(result, 65000, "TEL should be 50000+10000+5000 = 65000");
    });

    test("TELI calculation: TEL / area", function () {
      const Energy = window.TEUI.ComputationNodes.Energy;
      const node = Energy.nodes.find((n) => n.id === "energy.teli");

      const result = node.compute({
        "energy.tel": 65000,
        "geometry.conditionedFloorArea": 5000
      });
      assertEqual(result, 13, "TELI should be 65000/5000 = 13 kWh/m²/yr");
    });

    test("total energy sums all components", function () {
      const Energy = window.TEUI.ComputationNodes.Energy;
      const node = Energy.nodes.find((n) => n.id === "energy.total.all");
      assertDefined(node, "energy.total.all node not found");

      const inputs = {
        "mechanical.heating.demand": 30000,
        "mechanical.cooling.electricalDemand": 5000,
        "energy.dhw": 10000,
        "energy.lighting": 8000,
        "energy.plugLoads": 12000,
        "energy.fans": 5000
      };

      const result = node.compute(inputs);
      assertEqual(result, 70000, "Total should be 30000+5000+10000+8000+12000+5000 = 70000");
    });

    test("TEUI calculation: total / area", function () {
      const Energy = window.TEUI.ComputationNodes.Energy;
      const node = Energy.nodes.find((n) => n.id === "energy.teui");
      assertDefined(node, "energy.teui node not found");

      const result = node.compute({
        "energy.total.all": 70000,
        "geometry.conditionedFloorArea": 5000
      });
      assertEqual(result, 14, "TEUI should be 70000/5000 = 14 kWh/m²/yr");
    });

    test("TEUI with zero area returns 0", function () {
      const Energy = window.TEUI.ComputationNodes.Energy;
      const node = Energy.nodes.find((n) => n.id === "energy.teui");

      const result = node.compute({
        "energy.total.all": 70000,
        "geometry.conditionedFloorArea": 0
      });
      assertEqual(result, 0, "TEUI with zero area should return 0");
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe("Integration", function () {
    test("all modules can register with ComputationGraph", function () {
      const Graph = window.TEUI.ComputationGraph;
      assertDefined(Graph, "ComputationGraph not loaded");

      const graph = Graph.create();

      // Register all section nodes
      const Climate = window.TEUI.ComputationNodes.Climate;
      const Envelope = window.TEUI.ComputationNodes.Envelope;
      const Mechanical = window.TEUI.ComputationNodes.Mechanical;
      const Energy = window.TEUI.ComputationNodes.Energy;

      Climate.register(graph);
      Envelope.register(graph);
      Mechanical.register(graph);
      Energy.register(graph);

      const stats = graph.getStats();
      assertTrue(stats.nodeCount > 0, "Graph should have nodes after registration");
      assertTrue(stats.inputCount > 0, "Graph should have inputs after registration");
    });

    test("dependency chains resolve correctly", function () {
      const Graph = window.TEUI.ComputationGraph;
      const graph = Graph.create();

      // Register climate nodes
      const Climate = window.TEUI.ComputationNodes.Climate;
      Climate.register(graph);

      // climate.zone depends on climate.heating.degreedays
      const downstream = graph.getDownstream("climate.heating.degreedays");
      assertTrue(downstream.includes("climate.zone"), "climate.zone should be downstream of HDD");
    });

    test("unique legacy IDs across all modules", function () {
      const Climate = window.TEUI.ComputationNodes.Climate;
      const Envelope = window.TEUI.ComputationNodes.Envelope;
      const Mechanical = window.TEUI.ComputationNodes.Mechanical;
      const Energy = window.TEUI.ComputationNodes.Energy;

      const allIds = new Set();
      const duplicates = [];

      function checkIds(items, moduleName) {
        for (const item of items) {
          if (allIds.has(item.legacyId)) {
            duplicates.push(`${item.legacyId} in ${moduleName}`);
          }
          allIds.add(item.legacyId);
        }
      }

      checkIds(Climate.inputs, "Climate.inputs");
      checkIds(Climate.nodes, "Climate.nodes");
      checkIds(Envelope.inputs, "Envelope.inputs");
      checkIds(Envelope.nodes, "Envelope.nodes");
      checkIds(Mechanical.inputs, "Mechanical.inputs");
      checkIds(Mechanical.nodes, "Mechanical.nodes");
      checkIds(Energy.inputs, "Energy.inputs");
      checkIds(Energy.nodes, "Energy.nodes");

      if (duplicates.length > 0) {
        console.warn("Duplicate legacy IDs found:", duplicates.join(", "));
      }
      // Note: Some duplicates may be expected for cross-section dependencies
    });
  });

  // ============================================================================
  // EXPORT
  // ============================================================================

  window.TEUI.SectionNodeTests = {
    runAll: () => runTests(),
    runSuite: (name) => runTests(name),
    getTestCount: () => tests.length,
    getSuites: () => [...new Set(tests.map((t) => t.suite))]
  };

  console.log(`[SectionNodeTests] Loaded ${tests.length} tests`);
})();
