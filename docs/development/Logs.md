 Desktop device detected
 
🧘 ZenMaster loaded. Use these commands to discover true dependencies:

  zenEnable()         - Start tracing all getValue() calls
  zenDisable()        - Stop tracing and restore original methods
  zenReset()          - Clear all traced data
  zenReport()         - Print discovered dependencies
  zenValidate()       - Compare discovered vs declared dependencies
  zenLabels()         - Find fields missing labels (for graph viz & debugging)
  zenTypos()          - Detect potential typos in dependency declarations
  zenExport()         - Export dependency graph JSON to console
  zenExportFile()     - Download dependency graph as JSON file
  zenExportSections() - Generate code snippets for section definitions
  zenStatus()         - Show current tracing status

Example workflow:
  1. zenEnable()
  2. Interact with the app (change values, trigger calculations)
  3. zenValidate()      // Find MISSING deps & conditional patterns
  4. zenLabels()        // Find unlabeled fields for graph viz
  5. zenTypos()         // Find likely typos in dependency declarations
  6. zenExportFile()    // Download for use in Dependency.js
  7. zenDisable()

 [ppConfig] Configuration loaded with 14 axes
 [pcOptimization] Optimization module loaded
 [pcRendering] Rendering module loaded
 [ParallelCoordinates] Module loaded (Refactored Nov 30, 2025)
 [S18] Parallel Coordinates section loaded
 [S02] Registered dependencies from field metadata
 [S02] "Set Values" button wired successfully
 S02: Target defaults set from field definitions - single source of truth
 S02: Reference defaults set from field definitions - single source of truth with mode overrides
 [S02] Registered dependencies from field metadata
 [S02] "Set Values" button wired successfully
 [S02] Area updated to 1427.2 - letting downstream sections handle calculations
 [S02] Refreshing UI for TARGET mode
 [S02] Updated h_12 (reporting year) slider = "2022" (target mode)
 [S02] Updated h_13 (service life) slider = "50" (target mode)
 [S02] Updated h_15 = "1,427.20" (target mode)
 [S02] Updated i_17 = "8154" (target mode)
 [S02] Updated l_12 = "$0.1300" (target mode)
 [S02] Updated l_13 = "$0.5070" (target mode)
 [S02] Updated l_14 = "$1.6200" (target mode)
 [S02] Updated l_15 = "$180.00" (target mode)
 [S02] Updated l_16 = "$1.5000" (target mode)
 S03: Sliders initialized via FieldManager
 S03: Section rendered - initializing Self-Contained State Module.
 S03: Target defaults set from field definitions - single source of truth
 S03: Reference defaults set from field definitions - single source of truth
 S03: Weather Data button setup complete
 S03: ModeManager exposed globally for cross-section integration.
 S03: Checking climate data availability (attempt 1/10)
 S03: Climate data available Array(13)
 S03: Synced province "ON" to StateManager for cross-section communication
 City dropdown updated for ON - selected: Alexandria
 S03: Sliders initialized via FieldManager
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 S12: Section rendered - initializing Pattern A Dual-State Module.
 [S12 DEBUG] ReferenceState.initialize() called
 [S12 DEBUG] ReferenceState.setDefaults() called - no localStorage, using defaults
 [S12 DEBUG] Using reference standard: OBC SB10 5.5-6 Z6
 [S12 DEBUG] ReferenceState defaults set: Object
 [S12 DEBUG] StateManager available - Publishing 6 Reference default fields...
 [S12 DEBUG] Publishing ref_d_103 = 1 (from defaults)
 [S12 DEBUG] Publishing ref_g_103 = Exposed (from defaults)
 [S12 DEBUG] Publishing ref_d_105 = 8319.50 (from defaults)
 [S12 DEBUG] Publishing ref_g_106 = 5.15 (from defaults)
 [S12 DEBUG] Publishing ref_d_108 = MEASURED (from defaults)
 [S12 DEBUG] Publishing ref_g_109 = 1.30 (from defaults)
 [S12 DEBUG] Reference defaults publishing complete
 S12: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [S12] ✅ Bidirectional WOMBAT sync listeners initialized
 [S12] ✅ CLIMATE LISTENERS ADDED - Ready for d_20/d_21 changes
 S12: Pattern A initialization complete.
 S03: Self-Contained State Module initialization complete
 S05: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 S06: Pattern A initialization starting...
 S06: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔄 [S06] updateCalculatedDisplayValues: mode=target
 S06: Pattern A initialization complete.
