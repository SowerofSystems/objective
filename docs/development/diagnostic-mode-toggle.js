/**
 * DIAGNOSTIC SCRIPT: Mode Toggle State Mixing Detective
 *
 * Run this in browser console to trace why h_10 recalculates during mode toggles
 *
 * USAGE:
 * 1. Import Gas building
 * 2. Press Decarbonize (d_113 → Heatpump)
 * 3. Paste this entire script into console
 * 4. Run: startDiagnostic()
 * 5. Toggle between Target and Reference modes
 * 6. Run: stopDiagnostic()
 * 7. Review captured data
 */

window.TEUI_DIAGNOSTIC = {
  isActive: false,
  snapshots: [],

  /**
   * Capture complete state snapshot
   */
  captureSnapshot: function(label) {
    const sm = window.TEUI?.StateManager;
    const sect13 = window.TEUI?.SectionModules?.sect13;

    const snapshot = {
      timestamp: Date.now(),
      label: label,

      // S13 Heating System - Control Fields
      d_113: sm?.getValue("d_113"),
      ref_d_113: sm?.getValue("ref_d_113"),

      // S13 Efficiency Fields (conditional based on d_113)
      f_113: sm?.getValue("f_113"),      // HSPF (for Heatpump)
      ref_f_113: sm?.getValue("ref_f_113"),
      j_115: sm?.getValue("j_115"),      // AFUE (for Gas/Oil)
      ref_j_115: sm?.getValue("ref_j_115"),

      // S13 Calculated Fields
      h_113: sm?.getValue("h_113"),      // COPheat (calculated from f_113)
      ref_h_113: sm?.getValue("ref_h_113"),
      j_113: sm?.getValue("j_113"),      // COPcool (Heatpump)
      ref_j_113: sm?.getValue("ref_j_113"),

      // S13 Energy Consumption
      j_32: sm?.getValue("j_32"),        // Target heating energy
      ref_j_32: sm?.getValue("ref_j_32"), // Reference heating energy

      // S01 Carbon Intensity (the symptom field)
      h_10: sm?.getValue("h_10"),        // Target GHGI
      ref_h_10: sm?.getValue("ref_h_10"), // Reference GHGI

      // UI Field Lock States (DOM inspection)
      fieldLocks: {
        f_113_editable: this.getFieldEditableState("f_113"),
        j_115_editable: this.getFieldEditableState("j_115"),
        f_113_disabled: this.getFieldDisabledState("f_113"),
        j_115_disabled: this.getFieldDisabledState("j_115"),
      },

      // Section 13 Mode State
      sect13_mode: sect13?.ModeManager?.currentMode,
    };

    this.snapshots.push(snapshot);
    return snapshot;
  },

  /**
   * Check if a field is contenteditable
   */
  getFieldEditableState: function(fieldId) {
    const cell = document.querySelector(`td[data-field-id="${fieldId}"]`);
    if (!cell) return "NOT_FOUND";

    const input = cell.querySelector('[contenteditable]');
    if (!input) return "NO_CONTENTEDITABLE";

    return input.contentEditable; // "true", "false", or "inherit"
  },

  /**
   * Check if a field is disabled
   */
  getFieldDisabledState: function(fieldId) {
    const cell = document.querySelector(`td[data-field-id="${fieldId}"]`);
    if (!cell) return "NOT_FOUND";

    const input = cell.querySelector('input, select');
    if (!input) return "NO_INPUT";

    return input.disabled;
  },

  /**
   * Compare two snapshots and highlight differences
   */
  compareSnapshots: function(before, after) {
    const diff = {
      label: `${before.label} → ${after.label}`,
      changes: {},
    };

    // Compare all state values
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    keys.forEach(key => {
      if (key === 'timestamp' || key === 'label' || key === 'fieldLocks' || key === 'sect13_mode') return;

      if (before[key] !== after[key]) {
        diff.changes[key] = {
          before: before[key],
          after: after[key],
          delta: this.calculateDelta(before[key], after[key]),
        };
      }
    });

    // Compare field locks separately
    if (before.fieldLocks && after.fieldLocks) {
      const lockKeys = Object.keys(before.fieldLocks);
      lockKeys.forEach(key => {
        if (before.fieldLocks[key] !== after.fieldLocks[key]) {
          diff.changes[`fieldLocks.${key}`] = {
            before: before.fieldLocks[key],
            after: after.fieldLocks[key],
          };
        }
      });
    }

    return diff;
  },

  /**
   * Calculate numeric delta if possible
   */
  calculateDelta: function(before, after) {
    const beforeNum = parseFloat(before);
    const afterNum = parseFloat(after);

    if (!isNaN(beforeNum) && !isNaN(afterNum)) {
      return (afterNum - beforeNum).toFixed(6);
    }

    return "N/A";
  },

  /**
   * Pretty print a snapshot
   */
  printSnapshot: function(snapshot) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📸 SNAPSHOT: ${snapshot.label}`);
    console.log(`⏱️  Time: ${new Date(snapshot.timestamp).toLocaleTimeString()}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    console.log(`\n🎛️  HEATING SYSTEM SELECTOR:`);
    console.log(`   d_113 (Target):     ${snapshot.d_113}`);
    console.log(`   ref_d_113 (Ref):    ${snapshot.ref_d_113}`);
    console.log(`   S13 Mode:           ${snapshot.sect13_mode}`);

    console.log(`\n⚡ EFFICIENCY FIELDS:`);
    console.log(`   f_113 (HSPF - Target):    ${snapshot.f_113}`);
    console.log(`   ref_f_113 (HSPF - Ref):   ${snapshot.ref_f_113}`);
    console.log(`   j_115 (AFUE - Target):    ${snapshot.j_115}`);
    console.log(`   ref_j_115 (AFUE - Ref):   ${snapshot.ref_j_115}`);

    console.log(`\n🔢 CALCULATED EFFICIENCY:`);
    console.log(`   h_113 (COPheat - Target): ${snapshot.h_113}`);
    console.log(`   ref_h_113 (COPheat - Ref):${snapshot.ref_h_113}`);

    console.log(`\n🔥 ENERGY CONSUMPTION (j_32):`);
    console.log(`   Target:  ${snapshot.j_32}`);
    console.log(`   Ref:     ${snapshot.ref_j_32}`);

    console.log(`\n🌍 CARBON INTENSITY (h_10 - THE SYMPTOM):`);
    console.log(`   Target:  ${snapshot.h_10}`);
    console.log(`   Ref:     ${snapshot.ref_h_10}`);

    console.log(`\n🔒 FIELD LOCK STATES:`);
    console.log(`   f_113 editable:  ${snapshot.fieldLocks.f_113_editable}`);
    console.log(`   f_113 disabled:  ${snapshot.fieldLocks.f_113_disabled}`);
    console.log(`   j_115 editable:  ${snapshot.fieldLocks.j_115_editable}`);
    console.log(`   j_115 disabled:  ${snapshot.fieldLocks.j_115_disabled}`);
  },

  /**
   * Print comparison between snapshots
   */
  printComparison: function(diff) {
    if (Object.keys(diff.changes).length === 0) {
      console.log(`\n✅ No changes between snapshots`);
      return;
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔍 CHANGES: ${diff.label}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    Object.entries(diff.changes).forEach(([field, change]) => {
      const deltaStr = change.delta !== undefined ? ` (Δ ${change.delta})` : '';
      console.log(`\n   ${field}:`);
      console.log(`      Before: ${change.before}`);
      console.log(`      After:  ${change.after}${deltaStr}`);

      // Highlight critical changes
      if (field === 'h_10') {
        console.log(`      ⚠️  SYMPTOM FIELD CHANGED!`);
      }
      if (field === 'j_32') {
        console.log(`      ⚠️  ENERGY CONSUMPTION CHANGED!`);
      }
      if (field === 'd_113' || field === 'ref_d_113') {
        console.log(`      🎛️  SYSTEM TYPE CHANGED!`);
      }
    });
  },

  /**
   * Analyze all snapshots for patterns
   */
  analyzePattern: function() {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔬 PATTERN ANALYSIS`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    console.log(`\nTotal snapshots: ${this.snapshots.length}`);

    // Track h_10 oscillation pattern
    const h10_values = this.snapshots.map(s => parseFloat(s.h_10));
    const h10_unique = [...new Set(h10_values)];

    console.log(`\n🌍 h_10 (GHGI) Oscillation Pattern:`);
    console.log(`   Unique values: ${h10_unique.join(', ')}`);
    if (h10_unique.length === 2) {
      console.log(`   ⚠️  OSCILLATION DETECTED! Switching between 2 values.`);
    }

    // Track which efficiency field is being used
    console.log(`\n⚡ Efficiency Field Usage Pattern:`);
    this.snapshots.forEach((s, i) => {
      const usingHSPF = parseFloat(s.h_113) > 2.0; // COP > 2 means using HSPF
      const usingAFUE = parseFloat(s.h_113) < 1.5; // COP < 1.5 means using AFUE

      console.log(`   [${i}] ${s.label}:`);
      console.log(`      d_113=${s.d_113}, h_113=${s.h_113} → ${usingHSPF ? 'Using HSPF (f_113)' : usingAFUE ? 'Using AFUE (j_115)' : 'Unknown'}`);
    });
  },
};

/**
 * Start diagnostic monitoring
 */
function startDiagnostic() {
  console.clear();
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🔬 MODE TOGGLE STATE MIXING DIAGNOSTIC - STARTED             ║
╚═══════════════════════════════════════════════════════════════╝

Instructions:
1. Initial snapshot captured
2. Toggle to Reference mode
3. Run: captureSnapshot("After Reference Toggle")
4. Toggle back to Target mode
5. Run: captureSnapshot("After Target Toggle")
6. Repeat steps 2-5 a few times
7. Run: stopDiagnostic() to see full analysis
  `);

  window.TEUI_DIAGNOSTIC.isActive = true;
  window.TEUI_DIAGNOSTIC.snapshots = [];

  // Capture initial state
  const initial = window.TEUI_DIAGNOSTIC.captureSnapshot("Initial State");
  window.TEUI_DIAGNOSTIC.printSnapshot(initial);

  // Make functions globally accessible
  window.captureSnapshot = function(label) {
    const snapshot = window.TEUI_DIAGNOSTIC.captureSnapshot(label || `Snapshot ${window.TEUI_DIAGNOSTIC.snapshots.length}`);
    window.TEUI_DIAGNOSTIC.printSnapshot(snapshot);

    // Auto-compare with previous
    if (window.TEUI_DIAGNOSTIC.snapshots.length >= 2) {
      const prev = window.TEUI_DIAGNOSTIC.snapshots[window.TEUI_DIAGNOSTIC.snapshots.length - 2];
      const current = window.TEUI_DIAGNOSTIC.snapshots[window.TEUI_DIAGNOSTIC.snapshots.length - 1];
      const diff = window.TEUI_DIAGNOSTIC.compareSnapshots(prev, current);
      window.TEUI_DIAGNOSTIC.printComparison(diff);
    }
  };

  window.stopDiagnostic = function() {
    window.TEUI_DIAGNOSTIC.analyzePattern();
    console.log(`\n✅ Diagnostic stopped. ${window.TEUI_DIAGNOSTIC.snapshots.length} snapshots captured.`);
    console.log(`\nTo review a specific snapshot: window.TEUI_DIAGNOSTIC.printSnapshot(window.TEUI_DIAGNOSTIC.snapshots[INDEX])`);
    console.log(`To compare two snapshots: window.TEUI_DIAGNOSTIC.printComparison(window.TEUI_DIAGNOSTIC.compareSnapshots(snapshots[0], snapshots[1]))`);
  };
}

