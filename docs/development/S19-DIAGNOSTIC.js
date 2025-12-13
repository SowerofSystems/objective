/**
 * S19 WOMBAT Diagnostic Script
 * Run this in the browser console to diagnose state isolation issues
 *
 * Usage: Copy and paste this entire script into the browser console
 */

(function() {
  console.log("\n🔍 ========== S19 WOMBAT DIAGNOSTIC REPORT ==========\n");

  // 1. Check ModeManager state
  const modeManager = window.TEUI?.sect19?.ModeManager;
  const currentMode = modeManager?.currentMode || "UNKNOWN";
  console.log(`📍 CURRENT MODE: ${currentMode.toUpperCase()}`);
  console.log("");

  // 2. Check Volume field (d_198) - Gold Standard
  console.log("📊 VOLUME FIELD (d_198) - Gold Standard:");
  const targetVolume = window.TEUI?.StateManager?.getValue("d_198");
  const refVolume = window.TEUI?.StateManager?.getValue("ref_d_198");
  console.log(`  Target (d_198): ${targetVolume || "NOT SET"}`);
  console.log(`  Reference (ref_d_198): ${refVolume || "NOT SET"}`);

  const volumeElement = document.querySelector('[data-field-id="d_198"]');
  const volumeDisplay = volumeElement?.value || volumeElement?.textContent || "NOT FOUND";
  console.log(`  UI Display: ${volumeDisplay}`);
  console.log(`  ✅ State Isolated: ${targetVolume !== refVolume ? "YES" : "NO (same value)"}`);
  console.log("");

  // 3. Check Stories dropdown (d_199)
  console.log("📊 STORIES DROPDOWN (d_199):");
  const targetStories = window.TEUI?.StateManager?.getValue("d_199");
  const refStories = window.TEUI?.StateManager?.getValue("ref_d_199");
  console.log(`  Target (d_199): ${targetStories || "NOT SET"}`);
  console.log(`  Reference (ref_d_199): ${refStories || "NOT SET"}`);

  const storiesElement = document.querySelector('[data-field-id="d_199"]');
  const storiesDisplay = storiesElement?.value || storiesElement?.textContent || "NOT FOUND";
  console.log(`  UI Display: ${storiesDisplay}`);
  console.log(`  ✅ State Isolated: ${targetStories !== refStories ? "YES" : "NO (same value)"}`);
  console.log("");

  // 4. Check external dependencies (what geometry solver reads)
  console.log("📊 EXTERNAL DEPENDENCIES (Geometry Inputs):");
  console.log("  Conditioned Area (h_15):");
  console.log(`    Target: ${window.TEUI?.StateManager?.getValue("h_15") || "NOT SET"}`);
  console.log(`    Reference: ${window.TEUI?.StateManager?.getValue("ref_h_15") || "NOT SET"}`);
  console.log("  Roof Area (d_85):");
  console.log(`    Target: ${window.TEUI?.StateManager?.getValue("d_85") || "NOT SET"}`);
  console.log(`    Reference: ${window.TEUI?.StateManager?.getValue("ref_d_85") || "NOT SET"}`);
  console.log("  Wall Area (d_86):");
  console.log(`    Target: ${window.TEUI?.StateManager?.getValue("d_86") || "NOT SET"}`);
  console.log(`    Reference: ${window.TEUI?.StateManager?.getValue("ref_d_86") || "NOT SET"}`);
  console.log("");

  // 5. Check visualization SVG elements
  console.log("🎨 VISUALIZATION STATE:");
  const svg = document.getElementById("wombat-svg");
  if (!svg) {
    console.log("  ❌ SVG not found (visualization not activated)");
  } else {
    // Check wireframe edges color
    const edges = svg.querySelectorAll('line');
    if (edges.length > 0) {
      const firstEdgeColor = edges[0].getAttribute('stroke');
      const allSameColor = Array.from(edges).every(edge => edge.getAttribute('stroke') === firstEdgeColor);
      console.log(`  Wireframe Edges: ${edges.length} found`);
      console.log(`  Edge Color: ${firstEdgeColor}`);
      console.log(`  All edges same color: ${allSameColor ? "YES" : "NO (mixed colors!)"}`);

      // Determine expected color
      const expectedColor = currentMode === "reference" ? "#dc3545" : "#007bff";
      const isCorrectColor = firstEdgeColor === expectedColor;
      console.log(`  Expected Color: ${expectedColor} (${currentMode} mode)`);
      console.log(`  ${isCorrectColor ? "✅" : "❌"} Color Match: ${isCorrectColor ? "CORRECT" : "WRONG!"}`);
    } else {
      console.log("  ⚠️ No wireframe edges found");
    }

    // Check vertex nodes color
    const nodes = svg.querySelectorAll('circle');
    if (nodes.length > 0) {
      const firstNodeColor = nodes[0].getAttribute('fill');
      console.log(`  Vertex Nodes: ${nodes.length} found`);
      console.log(`  Node Color: ${firstNodeColor}`);

      const expectedColor = currentMode === "reference" ? "#dc3545" : "#007bff";
      const isCorrectColor = firstNodeColor === expectedColor;
      console.log(`  ${isCorrectColor ? "✅" : "❌"} Color Match: ${isCorrectColor ? "CORRECT" : "WRONG!"}`);
    }

    // Check dimension labels color
    const labels = svg.querySelectorAll('text');
    if (labels.length > 0) {
      // Find dimension labels (not area labels which are grey)
      const dimensionLabels = Array.from(labels).filter(text => {
        const fill = text.getAttribute('fill');
        return fill === "#007bff" || fill === "#dc3545";
      });

      if (dimensionLabels.length > 0) {
        const firstLabelColor = dimensionLabels[0].getAttribute('fill');
        console.log(`  Dimension Labels: ${dimensionLabels.length} found`);
        console.log(`  Label Color: ${firstLabelColor}`);

        const expectedColor = currentMode === "reference" ? "#dc3545" : "#007bff";
        const isCorrectColor = firstLabelColor === expectedColor;
        console.log(`  ${isCorrectColor ? "✅" : "❌"} Color Match: ${isCorrectColor ? "CORRECT" : "WRONG!"}`);
      }
    }
  }
  console.log("");

  // 6. Check what updateVisualization was last called with
  console.log("🔧 FUNCTION STATE:");
  console.log(`  ModeManager.currentMode: ${currentMode}`);

  // Try to detect if visualization is showing correct geometry
  const infoText = svg?.querySelector('text');
  if (infoText) {
    const infoContent = infoText.textContent;
    console.log(`  Info Overlay: ${infoContent}`);
  }
  console.log("");

  // 7. Summary
  console.log("📋 DIAGNOSTIC SUMMARY:");

  const issues = [];

  // Check if stories has state isolation
  if (targetStories === refStories && targetStories) {
    issues.push("❌ Stories (d_199) not state isolated - both modes have same value");
  }

  // Check if color matches mode
  if (svg) {
    const edges = svg.querySelectorAll('line');
    if (edges.length > 0) {
      const edgeColor = edges[0].getAttribute('stroke');
      const expectedColor = currentMode === "reference" ? "#dc3545" : "#007bff";
      if (edgeColor !== expectedColor) {
        issues.push(`❌ Visualization color wrong - showing ${edgeColor} in ${currentMode} mode (expected ${expectedColor})`);
      }
    }
  }

  // Check if StateManager has ref_ values
  if (!refVolume) {
    issues.push("⚠️ No ref_d_198 in StateManager - Reference mode may not work");
  }
  if (!refStories) {
    issues.push("⚠️ No ref_d_199 in StateManager - Reference mode may not work");
  }

  if (issues.length === 0) {
    console.log("  ✅ ALL SYSTEMS NOMINAL");
  } else {
    console.log("  Issues Found:");
    issues.forEach(issue => console.log(`    ${issue}`));
  }

  console.log("\n🔍 ========== END DIAGNOSTIC REPORT ==========\n");

  // Return object for programmatic access
  return {
    mode: currentMode,
    volume: { target: targetVolume, reference: refVolume, display: volumeDisplay },
    stories: { target: targetStories, reference: refStories, display: storiesDisplay },
    visualization: {
      svg: svg ? "present" : "not found",
      color: svg?.querySelector('line')?.getAttribute('stroke') || "unknown"
    },
    issues: issues
  };
})();
