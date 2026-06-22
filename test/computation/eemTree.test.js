/**
 * eemTree.test.js - Unit Tests for EEM Tree Manager
 *
 * Tests for: EEMTreeManager, prototypal inheritance, baselines, active EEM
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  // ============================================================================
  // TEST FRAMEWORK (same pattern as multiModel.test.js)
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
      throw new Error(message || `Expected defined value, got ${value}`);
    }
  }

  function runTests(suiteFilter) {
    passed = 0;
    failed = 0;
    const results = [];

    const toRun = suiteFilter
      ? tests.filter(t => t.suite === suiteFilter)
      : tests;

    for (const t of toRun) {
      try {
        t.fn();
        passed++;
        results.push({ name: t.name, status: "passed" });
      } catch (e) {
        failed++;
        results.push({ name: t.name, status: "failed", error: e.message });
        console.error(`❌ ${t.name}: ${e.message}`);
      }
    }

    console.log(`\nEEM Tree Tests: ${passed} passed, ${failed} failed, ${passed + failed} total`);
    return { passed, failed, total: passed + failed, results };
  }

  // ============================================================================
  // EEM TREE MANAGER TESTS
  // ============================================================================

  describe("EEMTreeManager", function () {
    test("module is loaded", function () {
      assertDefined(window.TEUI.EEMTreeManager, "EEMTreeManager not loaded");
    });

    test("create tree manager", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      assertDefined(manager);
      assertEqual(manager.getRoot(), null);
      assertEqual(manager.getActiveEEM(), null);
    });

    test("initialize root node", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base Building");

      assertDefined(root);
      assertEqual(root.name, "Base Building");
      assertEqual(root.parent, null);
      assertEqual(root.children.length, 0);
      assertEqual(manager.getRoot(), root);
      assertEqual(manager.getActiveEEM(), root);
    });

    test("create child EEM", function () {
      window.TEUI.EEMTreeManager.resetIdCounter();
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");

      const child = manager.createChild(root.id, "EEM 1");
      assertDefined(child);
      assertEqual(child.name, "EEM 1");
      assertEqual(child.parent, root);
      assertEqual(root.children.length, 1);
      assertEqual(root.children[0], child);
    });

    test("create nested children", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      const child1 = manager.createChild(root.id, "EEM 1");
      const child2 = manager.createChild(child1.id, "EEM 1.1");

      assertEqual(child2.parent, child1);
      assertEqual(child1.children.length, 1);
      assertEqual(child1.children[0], child2);
    });
  });

  // ============================================================================
  // PROTOTYPAL INHERITANCE TESTS
  // ============================================================================

  describe("Prototypal Inheritance", function () {
    test("child inherits parent values", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");

      // Set value on root
      root.setValue("d_12", 5000);

      // Create child
      const child = manager.createChild(root.id, "EEM 1");

      // Child should inherit parent value
      assertEqual(child.getValue("d_12"), 5000);
    });

    test("child overrides parent value", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      root.setValue("d_12", 5000);

      const child = manager.createChild(root.id, "EEM 1");
      child.setValue("d_12", 6000);

      // Child has its own value
      assertEqual(child.getValue("d_12"), 6000);
      // Parent unchanged
      assertEqual(root.getValue("d_12"), 5000);
    });

    test("grandchild inherits through chain", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      root.setValue("d_12", 5000);

      const child = manager.createChild(root.id, "EEM 1");
      const grandchild = manager.createChild(child.id, "EEM 1.1");

      // Grandchild inherits from root through chain
      assertEqual(grandchild.getValue("d_12"), 5000);

      // Now override at child level
      child.setValue("d_12", 7000);
      // Grandchild should now see child's value
      assertEqual(grandchild.getValue("d_12"), 7000);
    });

    test("revertToParent removes override", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      root.setValue("d_12", 5000);

      const child = manager.createChild(root.id, "EEM 1");
      child.setValue("d_12", 6000);
      assertEqual(child.getValue("d_12"), 6000);

      child.revertToParent("d_12");
      assertEqual(child.getValue("d_12"), 5000);
    });

    test("hasOwnValue detects overrides", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      root.setValue("d_12", 5000);

      const child = manager.createChild(root.id, "EEM 1");

      assertFalse(child.hasOwnValue("d_12"));
      child.setValue("d_12", 6000);
      assertTrue(child.hasOwnValue("d_12"));
    });
  });

  // ============================================================================
  // ACTIVE EEM TESTS
  // ============================================================================

  describe("Active EEM", function () {
    test("root becomes active on init", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      assertEqual(manager.getActiveEEM(), root);
    });

    test("setActiveEEM changes active", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      const child = manager.createChild(root.id, "EEM 1");

      assertTrue(manager.setActiveEEM(child.id));
      assertEqual(manager.getActiveEEM(), child);
    });

    test("setActiveEEM returns false for invalid ID", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      manager.initRoot("Base");
      assertFalse(manager.setActiveEEM("nonexistent"));
    });

    test("setValueForActiveEEM writes to active", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      const child = manager.createChild(root.id, "EEM 1");

      manager.setActiveEEM(child.id);
      manager.setValueForActiveEEM("h_10", 42);

      assertEqual(child.getValue("h_10"), 42);
      assertEqual(root.getValue("h_10"), null);
    });

    test("getValueFromActiveEEM reads from active with inheritance", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      root.setValue("d_12", 5000);
      const child = manager.createChild(root.id, "EEM 1");

      manager.setActiveEEM(child.id);
      assertEqual(manager.getValueFromActiveEEM("d_12"), 5000);
    });
  });

  // ============================================================================
  // BASELINE TESTS
  // ============================================================================

  describe("Baselines", function () {
    test("default baseline is parent", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      const child = manager.createChild(root.id, "EEM 1");

      const baseline = manager.getBaseline(child.id);
      assertEqual(baseline, root);
    });

    test("custom baseline can be set", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      const child1 = manager.createChild(root.id, "EEM 1");
      const child2 = manager.createChild(root.id, "EEM 2");

      // Set child2's baseline to child1 (not its parent)
      assertTrue(manager.setBaseline(child2.id, child1.id));
      assertEqual(manager.getBaseline(child2.id), child1);
    });

    test("baseline EEM provides reference values", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      root.setValue("energy_total", 100000);

      const eem1 = manager.createChild(root.id, "EEM 1");
      eem1.setValue("energy_total", 80000);

      const eem2 = manager.createChild(root.id, "EEM 2");
      manager.setBaseline(eem2.id, eem1.id);

      const baseline = manager.getBaseline(eem2.id);
      assertEqual(baseline.getValue("energy_total"), 80000);
    });
  });

  // ============================================================================
  // TREE OPERATIONS TESTS
  // ============================================================================

  describe("Tree Operations", function () {
    test("removeNode removes node and children", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      const child = manager.createChild(root.id, "EEM 1");
      const grandchild = manager.createChild(child.id, "EEM 1.1");

      assertTrue(manager.removeNode(child.id));
      assertEqual(root.children.length, 0);
      assertEqual(manager.getNode(child.id), null);
      assertEqual(manager.getNode(grandchild.id), null);
    });

    test("cannot remove root", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      assertFalse(manager.removeNode(root.id));
    });

    test("removing active EEM falls back to parent", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      const child = manager.createChild(root.id, "EEM 1");

      manager.setActiveEEM(child.id);
      manager.removeNode(child.id);
      assertEqual(manager.getActiveEEM(), root);
    });

    test("getAllNodes returns all nodes", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      manager.createChild(root.id, "EEM 1");
      manager.createChild(root.id, "EEM 2");

      assertEqual(manager.getAllNodes().length, 3);
    });

    test("serialize produces plain object", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      root.setValue("d_12", 5000);
      const child = manager.createChild(root.id, "EEM 1");
      child.setValue("h_10", 42);

      const serialized = manager.serialize();
      assertDefined(serialized.root);
      assertEqual(serialized.root.name, "Base");
      assertEqual(serialized.root.children.length, 1);
      assertEqual(serialized.root.children[0].name, "EEM 1");
      assertEqual(serialized.root.children[0].ownState.h_10, 42);
    });
  });

  // ============================================================================
  // LISTENER TESTS
  // ============================================================================

  describe("Listeners", function () {
    test("listener notified on create", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");

      let notified = false;
      manager.addListener(function (event) {
        if (event === "create") notified = true;
      });

      manager.createChild(root.id, "EEM 1");
      assertTrue(notified);
    });

    test("listener notified on activate", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");
      const child = manager.createChild(root.id, "EEM 1");

      let activatedNode = null;
      manager.addListener(function (event, node) {
        if (event === "activate") activatedNode = node;
      });

      manager.setActiveEEM(child.id);
      assertEqual(activatedNode, child);
    });

    test("removeListener stops notifications", function () {
      const manager = window.TEUI.EEMTreeManager.create();
      const root = manager.initRoot("Base");

      let count = 0;
      const listener = function () { count++; };
      manager.addListener(listener);

      manager.createChild(root.id, "EEM 1");
      assertEqual(count, 1);

      manager.removeListener(listener);
      manager.createChild(root.id, "EEM 2");
      assertEqual(count, 1); // No new notification
    });
  });

  // ============================================================================
  // EXPORT
  // ============================================================================

  window.TEUI.EEMTreeTests = {
    runAll: () => runTests(),
    runSuite: (name) => runTests(name),
  };

  console.log("[EEMTreeTests] Test module loaded");
})();
