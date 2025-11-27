/**
 * 4011-ReferenceToggle.js
 * MODERNIZED FOR PATTERN A DUAL-STATE ARCHITECTURE
 * Module to handle switching between Target and Reference Model views across ALL sections.
 */

// Create TEUI namespace if it doesn't exist
window.TEUI = window.TEUI || {};

TEUI.ReferenceToggle = (function () {
  let isShowingReference = false; // Track if we're currently showing Reference values
  const STANDARD_SELECTOR_ID = "d_13"; // ID of the reference standard dropdown

  // Button IDs and text constants
  const RUN_REFERENCE_BUTTON_ID = "runReferenceBtn";
  const VIEW_REFERENCE_INPUTS_BUTTON_ID = "viewReferenceInputsBtn";

  // Updated button text for Pattern A architecture
  const BUTTON_TEXT_SHOW_REFERENCE = "Show Reference";
  const BUTTON_TEXT_SHOW_TARGET = "Show Target";
  const BUTTON_TEXT_HIGHLIGHT_REFERENCE_VALUES = "Highlight Reference Values";
  const BUTTON_TEXT_SHOW_TARGET_INPUTS = "Show Target Inputs";

  let isViewingReferenceInputs = false;

  /**
   * G/C/A Field Classification Mapping (2025-11-27)
   * Based on CSV metadata row 4 from TEUIv4011-DualState-Three_Feathers_Terrace.csv
   * G = Geometry fields (areas, volumes, location, occupancy)
   * C = Code/Performance fields (RSI, equipment, SHGC, U-values)
   * A = All other fields
   *
   * See docs/development/Field-Classification-GCA.md for complete documentation
   */
  const FIELD_CLASSIFICATION = {
    // Row 1-10
    'd_12': 'C', 'd_13': 'C', 'd_14': 'A', 'd_15': 'C', 'h_12': 'C',
    'h_13': 'C', 'h_14': 'A', 'h_15': 'G', 'i_16': 'A', 'i_17': 'A',
    // Row 11-20
    'l_12': 'A', 'l_13': 'A', 'l_14': 'A', 'l_15': 'A', 'l_16': 'A',
    'd_19': 'G', 'h_19': 'G', 'h_20': 'G', 'h_21': 'G', 'i_21': 'G',
    // Row 21-30
    'm_19': 'G', 'l_20': 'G', 'l_21': 'G', 'l_24': 'G', 'd_27': 'A',
    'd_28': 'A', 'd_29': 'A', 'd_30': 'A', 'd_31': 'A', 'l_28': 'A',
    // Row 31-40
    'l_29': 'A', 'l_30': 'A', 'l_31': 'A', 'h_35': 'C', 'd_39': 'C',
    'i_41': 'C', 'd_44': 'A', 'd_45': 'A', 'd_46': 'A', 'i_44': 'A',
    // Row 41-50
    'k_45': 'A', 'i_46': 'A', 'm_43': 'A', 'd_49': 'C', 'e_49': 'C',
    'e_50': 'C', 'd_51': 'C', 'd_52': 'C', 'd_53': 'C', 'k_52': 'C',
    // Row 51-60
    'd_56': 'C', 'd_57': 'C', 'd_58': 'C', 'd_59': 'C', 'i_59': 'C',
    'd_63': 'C', 'g_63': 'G', 'd_64': 'G', 'd_66': 'G', 'd_68': 'G',
    // Row 61-70
    'g_67': 'G', 'd_73': 'G', 'd_74': 'G', 'd_75': 'G', 'd_76': 'G',
    'd_77': 'G', 'd_78': 'G', 'e_73': 'G', 'e_74': 'G', 'e_75': 'G',
    // Row 71-80
    'e_76': 'G', 'e_77': 'G', 'e_78': 'G', 'f_73': 'C', 'f_74': 'C',
    'f_75': 'C', 'f_76': 'C', 'f_77': 'C', 'f_78': 'C', 'g_73': 'G',
    // Row 81-90
    'g_74': 'G', 'g_75': 'G', 'g_76': 'G', 'g_77': 'G', 'g_78': 'G',
    'h_73': 'G', 'h_74': 'G', 'h_75': 'G', 'h_76': 'G', 'h_77': 'G',
    // Row 91-100
    'h_78': 'G', 'd_80': 'C', 'd_85': 'G', 'f_85': 'C', 'd_86': 'C',
    'f_86': 'C', 'd_87': 'C', 'f_87': 'C', 'g_88': 'C', 'g_89': 'C',
    // Row 101-110
    'g_90': 'C', 'g_91': 'C', 'g_92': 'C', 'g_93': 'C', 'd_94': 'C',
    'f_94': 'G', 'd_95': 'C', 'f_95': 'G', 'd_96': 'C', 'd_97': 'G',
    // Row 111-120
    'd_103': 'C', 'g_103': 'C', 'd_105': 'C', 'd_108': 'C', 'g_109': 'C',
    'd_113': 'C', 'f_113': 'C', 'j_115': 'C', 'j_116': 'C', 'd_116': 'C',
    // Row 121-127
    'd_118': 'C', 'g_118': 'C', 'l_118': 'C', 'd_119': 'C', 'l_119': 'C',
    'k_120': 'C', 'd_142': 'C'
  };

  /**
   * Get field classification category (G/C/A)
   * @param {string} fieldId - Field identifier
   * @returns {string|null} - 'G', 'C', 'A', or null if not classified
   */
  function getFieldClassification(fieldId) {
    return FIELD_CLASSIFICATION[fieldId] || null;
  }

  /**
   * Pattern A Compatible: Get all sections with dual-state ModeManager
   * FIXED: Updated for current dual-state architecture
   */
  function getAllDualStateSections() {
    const sectionIds = [
      "sect02",
      "sect03",
      "sect04",
      "sect05",
      "sect06",
      "sect07",
      "sect08",
      "sect09",
      "sect10",
      "sect11",
      "sect12",
      "sect13",
      "sect14",
      "sect15",
      "sect16",
    ];

    const dualStateSections = sectionIds
      .map(id => ({
        id,
        module: window.TEUI?.[id],
        modeManager: window.TEUI?.[id]?.ModeManager,
      }))
      .filter(s => s.modeManager);

    console.log(
      `[ReferenceToggle] Found ${dualStateSections.length} dual-state sections:`,
      dualStateSections.map(s => s.id)
    );
    return dualStateSections;
  }

  // Track which sections have been warned about missing methods to avoid spam
  const warnedSections = new Set();

  /**
   * PHASE 3: Master Display Toggle - Switch ALL sections with coordinated styling
   * UPDATED: Now applies existing CSS classes for global Reference styling
   */
  function switchAllSectionsMode(mode) {
    const sections = getAllDualStateSections();
    let switchedCount = 0;

    // Switch all section ModeManagers
    sections.forEach(section => {
      try {
        if (
          section.modeManager &&
          typeof section.modeManager.switchMode === "function"
        ) {
          section.modeManager.switchMode(mode);

          // Call updateCalculatedDisplayValues if it exists
          if (
            typeof section.modeManager.updateCalculatedDisplayValues ===
            "function"
          ) {
            section.modeManager.updateCalculatedDisplayValues();
          } else if (!warnedSections.has(section.id)) {
            // Only warn once per section to avoid console spam
            console.warn(
              `[ReferenceToggle] ${section.id} has no updateCalculatedDisplayValues method`
            );
            warnedSections.add(section.id);
          }

          switchedCount++;
        }
      } catch (error) {
        console.error(
          `[ReferenceToggle] Error switching ${section.id}:`,
          error
        );
      }
    });

    // Apply existing CSS classes for global Reference styling
    const isReference = mode === "reference";
    document.body.classList.toggle("viewing-reference-inputs", isReference);
    document.body.classList.toggle("viewing-reference-values", isReference);
    document.body.classList.toggle("reference-mode", isReference);
    document.documentElement.classList.toggle("reference-mode", isReference);

    // ✅ NEW: Update Key Values header toggle UI to match global mode
    updateKeyValuesToggleUI(mode);

    console.log(
      `🎨 Master Toggle: Switched ${switchedCount}/${sections.length} sections to ${mode.toUpperCase()} mode with global styling`
    );
    return switchedCount;
  }

  /**
   * Update Key Values header toggle UI to match global mode
   * Called when main global toggle switches modes
   */
  function updateKeyValuesToggleUI(mode) {
    // Check if Key Values toggle elements exist
    if (!window.TEUI.ReferenceToggle.keyValuesToggleElements) {
      return; // Key Values toggle not yet initialized
    }

    const { toggleSwitch, slider, stateIndicator } =
      window.TEUI.ReferenceToggle.keyValuesToggleElements;

    if (mode === "reference") {
      slider.style.transform = "translateX(20px)";
      toggleSwitch.style.backgroundColor = "#dc3545"; // Red
      stateIndicator.textContent = "REFERENCE";
      stateIndicator.style.backgroundColor = "rgba(220, 53, 69, 0.5)";
    } else {
      slider.style.transform = "translateX(0)";
      toggleSwitch.style.backgroundColor = "#ccc"; // Gray
      stateIndicator.textContent = "TARGET";
      stateIndicator.style.backgroundColor = "rgba(0, 123, 255, 0.5)";
    }
  }

  /**
   * Get current global mode
   * Used by Key Values toggle to determine mode before switching
   */
  function getCurrentMode() {
    return isShowingReference ? "reference" : "target";
  }

  /**
   * Switch mode (external API for toggles)
   * Used by Key Values toggle to switch all sections
   */
  function switchMode(mode) {
    isShowingReference = mode === "reference";
    switchAllSectionsMode(mode);
    updateAllCalculatedDisplays();

    // Update main toggle button text if it exists
    const runRefBtn = document.getElementById(RUN_REFERENCE_BUTTON_ID);
    if (runRefBtn) {
      runRefBtn.textContent = isShowingReference
        ? BUTTON_TEXT_SHOW_TARGET
        : BUTTON_TEXT_SHOW_REFERENCE;
    }
  }

  /**
   * Pattern A Compatible: Update all calculated display values based on current mode
   */
  function updateAllCalculatedDisplays() {
    const dualStateSections = getAllDualStateSections();

    dualStateSections.forEach(section => {
      try {
        if (
          section.modeManager &&
          typeof section.modeManager.updateCalculatedDisplayValues ===
            "function"
        ) {
          section.modeManager.updateCalculatedDisplayValues();
        } else if (
          section.modeManager &&
          typeof section.modeManager.refreshUI === "function"
        ) {
          section.modeManager.refreshUI();
        }
      } catch (error) {
        console.error(
          `[ReferenceToggle] Error updating display for ${section.id}:`,
          error
        );
      }
    });
  }

  function initialize() {
    // ✅ NEW (2025-11-27): Wire three mirror function buttons

    // Button 1: Mirror Geometry (geometry/configuration only)
    const mirrorGeometryBtn = document.getElementById("mirrorGeometryBtn");
    if (mirrorGeometryBtn) {
      mirrorGeometryBtn.addEventListener("click", e => {
        e.preventDefault();
        console.log("[ReferenceToggle] User clicked: Geometry");
        mirrorGeometry();
      });
    }

    // Button 2: Mirror Geometry + Code (geometry + ReferenceValues overlay)
    const mirrorGeometryPlusCodeBtn = document.getElementById(
      "mirrorGeometryPlusCodeBtn"
    );
    if (mirrorGeometryPlusCodeBtn) {
      mirrorGeometryPlusCodeBtn.addEventListener("click", e => {
        e.preventDefault();
        console.log("[ReferenceToggle] User clicked: Geometry + Code");
        mirrorGeometryPlusCode();
      });
    }

    // Button 3: Mirror All Inputs (perfect clone)
    const mirrorAllInputsBtn = document.getElementById("mirrorAllInputsBtn");
    if (mirrorAllInputsBtn) {
      mirrorAllInputsBtn.addEventListener("click", e => {
        e.preventDefault();
        console.log("[ReferenceToggle] User clicked: All Inputs");
        mirrorAllInputs();
      });
    }

    // Setup Display Toggle buttons
    const showReferenceBtn = document.getElementById("showReferenceBtn");
    if (showReferenceBtn) {
      showReferenceBtn.addEventListener("click", e => {
        e.preventDefault();
        switchAllSectionsMode("reference");
      });
    }

    const showTargetBtn = document.getElementById("showTargetBtn");
    if (showTargetBtn) {
      showTargetBtn.addEventListener("click", e => {
        e.preventDefault();
        switchAllSectionsMode("target");
      });
    }

    // Keep existing Reference Inputs view button
    const viewRefInputsBtn = document.getElementById(
      VIEW_REFERENCE_INPUTS_BUTTON_ID
    );
    if (viewRefInputsBtn) {
      viewRefInputsBtn.addEventListener("click", toggleReferenceInputsView);
      viewRefInputsBtn.textContent = BUTTON_TEXT_HIGHLIGHT_REFERENCE_VALUES;
    }

    // Keep existing reference standard change handler
    const standardSelector =
      document.getElementById(STANDARD_SELECTOR_ID) ||
      document.querySelector(`[data-field-id='${STANDARD_SELECTOR_ID}']`);
    if (standardSelector) {
      const actualSelect =
        standardSelector.tagName === "SELECT"
          ? standardSelector
          : standardSelector.querySelector("select");
      if (actualSelect) {
        actualSelect.addEventListener("change", handleStandardChange);
      }
    }

    console.log(
      "[ReferenceToggle] Master Reference Toggle initialization complete"
    );
  }

  /**
   * MAIN FUNCTION: Toggle between showing Target and Reference calculated values
   * This is the new "Show Reference" functionality with proper red UI styling
   */
  function toggleReferenceDisplay() {
    isShowingReference = !isShowingReference;
    const targetMode = isShowingReference ? "reference" : "target";

    console.log(
      `[ReferenceToggle] Switching ALL sections to ${targetMode.toUpperCase()} display mode`
    );

    // Switch all dual-state sections to the target mode
    const switchedCount = switchAllSectionsMode(targetMode);

    if (switchedCount > 0) {
      // Update all calculated display values
      updateAllCalculatedDisplays();

      // Update button text
      const runRefBtn = document.getElementById(RUN_REFERENCE_BUTTON_ID);
      if (runRefBtn) {
        runRefBtn.textContent = isShowingReference
          ? BUTTON_TEXT_SHOW_TARGET
          : BUTTON_TEXT_SHOW_REFERENCE;
      }

      // 🎨 CRITICAL: Apply RED Reference mode styling to entire UI
      // Use the SAME CSS class that "Highlight Reference Values" uses
      document.body.classList.toggle(
        "viewing-reference-inputs",
        isShowingReference
      );
      document.body.classList.toggle(
        "viewing-reference-values",
        isShowingReference
      );

      // Also apply additional classes for comprehensive styling
      document.body.classList.toggle("reference-mode", isShowingReference);
      const htmlElement = document.documentElement;
      htmlElement.classList.toggle("reference-mode", isShowingReference);

      console.log(
        `[ReferenceToggle] Successfully toggled to ${targetMode.toUpperCase()} display mode with UI styling`
      );
    } else {
      console.warn(
        "[ReferenceToggle] No sections were switched - reverting toggle"
      );
      isShowingReference = !isShowingReference; // Revert if nothing was switched
    }
  }

  /**
   * Handle reference standard (d_13) changes
   */
  function handleStandardChange(event) {
    const newStandardKey = event.target.value;
    console.log(
      `[ReferenceToggle] Reference standard changed to: ${newStandardKey}`
    );

    if (window.TEUI?.StateManager) {
      // Update the global standard
      window.TEUI.StateManager.setValue(
        STANDARD_SELECTOR_ID,
        newStandardKey,
        "user-modified"
      );

      // Notify all sections with ReferenceValues.js dependencies
      const dualStateSections = getAllDualStateSections();
      dualStateSections.forEach(section => {
        try {
          // Look for sections that have onReferenceStandardChange method in their ReferenceState
          if (section.module.ReferenceState?.onReferenceStandardChange) {
            section.module.ReferenceState.onReferenceStandardChange(
              newStandardKey
            );
            console.log(
              `[ReferenceToggle] Updated ${section.id} for new reference standard`
            );
          }
        } catch (error) {
          console.error(
            `[ReferenceToggle] Error updating ${section.id} for standard change:`,
            error
          );
        }
      });

      // Trigger recalculations
      if (window.TEUI?.Calculator?.calculateAll) {
        window.TEUI.Calculator.calculateAll();
      }

      console.log(`[ReferenceToggle] Reference standard update complete`);
    }
  }

  /**
   * Legacy function for "Show Reference Inputs" - shows which inputs were applied from ReferenceValues
   * This highlights actual Reference inputs vs calculated values
   */
  function toggleReferenceInputsView() {
    isViewingReferenceInputs = !isViewingReferenceInputs;

    // Add/Remove body class for styling
    document.body.classList.toggle(
      "viewing-reference-inputs",
      isViewingReferenceInputs
    );

    // Update button text
    const viewRefInputsBtn = document.getElementById(
      VIEW_REFERENCE_INPUTS_BUTTON_ID
    );
    if (viewRefInputsBtn) {
      viewRefInputsBtn.textContent = isViewingReferenceInputs
        ? BUTTON_TEXT_SHOW_TARGET_INPUTS
        : BUTTON_TEXT_HIGHLIGHT_REFERENCE_VALUES;
    }

    // This feature needs to be implemented to highlight Reference input fields
    // from ReferenceValues.js vs calculated values
    console.log(
      `[ReferenceToggle] Reference inputs view: ${isViewingReferenceInputs ? "ON" : "OFF"}`
    );

    // TODO: Implement visual highlighting of Reference input fields
    // This should show which fields come from ReferenceValues.js based on d_13 selection
  }

  /**
   * Legacy compatibility function
   */
  function isReferenceMode() {
    return isShowingReference;
  }

  /**
   * Get comparison value - now reads from StateManager with ref_ prefix
   */
  function getCompareValue(fieldId) {
    if (window.TEUI?.StateManager) {
      return window.TEUI.StateManager.getValue(`ref_${fieldId}`);
    }
    return null;
  }

  /**
   * PHASE 2: Three Reference Setup Functions
   * These implement the core functionality from Master-Reference-Roadmap.md
   */

  /**
   * HELPER: Get field IDs for a section using FieldManager
   */
  function getFieldIdsForSection(sectionId) {
    try {
      // Use FieldManager to get field definitions for this section
      if (window.TEUI?.FieldManager?.getFieldsBySection) {
        const fields = window.TEUI.FieldManager.getFieldsBySection(
          getUINameForSection(sectionId)
        );
        return Object.keys(fields);
      }

      // Fallback: Try direct section module access
      if (window.TEUI?.SectionModules?.[sectionId]?.getFields) {
        const fields = window.TEUI.SectionModules[sectionId].getFields();
        return Object.keys(fields);
      }

      console.warn(
        `[ReferenceToggle] Could not get field IDs for section ${sectionId}`
      );
      return [];
    } catch (error) {
      console.error(
        `[ReferenceToggle] Error getting field IDs for ${sectionId}:`,
        error
      );
      return [];
    }
  }

  /**
   * HELPER: Convert section ID to UI name for FieldManager
   */
  function getUINameForSection(sectionId) {
    const mapping = {
      sect01: "keyValues",
      sect02: "buildingInfo",
      sect03: "climateCalculations",
      sect04: "actualTargetEnergy",
      sect05: "emissions",
      sect06: "onSiteEnergy",
      sect07: "waterUse",
      sect08: "indoorAirQuality",
      sect09: "occupantInternalGains",
      sect10: "envelopeRadiantGains",
      sect11: "envelopeTransmissionLosses",
      sect12: "volumeSurfaceMetrics",
      sect13: "mechanicalLoads",
      sect14: "tediSummary",
      sect15: "teuiSummary",
    };
    return mapping[sectionId] || sectionId;
  }

  /**
   * HELPER: Apply mirror highlighting to fields in Reference model
   * @param {Array<string>} fieldIds - Array of field IDs that were copied
   * @param {string} mode - Mirror mode: 'geometry', 'geometry-plus-code', 'all'
   */
  function applyMirrorHighlights(fieldIds, mode) {
    console.log(
      `[ReferenceToggle] 🎨 Applying mirror highlights to ${fieldIds.length} fields (mode: ${mode})`
    );

    // Small delay to ensure DOM is updated after setValue calls
    setTimeout(() => {
      let highlightCount = 0;
      let notFoundCount = 0;
      const notFoundFields = [];

      fieldIds.forEach(fieldId => {
        // Skip d_13 (never copied)
        if (fieldId === "d_13") return;

        // Get field classification
        const classification = getFieldClassification(fieldId);
        if (!classification) {
          // Field not in classification map - skip
          console.warn(`[ReferenceToggle] Field ${fieldId} not in G/C/A classification map`);
          return;
        }

        // Determine if this field should be highlighted based on mode
        let shouldHighlight = false;
        if (mode === "geometry") {
          shouldHighlight = classification === "G";
        } else if (mode === "geometry-plus-code") {
          shouldHighlight = classification === "G" || classification === "C";
        } else if (mode === "all") {
          shouldHighlight = true; // All fields (G + C + A)
        }

        if (!shouldHighlight) return;

        // Try multiple selector strategies to find the field element
        let element = null;

        // Strategy 1: Direct data-field-id attribute (most reliable)
        const selectors = [
          `[data-field-id="ref_${fieldId}"]`,
          `[data-field-id="${fieldId}"]`,
        ];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            // Found element(s) - highlight all (input, container, etc.)
            elements.forEach(el => {
              el.classList.add("mirror-highlight");
              highlightCount++;
            });
            element = elements[0];
            break;
          }
        }

        // Strategy 2: Find input/select/textarea by name attribute
        if (!element) {
          const nameSelectors = [
            `input[name="ref_${fieldId}"]`,
            `select[name="ref_${fieldId}"]`,
            `textarea[name="ref_${fieldId}"]`,
          ];
          for (const selector of nameSelectors) {
            element = document.querySelector(selector);
            if (element) {
              element.classList.add("mirror-highlight");
              // Also highlight parent td if it exists
              const td = element.closest('td');
              if (td) {
                td.classList.add("mirror-highlight");
              }
              highlightCount++;
              break;
            }
          }
        }

        if (!element) {
          notFoundCount++;
          notFoundFields.push(fieldId);
        }
      });

      console.log(
        `[ReferenceToggle] ✨ Applied ${highlightCount} mirror highlights`
      );

      if (notFoundCount > 0) {
        console.warn(
          `[ReferenceToggle] ⚠️  Could not find DOM elements for ${notFoundCount} fields`
        );
        if (notFoundFields.length <= 10) {
          console.warn(`[ReferenceToggle] Not found: [${notFoundFields.join(", ")}]`);
        }
      }

      // Setup one-time removal listener
      if (highlightCount > 0) {
        setupHighlightRemovalListener();
      }
    }, 100); // 100ms delay to ensure DOM updates are complete
  }

  /**
   * HELPER: Setup one-time event listener to remove highlights on user interaction
   */
  function setupHighlightRemovalListener() {
    // Remove any existing listener
    if (window.TEUI.ReferenceToggle._highlightRemovalHandler) {
      document.removeEventListener(
        "click",
        window.TEUI.ReferenceToggle._highlightRemovalHandler
      );
      document.removeEventListener(
        "input",
        window.TEUI.ReferenceToggle._highlightRemovalHandler
      );
      document.removeEventListener(
        "change",
        window.TEUI.ReferenceToggle._highlightRemovalHandler
      );
    }

    // Create new handler
    const removeHighlights = function () {
      console.log(
        "[ReferenceToggle] User interaction detected - removing mirror highlights"
      );

      const highlightedElements = document.querySelectorAll(".mirror-highlight");
      highlightedElements.forEach(el => {
        // Add fade-out class for smooth transition
        el.classList.add("mirror-highlight-fade-out");
        // Remove highlight class after animation
        setTimeout(() => {
          el.classList.remove("mirror-highlight");
          el.classList.remove("mirror-highlight-fade-out");
        }, 500);
      });

      // Remove event listeners after first trigger
      document.removeEventListener("click", removeHighlights);
      document.removeEventListener("input", removeHighlights);
      document.removeEventListener("change", removeHighlights);
      window.TEUI.ReferenceToggle._highlightRemovalHandler = null;
    };

    // Store handler reference
    window.TEUI.ReferenceToggle._highlightRemovalHandler = removeHighlights;

    // Add event listeners
    document.addEventListener("click", removeHighlights, { once: false });
    document.addEventListener("input", removeHighlights, { once: false });
    document.addEventListener("change", removeHighlights, { once: false });

    console.log(
      "[ReferenceToggle] Highlight removal listener installed - highlights will clear on next user interaction"
    );
  }

  /**
   * Helper: Determine if a field should be copied based on mirror mode
   * @param {string} fieldId - Field identifier (e.g., 'd_13', 'f_85')
   * @param {string} mode - Mirror mode: 'geometry', 'geometry-plus-code', 'all'
   * @returns {boolean} - True if field should be copied
   */
  function shouldCopyFieldForMode(fieldId, mode) {
    // Explicit exclusions for ALL modes
    if (fieldId === "d_13") return false; // Building standard - user sets independently

    // Mode: 'all' - copy everything except d_13
    if (mode === "all") return true;

    // Mode: 'geometry' or 'geometry-plus-code' - exclude performance fields (Category 2)
    // Performance field patterns based on CSV export analysis
    const performancePatterns = [
      /^[a-z]_(39|41)$/, // Typology selection, User modelled embodied carbon (code/performance features)
      /^[a-z]_(51|52|53)$/, // DHW system type, efficiency, DWHR
      /^[a-z]_(66|67)$/, // Lighting density, equipment efficiency
      /^f_(73|74|75|76|77|78)$/, // SHGC values (window/door solar heat gain)
      /^[a-z]_80$/, // Gains utilization factor (n-Factor)
      /^f_(85|86|87|94|95)$/, // RSI values (thermal resistance)
      /^g_(88|89|90|91|92|93)$/, // U-values (window/door thermal transmittance)
      /^[a-z]_97$/, // Thermal bridge penalty
      /^[a-z]_(113|115|116|118|119|120)$/, // Equipment types and performance
    ];

    // Check if field matches any performance pattern
    for (const pattern of performancePatterns) {
      if (pattern.test(fieldId)) {
        return false; // Exclude from geometry modes
      }
    }

    // Default: include in geometry modes
    return true;
  }

  /**
   * 1. Mirror Geometry: Copy ONLY geometric/configuration fields from Target to Reference
   * Excludes performance parameters (RSI values, equipment efficiencies, etc.)
   * Use case: "Same building shape, different performance specs"
   */
  function mirrorGeometry() {
    try {
      const sections = getAllDualStateSections();
      console.log(
        `[ReferenceToggle] Mirror Geometry: Processing ${sections.length} sections`
      );

      let totalFieldsCopied = 0;
      let totalFieldsSkipped = 0;
      const copiedFieldIds = []; // Track all copied field IDs for highlighting

      sections.forEach(section => {
        console.log(`[ReferenceToggle] Processing ${section.id}...`);

        // Get field IDs for this section
        const fieldIds = getFieldIdsForSection(section.id);
        console.log(
          `[ReferenceToggle] Found ${fieldIds.length} fields for ${section.id}`
        );

        if (fieldIds.length === 0) {
          console.warn(
            `[ReferenceToggle] No fields found for ${section.id} - skipping`
          );
          return;
        }

        // Save current mode
        const originalMode = section.modeManager.currentMode;

        // Switch to target mode to read values
        section.modeManager.switchMode("target");

        // Read Target values, filtering to geometry fields only
        const targetValues = {};
        const skippedFields = [];
        fieldIds.forEach(fieldId => {
          if (shouldCopyFieldForMode(fieldId, "geometry")) {
            const value = section.modeManager.getValue(fieldId);
            if (value !== null && value !== undefined && value !== "") {
              targetValues[fieldId] = value;
            }
          } else {
            skippedFields.push(fieldId);
          }
        });

        console.log(
          `[ReferenceToggle] Geometry mode: ${Object.keys(targetValues).length} fields to copy, ${skippedFields.length} performance fields skipped`
        );
        if (skippedFields.length > 0 && skippedFields.length <= 10) {
          console.log(
            `[ReferenceToggle] Skipped performance fields: [${skippedFields.join(", ")}]`
          );
        }

        // Switch to reference mode to write values
        section.modeManager.switchMode("reference");

        // Copy Target geometry values to Reference state
        Object.entries(targetValues).forEach(([fieldId, value]) => {
          section.modeManager.setValue(fieldId, value, "imported"); // Use "imported" for highest priority
          totalFieldsCopied++;
          copiedFieldIds.push(fieldId); // Track for highlighting
        });
        totalFieldsSkipped += skippedFields.length;

        // Restore original mode and refresh UI
        section.modeManager.switchMode(originalMode);
        section.modeManager.refreshUI();

        console.log(
          `[ReferenceToggle] Copied ${Object.keys(targetValues).length} geometry values to Reference state for ${section.id}`
        );
      });

      console.log(
        `🔗 Mirror Geometry: Successfully copied ${totalFieldsCopied} geometry fields, skipped ${totalFieldsSkipped} performance fields`
      );
      console.log(
        "✅ Geometry fields copied (areas, volumes, location, occupancy)"
      );
      console.log(
        "❌ Performance fields skipped (RSI values, equipment efficiencies) - these should come from ReferenceValues or user edits"
      );

      // Trigger automatic recalculation (like Tilt button)
      console.log("[ReferenceToggle] Triggering automatic recalculation...");
      if (window.TEUI?.Calculator?.calculateAll) {
        window.TEUI.Calculator.calculateAll();

        // Update all section displays
        sections.forEach(section => {
          if (
            section.modeManager &&
            typeof section.modeManager.updateCalculatedDisplayValues ===
              "function"
          ) {
            section.modeManager.updateCalculatedDisplayValues();
          }
        });

        console.log(
          "[ReferenceToggle] ✅ Automatic recalculation complete - e_10 should now reflect mirrored values"
        );
      } else {
        console.warn(
          "[ReferenceToggle] Calculator not available - manual Tilt may be needed"
        );
      }

      // Apply mirror highlights to copied fields
      applyMirrorHighlights(copiedFieldIds, "geometry");
    } catch (error) {
      console.error("[ReferenceToggle] Mirror Geometry failed:", error);
    }
  }

  /**
   * 2. Mirror Geometry + Code: Copy geometry fields, then overlay ReferenceValues.js
   * Use case: "Compare my design vs building code minimums" (most common)
   */
  function mirrorGeometryPlusCode() {
    try {
      const standard =
        window.TEUI?.StateManager?.getValue("ref_d_13") || // Use Reference model's standard
        window.TEUI?.StateManager?.getValue("d_13") || // Fallback to Target standard
        "OBC SB12 3.1.1.2.C1"; // Final fallback

      const refValues = window.TEUI?.ReferenceValues?.[standard] || {};

      console.log(
        `[ReferenceToggle] Mirror Geometry + Code: Using Reference standard "${standard}"`
      );
      console.log(
        `[ReferenceToggle] Found ${Object.keys(refValues).length} reference values for this standard`
      );

      // NOTE: We don't call mirrorGeometry() here because we need to collect
      // all copied field IDs (G + C) for highlighting with "geometry-plus-code" mode
      // Instead, we'll copy geometry fields manually and track them

      const sections = getAllDualStateSections();
      let totalFieldsCopied = 0;
      const copiedFieldIds = []; // Track G + C fields for highlighting

      // First: Copy geometry fields (same as mirrorGeometry)
      sections.forEach(section => {
        const fieldIds = getFieldIdsForSection(section.id);
        if (fieldIds.length === 0) return;

        const originalMode = section.modeManager.currentMode;
        section.modeManager.switchMode("target");

        const targetValues = {};
        fieldIds.forEach(fieldId => {
          if (shouldCopyFieldForMode(fieldId, "geometry")) {
            const value = section.modeManager.getValue(fieldId);
            if (value !== null && value !== undefined && value !== "") {
              targetValues[fieldId] = value;
            }
          }
        });

        section.modeManager.switchMode("reference");
        Object.entries(targetValues).forEach(([fieldId, value]) => {
          section.modeManager.setValue(fieldId, value, "imported"); // Use "imported" for highest priority
          totalFieldsCopied++;
          copiedFieldIds.push(fieldId);
        });

        section.modeManager.switchMode(originalMode);
        section.modeManager.refreshUI();
      });

      // Then overlay ReferenceValues subset for building code compliance
      let totalOverlayFields = 0;

      sections.forEach(section => {
        console.log(
          `[ReferenceToggle] Applying ReferenceValues overlay to ${section.id}...`
        );

        // Save current mode
        const originalMode = section.modeManager.currentMode;

        // Switch to reference mode to apply overlay
        section.modeManager.switchMode("reference");

        // Apply ReferenceValues overlay (building code minimums)
        const appliedFields = [];
        Object.entries(refValues).forEach(([fieldId, value]) => {
          // Only apply if this section manages this field
          const fieldIds = getFieldIdsForSection(section.id);
          if (fieldIds.includes(fieldId)) {
            section.modeManager.setValue(fieldId, value, "imported"); // Use "imported" for highest priority
            appliedFields.push(fieldId);
            copiedFieldIds.push(fieldId); // Track C fields for highlighting
            totalOverlayFields++;
          }
        });

        // Restore original mode and refresh UI
        section.modeManager.switchMode(originalMode);
        section.modeManager.refreshUI();

        if (appliedFields.length > 0) {
          console.log(
            `[ReferenceToggle] Applied ${appliedFields.length} code minimum values to ${section.id}: [${appliedFields.join(", ")}]`
          );
        }
      });

      console.log(
        `🔗 Mirror Geometry + Code: Applied ${totalOverlayFields} building code minimum values`
      );
      console.log(
        `📋 Standard: "${standard}" - Reference model now uses Target geometry with code minimum performance`
      );

      // Trigger automatic recalculation (like Tilt button)
      console.log("[ReferenceToggle] Triggering automatic recalculation...");
      if (window.TEUI?.Calculator?.calculateAll) {
        window.TEUI.Calculator.calculateAll();

        // Update all section displays
        sections.forEach(section => {
          if (
            section.modeManager &&
            typeof section.modeManager.updateCalculatedDisplayValues ===
              "function"
          ) {
            section.modeManager.updateCalculatedDisplayValues();
          }
        });

        console.log(
          "[ReferenceToggle] ✅ Automatic recalculation complete - e_10 should now reflect mirrored values with code minimums"
        );
      } else {
        console.warn(
          "[ReferenceToggle] Calculator not available - manual Tilt may be needed"
        );
      }

      // Apply mirror highlights to copied fields (G + C)
      applyMirrorHighlights(copiedFieldIds, "geometry-plus-code");
    } catch (error) {
      console.error(
        "[ReferenceToggle] Mirror Geometry + Code failed:",
        error
      );
    }
  }

  /**
   * 3. Mirror All Inputs: Copy ALL fields from Target to Reference (perfect clone)
   * Excludes only d_13 (building standard - user sets independently)
   * Use case: "Start with identical models, then tweak one specific parameter"
   */
  function mirrorAllInputs() {
    try {
      const sections = getAllDualStateSections();
      console.log(
        `[ReferenceToggle] Mirror All Inputs: Processing ${sections.length} sections`
      );

      let totalFieldsCopied = 0;
      const copiedFieldIds = []; // Track all copied field IDs for highlighting

      sections.forEach(section => {
        console.log(`[ReferenceToggle] Processing ${section.id}...`);

        // Get field IDs for this section
        const fieldIds = getFieldIdsForSection(section.id);
        console.log(
          `[ReferenceToggle] Found ${fieldIds.length} fields for ${section.id}`
        );

        if (fieldIds.length === 0) {
          console.warn(
            `[ReferenceToggle] No fields found for ${section.id} - skipping`
          );
          return;
        }

        // Save current mode
        const originalMode = section.modeManager.currentMode;

        // Switch to target mode to read values
        section.modeManager.switchMode("target");

        // Read ALL Target values (except d_13)
        const targetValues = {};
        fieldIds.forEach(fieldId => {
          if (shouldCopyFieldForMode(fieldId, "all")) {
            const value = section.modeManager.getValue(fieldId);
            if (value !== null && value !== undefined && value !== "") {
              targetValues[fieldId] = value;
            }
          }
        });

        console.log(
          `[ReferenceToggle] Read ${Object.keys(targetValues).length} Target values from ${section.id}`
        );

        // Switch to reference mode to write values
        section.modeManager.switchMode("reference");

        // Copy ALL Target values to Reference state
        Object.entries(targetValues).forEach(([fieldId, value]) => {
          section.modeManager.setValue(fieldId, value, "imported"); // Use "imported" for highest priority
          totalFieldsCopied++;
          copiedFieldIds.push(fieldId); // Track for highlighting
        });

        // Restore original mode and refresh UI
        section.modeManager.switchMode(originalMode);
        section.modeManager.refreshUI();

        console.log(
          `[ReferenceToggle] Copied ${Object.keys(targetValues).length} values to Reference state for ${section.id}`
        );
      });

      console.log(
        `🔗 Mirror All Inputs: Successfully copied ${totalFieldsCopied} total fields`
      );
      console.log(
        "✅ Perfect clone created - Reference model is now identical to Target model"
      );
      console.log(
        "ℹ️  Excluded: d_13 (building standard) - user can set Reference standard independently"
      );

      // Trigger automatic recalculation (like Tilt button)
      console.log("[ReferenceToggle] Triggering automatic recalculation...");
      if (window.TEUI?.Calculator?.calculateAll) {
        window.TEUI.Calculator.calculateAll();

        // Update all section displays
        sections.forEach(section => {
          if (
            section.modeManager &&
            typeof section.modeManager.updateCalculatedDisplayValues ===
              "function"
          ) {
            section.modeManager.updateCalculatedDisplayValues();
          }
        });

        console.log(
          "[ReferenceToggle] ✅ Automatic recalculation complete - e_10 should now equal h_10"
        );
      } else {
        console.warn(
          "[ReferenceToggle] Calculator not available - manual Tilt may be needed"
        );
      }

      // Apply mirror highlights to all copied fields (G + C + A)
      applyMirrorHighlights(copiedFieldIds, "all");
    } catch (error) {
      console.error("[ReferenceToggle] Mirror All Inputs failed:", error);
    }
  }

  /**
   * LEGACY: Mirror Target - Copy all Target values to Reference state
   * @deprecated Use mirrorAllInputs() instead
   * CORRECTED: Uses proper ModeManager facade pattern
   */
  function mirrorTarget() {
    try {
      const sections = getAllDualStateSections();
      console.log(
        `[ReferenceToggle] Mirror Target: Processing ${sections.length} sections`
      );

      let totalFieldsCopied = 0;

      sections.forEach((section, index) => {
        console.log(`[ReferenceToggle] Processing ${section.id}...`);

        // Get field IDs for this section
        const fieldIds = getFieldIdsForSection(section.id);
        console.log(
          `[ReferenceToggle] Found ${fieldIds.length} fields for ${section.id}`
        );

        if (fieldIds.length === 0) {
          console.warn(
            `[ReferenceToggle] No fields found for ${section.id} - skipping`
          );
          return;
        }

        // Save current mode
        const originalMode = section.modeManager.currentMode;

        // Switch to target mode to read values
        section.modeManager.switchMode("target");

        // Read all Target values using ModeManager facade
        const targetValues = {};
        fieldIds.forEach(fieldId => {
          const value = section.modeManager.getValue(fieldId);
          if (value !== null && value !== undefined && value !== "") {
            targetValues[fieldId] = value;
          }
        });

        console.log(
          `[ReferenceToggle] Read ${Object.keys(targetValues).length} Target values from ${section.id}`
        );

        // Switch to reference mode to write values
        section.modeManager.switchMode("reference");

        // Copy Target values to Reference state
        Object.entries(targetValues).forEach(([fieldId, value]) => {
          section.modeManager.setValue(fieldId, value, "mirrored");
          totalFieldsCopied++;
        });

        // Restore original mode and refresh UI
        section.modeManager.switchMode(originalMode);
        section.modeManager.refreshUI();

        console.log(
          `[ReferenceToggle] Copied ${Object.keys(targetValues).length} values to Reference state for ${section.id}`
        );
      });

      console.log(
        `🔗 Mirror Target: Successfully copied ${totalFieldsCopied} total fields across ${sections.length} sections`
      );
      console.log(
        "🎯 Test: Switch to Reference mode to verify e_10 (Reference TEUI) equals h_10 (Target TEUI)"
      );
    } catch (error) {
      console.error("[ReferenceToggle] Mirror Target failed:", error);
    }
  }

  /**
   * 2. Mirror Target + Reference: Copy Target + overlay ReferenceValues subset
   * CORRECTED: Uses proper ModeManager facade and ReferenceValues.js integration
   */
  function mirrorTargetWithReference() {
    try {
      const standard =
        window.TEUI?.StateManager?.getValue("d_13") || "OBC SB12 3.1.1.2.C1";
      const refValues = window.TEUI?.ReferenceValues?.[standard] || {};

      console.log(
        `[ReferenceToggle] Mirror Target + Reference: Using standard "${standard}"`
      );
      console.log(
        `[ReferenceToggle] Found ${Object.keys(refValues).length} reference values for this standard`
      );

      // First execute Mirror Target to copy all Target values
      mirrorTarget();

      // Then overlay ReferenceValues subset for building code compliance
      const sections = getAllDualStateSections();
      let totalOverlayFields = 0;

      sections.forEach(section => {
        console.log(
          `[ReferenceToggle] Applying ReferenceValues overlay to ${section.id}...`
        );

        // Save current mode
        const originalMode = section.modeManager.currentMode;

        // Switch to reference mode to apply overlay
        section.modeManager.switchMode("reference");

        // Apply ReferenceValues overlay (building code minimums)
        const appliedFields = [];
        Object.entries(refValues).forEach(([fieldId, value]) => {
          // Only apply if this section manages this field
          const fieldIds = getFieldIdsForSection(section.id);
          if (fieldIds.includes(fieldId)) {
            section.modeManager.setValue(fieldId, value, "reference-standard");
            appliedFields.push(fieldId);
            totalOverlayFields++;
          }
        });

        // Restore original mode and refresh UI
        section.modeManager.switchMode(originalMode);
        section.modeManager.refreshUI();

        if (appliedFields.length > 0) {
          console.log(
            `[ReferenceToggle] Applied ${appliedFields.length} reference standard values to ${section.id}: [${appliedFields.join(", ")}]`
          );
        }
      });

      console.log(
        `🔗 Mirror Target + Reference: Applied ${totalOverlayFields} reference standard values across all sections`
      );
      console.log(
        `📋 Standard: "${standard}" - building code minimums now overlay Target inputs`
      );
    } catch (error) {
      console.error(
        "[ReferenceToggle] Mirror Target + Reference failed:",
        error
      );
    }
  }

  /**
   * 3. Reference Independence: No setup needed - sections already independent
   */
  function enableReferenceIndependence() {
    console.log(
      "🔓 Reference Independence: Sections are already independent by default"
    );
    // No action needed - dual-state architecture already provides independence
  }

  return {
    initialize,
    isReferenceMode,
    getCompareValue,
    toggleReferenceDisplay,
    switchAllSectionsMode, // Expose for external use
    getAllDualStateSections, // Expose for debugging
    // ✅ NEW: Three mirror functions (2025-11-27)
    mirrorGeometry, // Copy geometry/configuration only
    mirrorGeometryPlusCode, // Copy geometry + overlay ReferenceValues.js
    mirrorAllInputs, // Copy everything (perfect clone)
    // LEGACY: Old mirror functions (deprecated, keeping for backwards compatibility)
    mirrorTarget, // @deprecated Use mirrorAllInputs() instead
    mirrorTargetWithReference, // @deprecated Use mirrorGeometryPlusCode() instead
    enableReferenceIndependence,
    // ✅ NEW: Expose for Key Values header toggle
    getCurrentMode, // Get current global mode
    switchMode, // Switch all sections to a mode
  };
})();