Section07.js:1769 🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions
Section07.js:48 🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions
Section07.js:53 ✅ [S07] TargetState.setDefaults: d_49="User Defined", d_51="Heatpump"
Section07.js:61 🌐 [S07] TargetState.setDefaults: Published to StateManager
Section07.js:106 🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults
Section07.js:115 ✅ [S07] ReferenceState.setDefaults: All 6 field defaults loaded
Section07.js:151 🔗 [S07] ReferenceState.setDefaults: Published all 6 Reference defaults with ref_ prefix
Section08.js:787 [S08] S04 listeners setup complete
Section09.js:54 S09: Target defaults loaded from field definitions
Section09.js:173 S09: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6, lighting: 2.0
Section09.js:422 S09: UI refreshed for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section09.js:422 S09: UI refreshed for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section10.js:3013 S10: Section rendered - initializing Self-Contained State Module.
Section10.js:2988 S10: Simplified global StateManager listeners added
Section10.js:3036 S10: ModeManager exposed globally for cross-section integration.
Section10.js:2966 S10: Target listener triggered by i_103, recalculating all.
Section10.js:2966 S10: Target listener triggered by i_103, recalculating all.
Section10.js:2966 S10: Target listener triggered by i_103, recalculating all.
Section10.js:2966 S10: Target listener triggered by i_103, recalculating all.
Section10.js:2966 S10: Target listener triggered by i_103, recalculating all.
Section11.js:2344 [S11] Setting up S10 area listeners...
Section11.js:2379 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3525 S11: Section rendered - initializing Self-Contained State Module.
Section11.js:303 [S11 REF DEFAULTS] Published ref_d_85=1411.52 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_d_86=705.27 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_d_87=0.00 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_d_94=0.00 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_d_95=1100.92 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_d_96=29.70 to StateManager
Section11.js:3509 [S11] Listener: ref_d_97 changed → recalculating (src=default)
Section11.js:3509 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
Section10.js:2966 S10: Target listener triggered by i_97, recalculating all.
Section10.js:2966 S10: Target listener triggered by i_98, recalculating all.
Section10.js:2966 S10: Target listener triggered by i_103, recalculating all.
Section10.js:2966 S10: Target listener triggered by i_103, recalculating all.
Section11.js:303 [S11 REF DEFAULTS] Published ref_d_97=50 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_f_85=5.3 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_f_86=4.1 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_f_87=6.6 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_f_94=1.8 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_f_95=3.5 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_g_88=1.99 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_g_89=1.42 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_g_90=1.42 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_g_91=1.42 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_g_92=1.42 to StateManager
Section11.js:303 [S11 REF DEFAULTS] Published ref_g_93=1.42 to StateManager
Section11.js:310 S11: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
Section11.js:2344 [S11] Setting up S10 area listeners...
Section11.js:2379 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3544 S11: ModeManager exposed globally for cross-section integration.
Section11.js:3552 [S11 Area Sync] S11 initialization complete - sync functions now enabled
Section11.js:2217 [S11 Area Sync] DUAL-STATE SYNC - populating BOTH Target and Reference states
Section11.js:2220 [S11 Area Sync] Reason: d_88=undefined, ref_d_73 in StateManager=7.50
Section11.js:2283 [S11 Area Sync] Applying 0 target updates, 6 reference updates
Section11.js:2306 [S11 Area Sync] Refreshing UI...
Section11.js:2311 [S11 Area Sync] Triggering single batch recalculation...
Section11.js:2314 [S11 Area Sync] Sync completed successfully
Section11.js:3569 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
Section12.js:3439 [g_109] Locked (not MEASURED mode), preserving state value
Section12.js:3326 [S12] ✅ Bidirectional WOMBAT sync listeners initialized
Section10.js:2966 S10: Target listener triggered by m_121, recalculating all.
Cooling.js:621 [Cooling Stage 2] ⏭️ Skipping - No active cooling system (d_116="No Cooling")
Section14.js:1429 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
Section14.js:1438 S14: Section rendered - initializing Pattern A Dual-State Module.
Section14.js:80 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
Section14.js:1429 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
Cooling.js:621 [Cooling Stage 2] ⏭️ Skipping - No active cooling system (d_116="No Cooling")
Cooling.js:621 [Cooling Stage 2] ⏭️ Skipping - No active cooling system (d_116="No Cooling")
Cooling.js:621 [Cooling Stage 2] ⏭️ Skipping - No active cooling system (d_116="No Cooling")
Cooling.js:621 [Cooling Stage 2] ⏭️ Skipping - No active cooling system (d_116="No Cooling")
Section14.js:1465 S14: Pattern A initialization complete.
Section18.js:36 [S18] initializeEventHandlers called
Section19.js:1259 [WOMBAT] Initializing event handlers
Section19.js:1425 [WOMBAT SYNC] Found existing ref_g_106 = 5.15 in StateManager
Section19.js:1428 [WOMBAT SYNC] Triggering initial calculateAll() for Reference pre-calculation
Section19.js:1692 [WOMBAT calculateAll] Called - Current mode: target, isActivated: false
Section19.js:765 [WOMBAT-2] Prismatic solver (Target mode)
Section19.js:784 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³
Section19.js:785 [WOMBAT-2] Derived: width=33.18m, height=7.56m
Section19.js:791 [WOMBAT-2] Extrusion depth: 33.18m (should equal width for square)
Section19.js:765 [WOMBAT-2] Prismatic solver (Reference mode)
Section19.js:784 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³
Section19.js:785 [WOMBAT-2] Derived: width=33.18m, height=7.56m
Section19.js:791 [WOMBAT-2] Extrusion depth: 33.18m (should equal width for square)
Section19.js:1711 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
Section19.js:202 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
Section19.js:1715 [WOMBAT calculateAll] Complete
Section19.js:1575 [WOMBAT] Section 19 rendered
Section19.js:1602 [WOMBAT] Initialized d_151 = 8319.50 from S12 (d_105)
Section19.js:1607 [WOMBAT] Initialized d_150 = 1 from S12 (d_103)
Section19.js:1612 [WOMBAT] Initialized ref_d_151 = 8319.50 from S12 (ref_d_105)
Section19.js:1619 [WOMBAT] Initialized ref_d_150 = 1 from S12 (ref_d_103)
Section19.js:1259 [WOMBAT] Initializing event handlers
Section19.js:1425 [WOMBAT SYNC] Found existing ref_g_106 = 5.15 in StateManager
Section19.js:1428 [WOMBAT SYNC] Triggering initial calculateAll() for Reference pre-calculation
Section19.js:1692 [WOMBAT calculateAll] Called - Current mode: target, isActivated: false
Section19.js:765 [WOMBAT-2] Prismatic solver (Target mode)
Section19.js:784 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³
Section19.js:785 [WOMBAT-2] Derived: width=33.18m, height=7.56m
Section19.js:791 [WOMBAT-2] Extrusion depth: 33.18m (should equal width for square)
Section19.js:765 [WOMBAT-2] Prismatic solver (Reference mode)
Section19.js:784 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³
Section19.js:785 [WOMBAT-2] Derived: width=33.18m, height=7.56m
Section19.js:791 [WOMBAT-2] Extrusion depth: 33.18m (should equal width for square)
Section19.js:1711 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
Section19.js:202 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
Section19.js:1715 [WOMBAT calculateAll] Complete
Section20.js:1277 [S19] Notes section rendered
Section20.js:22 [S19] Notes & QC Monitor section loaded
Section02.js:699 [S02] Registered dependencies from field metadata
Section02.js:1046 [S02] "Set Values" button wired successfully
Section02.js:1581 S02: Target defaults set from field definitions - single source of truth
Section02.js:1533 S02: Loaded and merged Target state from localStorage
Section02.js:1690 S02: Reference defaults set from field definitions - single source of truth with mode overrides
Section02.js:699 [S02] Registered dependencies from field metadata
Section02.js:1046 [S02] "Set Values" button wired successfully
Section02.js:1454 [S02] Area updated to 1427.2 - letting downstream sections handle calculations
Section02.js:1852 [S02] Refreshing UI for TARGET mode
Section02.js:1912 [S02] Updated h_12 (reporting year) slider = "2022" (target mode)
Section02.js:1929 [S02] Updated h_13 (service life) slider = "50" (target mode)
Section02.js:1979 [S02] Updated h_15 = "1,427.20" (target mode)
Section02.js:1979 [S02] Updated i_17 = "8154" (target mode)
Section02.js:1979 [S02] Updated l_12 = "$0.1300" (target mode)
Section02.js:1979 [S02] Updated l_13 = "$0.5070" (target mode)
Section02.js:1979 [S02] Updated l_14 = "$1.6200" (target mode)
Section02.js:1979 [S02] Updated l_15 = "$180.00" (target mode)
Section02.js:1979 [S02] Updated l_16 = "$1.5000" (target mode)
Section03.js:2507 S03: Sliders initialized via FieldManager
Section03.js:2667 S03: Section rendered - initializing Self-Contained State Module.
Section03.js:2681 S03: ModeManager exposed globally for cross-section integration.
Section03.js:526 S03: Checking climate data availability (attempt 1/10)
Section03.js:534 S03: Climate data available Array(13)
Section03.js:2653 S03: Synced province "ON" to StateManager for cross-section communication
Section03.js:1362 City dropdown updated for ON - selected: Alexandria
Section03.js:2507 S03: Sliders initialized via FieldManager
Section03.js:1301 Section03: Province selected: ON
Section03.js:1362 City dropdown updated for ON - selected: Alexandria
Section03.js:2740 S03: Self-Contained State Module initialization complete
Section06.js:746 S06: Pattern A initialization starting...
Section06.js:128 S06: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
Section06.js:599 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
Section06.js:594 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
Section06.js:285 🔄 [S06] updateCalculatedDisplayValues: mode=target
Section06.js:770 S06: Pattern A initialization complete.
Section07.js:1769 🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions
Section07.js:48 🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions
Section07.js:53 ✅ [S07] TargetState.setDefaults: d_49="User Defined", d_51="Heatpump"
Section07.js:61 🌐 [S07] TargetState.setDefaults: Published to StateManager
Section07.js:106 🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults
Section07.js:115 ✅ [S07] ReferenceState.setDefaults: All 6 field defaults loaded
Section07.js:151 🔗 [S07] ReferenceState.setDefaults: Published all 6 Reference defaults with ref_ prefix
Section08.js:787 [S08] S04 listeners setup complete
Section09.js:422 S09: UI refreshed for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section09.js:422 S09: UI refreshed for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section10.js:3013 S10: Section rendered - initializing Self-Contained State Module.
Section10.js:2988 S10: Simplified global StateManager listeners added
Section10.js:3036 S10: ModeManager exposed globally for cross-section integration.
Section11.js:2344 [S11] Setting up S10 area listeners...
Section11.js:2379 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3525 S11: Section rendered - initializing Self-Contained State Module.
Section11.js:2344 [S11] Setting up S10 area listeners...
Section11.js:2379 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3544 S11: ModeManager exposed globally for cross-section integration.
Section11.js:3552 [S11 Area Sync] S11 initialization complete - sync functions now enabled
Section11.js:2224 [S11 Area Sync] Starting sync in target mode
Section11.js:2283 [S11 Area Sync] Applying 6 target updates, 0 reference updates
Section11.js:2306 [S11 Area Sync] Refreshing UI...
Section11.js:2311 [S11 Area Sync] Triggering single batch recalculation...
Section11.js:3509 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
Section10.js:2966 S10: Target listener triggered by i_97, recalculating all.
Section10.js:2966 S10: Target listener triggered by i_98, recalculating all.
Section11.js:3509 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
Section11.js:2314 [S11 Area Sync] Sync completed successfully
Section11.js:3569 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
Section12.js:3439 [g_109] Locked (not MEASURED mode), preserving state value
Section12.js:3326 [S12] ✅ Bidirectional WOMBAT sync listeners initialized
Section10.js:2966 S10: Target listener triggered by m_121, recalculating all.
Section14.js:1429 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
Section14.js:1438 S14: Section rendered - initializing Pattern A Dual-State Module.
Section14.js:80 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
Section14.js:1429 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
Section14.js:1465 S14: Pattern A initialization complete.
Section18.js:36 [S18] initializeEventHandlers called
Section19.js:1259 [WOMBAT] Initializing event handlers
Section19.js:1575 [WOMBAT] Section 19 rendered
Section19.js:1602 [WOMBAT] Initialized d_151 = 8319.50 from S12 (d_105)
Section19.js:1607 [WOMBAT] Initialized d_150 = 1 from S12 (d_103)
Section19.js:1259 [WOMBAT] Initializing event handlers
Section20.js:1277 [S19] Notes section rendered
Section20.js:22 [S19] Notes & QC Monitor section loaded
Section03.js:1301 Section03: Province selected: ON
Section03.js:1362 City dropdown updated for ON - selected: Alexandria
Clock.js:28 [CLOCK] Performance monitoring initialized
ParallelCoordinates.js:81 [ParallelCoordinates] Setting up initial state
ParallelCoordinates.js:94 [ParallelCoordinates] Initial state ready
Section02.js:699 [S02] Registered dependencies from field metadata
Section02.js:1046 [S02] "Set Values" button wired successfully
Section02.js:1581 S02: Target defaults set from field definitions - single source of truth
Section02.js:1533 S02: Loaded and merged Target state from localStorage
Section02.js:1690 S02: Reference defaults set from field definitions - single source of truth with mode overrides
Section02.js:699 [S02] Registered dependencies from field metadata
Section02.js:1046 [S02] "Set Values" button wired successfully
Section02.js:1454 [S02] Area updated to 1427.2 - letting downstream sections handle calculations
Section02.js:1852 [S02] Refreshing UI for TARGET mode
Section02.js:1912 [S02] Updated h_12 (reporting year) slider = "2022" (target mode)
Section02.js:1929 [S02] Updated h_13 (service life) slider = "50" (target mode)
Section02.js:1979 [S02] Updated h_15 = "1,427.20" (target mode)
Section02.js:1979 [S02] Updated i_17 = "8154" (target mode)
Section02.js:1979 [S02] Updated l_12 = "$0.1300" (target mode)
Section02.js:1979 [S02] Updated l_13 = "$0.5070" (target mode)
Section02.js:1979 [S02] Updated l_14 = "$1.6200" (target mode)
Section02.js:1979 [S02] Updated l_15 = "$180.00" (target mode)
Section02.js:1979 [S02] Updated l_16 = "$1.5000" (target mode)
Section03.js:2507 S03: Sliders initialized via FieldManager
Section03.js:2667 S03: Section rendered - initializing Self-Contained State Module.
Section03.js:2681 S03: ModeManager exposed globally for cross-section integration.
Section03.js:526 S03: Checking climate data availability (attempt 1/10)
Section03.js:534 S03: Climate data available Array(13)
Section03.js:2653 S03: Synced province "ON" to StateManager for cross-section communication
Section03.js:1362 City dropdown updated for ON - selected: Alexandria
Section03.js:2507 S03: Sliders initialized via FieldManager
Section03.js:1301 Section03: Province selected: ON
Section03.js:1362 City dropdown updated for ON - selected: Alexandria
Section03.js:2740 S03: Self-Contained State Module initialization complete
Section06.js:746 S06: Pattern A initialization starting...
Section06.js:128 S06: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
Section06.js:599 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
Section06.js:594 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
Section06.js:285 🔄 [S06] updateCalculatedDisplayValues: mode=target
Section06.js:770 S06: Pattern A initialization complete.
Section07.js:1769 🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions
Section07.js:48 🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions
Section07.js:53 ✅ [S07] TargetState.setDefaults: d_49="User Defined", d_51="Heatpump"
Section07.js:61 🌐 [S07] TargetState.setDefaults: Published to StateManager
Section07.js:106 🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults
Section07.js:115 ✅ [S07] ReferenceState.setDefaults: All 6 field defaults loaded
Section07.js:151 🔗 [S07] ReferenceState.setDefaults: Published all 6 Reference defaults with ref_ prefix
Section08.js:787 [S08] S04 listeners setup complete
Section09.js:422 S09: UI refreshed for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section09.js:422 S09: UI refreshed for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section10.js:3013 S10: Section rendered - initializing Self-Contained State Module.
Section10.js:2988 S10: Simplified global StateManager listeners added
Section10.js:3036 S10: ModeManager exposed globally for cross-section integration.
Section11.js:2344 [S11] Setting up S10 area listeners...
Section11.js:2379 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3525 S11: Section rendered - initializing Self-Contained State Module.
Section11.js:2344 [S11] Setting up S10 area listeners...
Section11.js:2379 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3544 S11: ModeManager exposed globally for cross-section integration.
Section11.js:3552 [S11 Area Sync] S11 initialization complete - sync functions now enabled
Section11.js:2224 [S11 Area Sync] Starting sync in target mode
Section11.js:2283 [S11 Area Sync] Applying 6 target updates, 0 reference updates
Section11.js:2306 [S11 Area Sync] Refreshing UI...
Section11.js:2311 [S11 Area Sync] Triggering single batch recalculation...
Section11.js:3509 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
Section10.js:2966 S10: Target listener triggered by i_97, recalculating all.
Section10.js:2966 S10: Target listener triggered by i_98, recalculating all.
Section11.js:3509 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
Section11.js:2314 [S11 Area Sync] Sync completed successfully
Section11.js:3569 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
Section12.js:3439 [g_109] Locked (not MEASURED mode), preserving state value
Section12.js:3326 [S12] ✅ Bidirectional WOMBAT sync listeners initialized
Section10.js:2966 S10: Target listener triggered by m_121, recalculating all.
Section14.js:1429 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
Section14.js:1438 S14: Section rendered - initializing Pattern A Dual-State Module.
Section14.js:80 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
Section14.js:1429 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
Section14.js:1465 S14: Pattern A initialization complete.
Section18.js:36 [S18] initializeEventHandlers called
Section19.js:1259 [WOMBAT] Initializing event handlers
Section19.js:1575 [WOMBAT] Section 19 rendered
Section19.js:1602 [WOMBAT] Initialized d_151 = 8319.50 from S12 (d_105)
Section19.js:1607 [WOMBAT] Initialized d_150 = 1 from S12 (d_103)
Section19.js:1259 [WOMBAT] Initializing event handlers
Section20.js:1277 [S19] Notes section rendered
Section20.js:22 [S19] Notes & QC Monitor section loaded
Section03.js:1301 Section03: Province selected: ON
Section03.js:1362 City dropdown updated for ON - selected: Alexandria
ReferenceToggle.js:448 [ReferenceToggle] Master Reference Toggle initialization complete
Section02.js:699 [S02] Registered dependencies from field metadata
Section02.js:1046 [S02] "Set Values" button wired successfully
Section02.js:1581 S02: Target defaults set from field definitions - single source of truth
Section02.js:1533 S02: Loaded and merged Target state from localStorage
Section02.js:1690 S02: Reference defaults set from field definitions - single source of truth with mode overrides
Section02.js:699 [S02] Registered dependencies from field metadata
Section02.js:1046 [S02] "Set Values" button wired successfully
Section02.js:1454 [S02] Area updated to 1427.2 - letting downstream sections handle calculations
Section02.js:1852 [S02] Refreshing UI for TARGET mode
Section02.js:1912 [S02] Updated h_12 (reporting year) slider = "2022" (target mode)
Section02.js:1929 [S02] Updated h_13 (service life) slider = "50" (target mode)
Section02.js:1979 [S02] Updated h_15 = "1,427.20" (target mode)
Section02.js:1979 [S02] Updated i_17 = "8154" (target mode)
Section02.js:1979 [S02] Updated l_12 = "$0.1300" (target mode)
Section02.js:1979 [S02] Updated l_13 = "$0.5070" (target mode)
Section02.js:1979 [S02] Updated l_14 = "$1.6200" (target mode)
Section02.js:1979 [S02] Updated l_15 = "$180.00" (target mode)
Section02.js:1979 [S02] Updated l_16 = "$1.5000" (target mode)
Section03.js:2507 S03: Sliders initialized via FieldManager
Section03.js:2667 S03: Section rendered - initializing Self-Contained State Module.
Section03.js:2681 S03: ModeManager exposed globally for cross-section integration.
Section03.js:526 S03: Checking climate data availability (attempt 1/10)
Section03.js:534 S03: Climate data available Array(13)
Section03.js:2653 S03: Synced province "ON" to StateManager for cross-section communication
Section03.js:1362 City dropdown updated for ON - selected: Alexandria
Section03.js:2507 S03: Sliders initialized via FieldManager
Section03.js:1301 Section03: Province selected: ON
Section03.js:1362 City dropdown updated for ON - selected: Alexandria
Section03.js:2740 S03: Self-Contained State Module initialization complete
Section06.js:746 S06: Pattern A initialization starting...
Section06.js:128 S06: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
Section06.js:599 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
Section06.js:594 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
Section06.js:285 🔄 [S06] updateCalculatedDisplayValues: mode=target
Section06.js:770 S06: Pattern A initialization complete.
Section07.js:1769 🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions
Section07.js:48 🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions
Section07.js:53 ✅ [S07] TargetState.setDefaults: d_49="User Defined", d_51="Heatpump"
Section07.js:61 🌐 [S07] TargetState.setDefaults: Published to StateManager
Section07.js:106 🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults
Section07.js:115 ✅ [S07] ReferenceState.setDefaults: All 6 field defaults loaded
Section07.js:151 🔗 [S07] ReferenceState.setDefaults: Published all 6 Reference defaults with ref_ prefix
Section08.js:787 [S08] S04 listeners setup complete
Section09.js:422 S09: UI refreshed for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section09.js:422 S09: UI refreshed for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section10.js:3013 S10: Section rendered - initializing Self-Contained State Module.
Section10.js:2988 S10: Simplified global StateManager listeners added
Section10.js:3036 S10: ModeManager exposed globally for cross-section integration.
Section11.js:2344 [S11] Setting up S10 area listeners...
Section11.js:2379 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3525 S11: Section rendered - initializing Self-Contained State Module.
Section11.js:2344 [S11] Setting up S10 area listeners...
Section11.js:2379 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3544 S11: ModeManager exposed globally for cross-section integration.
Section11.js:3552 [S11 Area Sync] S11 initialization complete - sync functions now enabled
Section11.js:2224 [S11 Area Sync] Starting sync in target mode
Section11.js:2283 [S11 Area Sync] Applying 6 target updates, 0 reference updates
Section11.js:2306 [S11 Area Sync] Refreshing UI...
Section11.js:2311 [S11 Area Sync] Triggering single batch recalculation...
Section11.js:3509 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
Section10.js:2966 S10: Target listener triggered by i_97, recalculating all.
Section10.js:2966 S10: Target listener triggered by i_98, recalculating all.
Section11.js:3509 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
Section11.js:2314 [S11 Area Sync] Sync completed successfully
Section11.js:3569 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
Section12.js:3439 [g_109] Locked (not MEASURED mode), preserving state value
Section12.js:3326 [S12] ✅ Bidirectional WOMBAT sync listeners initialized
Section10.js:2966 S10: Target listener triggered by m_121, recalculating all.
Section14.js:1429 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
Section14.js:1438 S14: Section rendered - initializing Pattern A Dual-State Module.
Section14.js:80 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
Section14.js:1429 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
Section14.js:1465 S14: Pattern A initialization complete.
Section18.js:36 [S18] initializeEventHandlers called
Section19.js:1259 [WOMBAT] Initializing event handlers
Section19.js:1575 [WOMBAT] Section 19 rendered
Section19.js:1602 [WOMBAT] Initialized d_151 = 8319.50 from S12 (d_105)
Section19.js:1607 [WOMBAT] Initialized d_150 = 1 from S12 (d_103)
Section19.js:1259 [WOMBAT] Initializing event handlers
Section20.js:1277 [S19] Notes section rendered
Section20.js:22 [S19] Notes & QC Monitor section loaded
Section03.js:1301 Section03: Province selected: ON
Section03.js:1362 City dropdown updated for ON - selected: Alexandria
Section03.js:1301 Section03: Province selected: ON
Section03.js:1362 City dropdown updated for ON - selected: Alexandria
Section02.js:699 [S02] Registered dependencies from field metadata
Section02.js:1046 [S02] "Set Values" button wired successfully
Section02.js:1581 S02: Target defaults set from field definitions - single source of truth
Section02.js:1533 S02: Loaded and merged Target state from localStorage
Section02.js:1690 S02: Reference defaults set from field definitions - single source of truth with mode overrides
Section02.js:699 [S02] Registered dependencies from field metadata
Section02.js:1046 [S02] "Set Values" button wired successfully
Section02.js:1454 [S02] Area updated to 1427.2 - letting downstream sections handle calculations
Section02.js:1852 [S02] Refreshing UI for TARGET mode
Section02.js:1912 [S02] Updated h_12 (reporting year) slider = "2022" (target mode)
Section02.js:1929 [S02] Updated h_13 (service life) slider = "50" (target mode)
Section02.js:1979 [S02] Updated h_15 = "1,427.20" (target mode)
Section02.js:1979 [S02] Updated i_17 = "8154" (target mode)
Section02.js:1979 [S02] Updated l_12 = "$0.1300" (target mode)
Section02.js:1979 [S02] Updated l_13 = "$0.5070" (target mode)
Section02.js:1979 [S02] Updated l_14 = "$1.6200" (target mode)
Section02.js:1979 [S02] Updated l_15 = "$180.00" (target mode)
Section02.js:1979 [S02] Updated l_16 = "$1.5000" (target mode)
Section03.js:2507 S03: Sliders initialized via FieldManager
Section03.js:2667 S03: Section rendered - initializing Self-Contained State Module.
Section03.js:2681 S03: ModeManager exposed globally for cross-section integration.
Section03.js:526 S03: Checking climate data availability (attempt 1/10)
Section03.js:534 S03: Climate data available Array(13)
Section03.js:2653 S03: Synced province "ON" to StateManager for cross-section communication
Section03.js:1362 City dropdown updated for ON - selected: Alexandria
Section03.js:2507 S03: Sliders initialized via FieldManager
Section03.js:1301 Section03: Province selected: ON
Section03.js:1362 City dropdown updated for ON - selected: Alexandria
Section03.js:2740 S03: Self-Contained State Module initialization complete
Section06.js:746 S06: Pattern A initialization starting...
Section06.js:128 S06: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
Section06.js:599 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
Section06.js:594 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
Section06.js:285 🔄 [S06] updateCalculatedDisplayValues: mode=target
Section06.js:770 S06: Pattern A initialization complete.
Section07.js:1769 🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions
Section07.js:48 🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions
Section07.js:53 ✅ [S07] TargetState.setDefaults: d_49="User Defined", d_51="Heatpump"
Section07.js:61 🌐 [S07] TargetState.setDefaults: Published to StateManager
Section07.js:106 🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults
Section07.js:115 ✅ [S07] ReferenceState.setDefaults: All 6 field defaults loaded
Section07.js:151 🔗 [S07] ReferenceState.setDefaults: Published all 6 Reference defaults with ref_ prefix
Section08.js:787 [S08] S04 listeners setup complete
Section09.js:422 S09: UI refreshed for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section09.js:422 S09: UI refreshed for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section09.js:501 [S09] Updated calculated display values for target mode
Section10.js:3013 S10: Section rendered - initializing Self-Contained State Module.
Section10.js:2988 S10: Simplified global StateManager listeners added
Section10.js:3036 S10: ModeManager exposed globally for cross-section integration.
Section11.js:2344 [S11] Setting up S10 area listeners...
Section11.js:2379 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3525 S11: Section rendered - initializing Self-Contained State Module.
Section11.js:2344 [S11] Setting up S10 area listeners...
Section11.js:2379 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3544 S11: ModeManager exposed globally for cross-section integration.
Section11.js:3552 [S11 Area Sync] S11 initialization complete - sync functions now enabled
Section11.js:2224 [S11 Area Sync] Starting sync in target mode
Section11.js:2283 [S11 Area Sync] Applying 6 target updates, 0 reference updates
Section11.js:2306 [S11 Area Sync] Refreshing UI...
Section11.js:2311 [S11 Area Sync] Triggering single batch recalculation...
Section11.js:3509 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
Section10.js:2966 S10: Target listener triggered by i_97, recalculating all.
Section10.js:2966 S10: Target listener triggered by i_98, recalculating all.
Section11.js:3509 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
Section11.js:2314 [S11 Area Sync] Sync completed successfully
Section11.js:3569 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
Section12.js:3439 [g_109] Locked (not MEASURED mode), preserving state value
Section12.js:3326 [S12] ✅ Bidirectional WOMBAT sync listeners initialized
Section10.js:2966 S10: Target listener triggered by m_121, recalculating all.
Section14.js:1429 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
Section14.js:1438 S14: Section rendered - initializing Pattern A Dual-State Module.
Section14.js:80 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
Section14.js:1429 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
Section14.js:1465 S14: Pattern A initialization complete.
Section18.js:36 [S18] initializeEventHandlers called
Section19.js:1259 [WOMBAT] Initializing event handlers
Section19.js:1575 [WOMBAT] Section 19 rendered
Section19.js:1602 [WOMBAT] Initialized d_151 = 8319.50 from S12 (d_105)
Section19.js:1607 [WOMBAT] Initialized d_150 = 1 from S12 (d_103)
Section19.js:1259 [WOMBAT] Initializing event handlers
Section20.js:1277 [S19] Notes section rendered
Section20.js:22 [S19] Notes & QC Monitor section loaded
Section03.js:1301 Section03: Province selected: ON
Section03.js:1362 City dropdown updated for ON - selected: Alexandria
Section03.js:1301 Section03: Province selected: ON
Section03.js:1362 City dropdown updated for ON - selected: Alexandria
index.html:1460 TEUI Calculator 4.011 initialization complete
Clock.js:28 [CLOCK] Performance monitoring initialized
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: l_104
applyTooltip @ TooltipManager.js:795Understand this warningAI
QCMonitor.js:40 [QCMonitor] QC monitoring disabled. Add ?qc=true to URL to activate.
Section19.js:817 [WOMBAT] SVG element initialized
Section19.js:827 Uncaught TypeError: Cannot read properties of undefined (reading 'renderPlaceholder')
    at drawPlaceholder (Section19.js:827:30)
    at initializeSVG (Section19.js:819:5)
    at Section19.js:1586:7Understand this errorAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