/**
 * Quick inspection helpers
 */
function inspectS13State() {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🔍 SECTION 13 STATE INSPECTION`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  const sect13 = window.TEUI?.SectionModules?.sect13;
  const sm = window.TEUI?.StateManager;

  // Check if TargetState and ReferenceState exist
  console.log(`\n📦 S13 State Objects:`);
  console.log(`   TargetState exists:    ${!!sect13?.TargetState}`);
  console.log(`   ReferenceState exists: ${!!sect13?.ReferenceState}`);
  console.log(`   ModeManager exists:    ${!!sect13?.ModeManager}`);
  console.log(`   Current Mode:          ${sect13?.ModeManager?.currentMode}`);

  // Check TargetState values
  if (sect13?.TargetState) {
    console.log(`\n🎯 TargetState Internal Values:`);
    console.log(`   d_113:  ${sect13.TargetState.getValue?.("d_113")}`);
    console.log(`   f_113:  ${sect13.TargetState.getValue?.("f_113")}`);
    console.log(`   j_115:  ${sect13.TargetState.getValue?.("j_115")}`);
    console.log(`   h_113:  ${sect13.TargetState.getValue?.("h_113")}`);
  }

  // Check ReferenceState values
  if (sect13?.ReferenceState) {
    console.log(`\n📚 ReferenceState Internal Values:`);
    console.log(`   d_113:  ${sect13.ReferenceState.getValue?.("d_113")}`);
    console.log(`   f_113:  ${sect13.ReferenceState.getValue?.("f_113")}`);
    console.log(`   j_115:  ${sect13.ReferenceState.getValue?.("j_115")}`);
    console.log(`   h_113:  ${sect13.ReferenceState.getValue?.("h_113")}`);
  }

  // Check global StateManager
  console.log(`\n🌐 Global StateManager Values:`);
  console.log(`   d_113:      ${sm?.getValue("d_113")}`);
  console.log(`   ref_d_113:  ${sm?.getValue("ref_d_113")}`);
  console.log(`   f_113:      ${sm?.getValue("f_113")}`);
  console.log(`   ref_f_113:  ${sm?.getValue("ref_f_113")}`);
  console.log(`   j_115:      ${sm?.getValue("j_115")}`);
  console.log(`   ref_j_115:  ${sm?.getValue("ref_j_115")}`);
  console.log(`   h_113:      ${sm?.getValue("h_113")}`);
  console.log(`   ref_h_113:  ${sm?.getValue("ref_h_113")}`);
}

// Export for console access
console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🔬 DIAGNOSTIC TOOLS LOADED                                   ║
╚═══════════════════════════════════════════════════════════════╝

Available Commands:
  startDiagnostic()      - Begin tracking mode toggles
  captureSnapshot(label) - Capture current state (auto-called during diagnostic)
  stopDiagnostic()       - Stop and analyze pattern
  inspectS13State()      - Quick S13 state inspection

Ready! Run startDiagnostic() to begin.
`);