Section19.js:817 [WOMBAT] SVG element initialized
Section19.js:827 Uncaught TypeError: Cannot read properties of undefined (reading 'renderPlaceholder')
    at drawPlaceholder (Section19.js:827:30)
    at initializeSVG (Section19.js:819:5)
    at Section19.js:1586:7Understand this errorAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
Section19.js:817 [WOMBAT] SVG element initialized
Section19.js:827 Uncaught TypeError: Cannot read properties of undefined (reading 'renderPlaceholder')
    at drawPlaceholder (Section19.js:827:30)
    at initializeSVG (Section19.js:819:5)
    at Section19.js:1586:7Understand this errorAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
Section19.js:817 [WOMBAT] SVG element initialized
Section19.js:827 Uncaught TypeError: Cannot read properties of undefined (reading 'renderPlaceholder')
    at drawPlaceholder (Section19.js:827:30)
    at initializeSVG (Section19.js:819:5)
    at Section19.js:1586:7Understand this errorAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
Section01.js:773 🔍 [S01DB] updateTEUIDisplay START: e_10=341.2, h_10=93.56533807925692, useType=Utility Bills
Section01.js:843 🔍 [S01] T.1 Calculation: e_6=22.3 (ref), h_6=11.7 (target) → reduction should be 48%
Section01.js:942 🔍 [S01DB] UPDATING h_10: 93.6 (from j_32=133536.45050671548, area=1427.2)
Section01.js:529 🔍 [S01] h_6 explanation: target=11.7, ref=22.3, reduction=0.4753363228699552, percent=48%
Section01.js:1267 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
Section19.js:817 [WOMBAT] SVG element initialized
Section19.js:827 Uncaught TypeError: Cannot read properties of undefined (reading 'renderPlaceholder')
    at drawPlaceholder (Section19.js:827:30)
    at initializeSVG (Section19.js:819:5)
    at Section19.js:1586:7Understand this errorAI
Section10.js:2966 S10: Target listener triggered by i_103, recalculating all.
Section19.js:1382 [WOMBAT SYNC] ref_d_103 changed: 1.0 → 1
Section19.js:1388 [WOMBAT] ✅ Synced ref_d_150 = 1 from S12 (ref_d_103)
Section19.js:1692 [WOMBAT calculateAll] Called - Current mode: target, isActivated: false
Section19.js:765 [WOMBAT-2] Prismatic solver (Target mode)
Section19.js:784 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³
Section19.js:785 [WOMBAT-2] Derived: width=33.18m, height=7.56m
Section19.js:791 [WOMBAT-2] Extrusion depth: 33.18m (should equal width for square)
Section19.js:765 [WOMBAT-2] Prismatic solver (Reference mode)
Section19.js:784 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³
Section19.js:785 [WOMBAT-2] Derived: width=33.18m, height=7.56m
Section19.js:791 [WOMBAT-2] Extrusion depth: 33.18m (should equal width for square)
Section19.js:1711 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
Section19.js:202 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
Section19.js:1715 [WOMBAT calculateAll] Complete
Section19.js:1382 [WOMBAT SYNC] ref_d_103 changed: 1 → 1
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section19.js:1350 [WOMBAT SYNC] ref_d_105 changed: 8319.50 → 8319.50
Section19.js:1350 [WOMBAT SYNC] ref_d_105 changed: 8319.50 → 8319.50
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
Clock.js:41 [CLOCK] Starting initial load timing
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section06.js:599 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
Section06.js:594 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
Dependency.js:2091 [DependencyGraph] Already initialized, skipping re-initialization
Section01.js:773 🔍 [S01DB] updateTEUIDisplay START: e_10=182.1, h_10=93.30466708065204, useType=Utility Bills
Section01.js:843 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.7 (target) → reduction should be 49%
Section01.js:942 🔍 [S01DB] UPDATING h_10: 93.3 (from j_32=133164.4208575066, area=1427.2)
Section01.js:529 🔍 [S01] h_6 explanation: target=11.7, ref=23.1, reduction=0.49350649350649356, percent=49%
Clock.js:59 🕐 [CLOCK] ⭐ INITIALIZATION COMPLETE: 265ms (all calculations finalized)
Section01.js:1267 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
Clock.js:163 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section12.js:3247 [S12→WOMBAT] Syncing d_103 = 1.5 from WOMBAT d_150
Clock.js:163 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [WOMBAT SYNC] d_103 changed: 1.5 → 1.5
 [WOMBAT SYNC] d_103 changed: 1.5 → 1.5
 S10: Target listener triggered by i_103, recalculating all.
 [FieldManager] Routed d_150=1.5 through sect19 ModeManager
 [WOMBAT calculateAll] Called - Current mode: target, isActivated: false
 [WOMBAT-2] Prismatic solver (Target mode)
 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³
 [WOMBAT-2] Derived: width=33.18m, height=7.56m
 [WOMBAT-2] Extrusion depth: 33.18m (should equal width for square)
 [WOMBAT-2] Prismatic solver (Reference mode)
 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³
 [WOMBAT-2] Derived: width=33.18m, height=7.56m
 [WOMBAT-2] Extrusion depth: 33.18m (should equal width for square)
 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
 [WOMBAT calculateAll] Complete
 [FieldManager] Called sect19.calculateAll() after d_150 change
 🔍 [S01DB] updateTEUIDisplay START: e_10=197.1, h_10=93.75984379186542, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.7 (target) → reduction should be 49%
 🔍 [S01DB] UPDATING h_10: 93.8 (from j_32=133814.04905975034, area=1427.2)
 🔍 [S01] h_6 explanation: target=11.7, ref=23.1, reduction=0.49350649350649356, percent=49%
 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 101ms (subsequent update)
 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 101ms (interaction → h_10 settlement)
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S12→WOMBAT] Syncing d_103 = 1 from WOMBAT d_150
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [WOMBAT SYNC] d_103 changed: 1 → 1
 [WOMBAT SYNC] d_103 changed: 1 → 1
 S10: Target listener triggered by i_103, recalculating all.
 [FieldManager] Routed d_150=1 through sect19 ModeManager
 [WOMBAT calculateAll] Called - Current mode: target, isActivated: false
 [WOMBAT-2] Prismatic solver (Target mode)
 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³
 [WOMBAT-2] Derived: width=33.18m, height=7.56m
 [WOMBAT-2] Extrusion depth: 33.18m (should equal width for square)
 [WOMBAT-2] Prismatic solver (Reference mode)
 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³
 [WOMBAT-2] Derived: width=33.18m, height=7.56m
 [WOMBAT-2] Extrusion depth: 33.18m (should equal width for square)
 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
 [WOMBAT calculateAll] Complete
 [FieldManager] Called sect19.calculateAll() after d_150 change
 🔍 [S01DB] updateTEUIDisplay START: e_10=197.1, h_10=93.30466708065204, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.7 (target) → reduction should be 49%
 🔍 [S01DB] UPDATING h_10: 93.3 (from j_32=133164.4208575066, area=1427.2)
 🔍 [S01] h_6 explanation: target=11.7, ref=23.1, reduction=0.49350649350649356, percent=49%
 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 105ms (subsequent update)
 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 106ms (interaction → h_10 settlement)
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10