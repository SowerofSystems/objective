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
 🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions
 🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions
 ✅ [S07] TargetState.setDefaults: d_49="User Defined", d_51="Heatpump"
 🌐 [S07] TargetState.setDefaults: Published to StateManager
 🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults
 ✅ [S07] ReferenceState.setDefaults: All 6 field defaults loaded
 🔗 [S07] ReferenceState.setDefaults: Published all 6 Reference defaults with ref_ prefix
 [S08] S04 listeners setup complete
 S09: Target defaults loaded from field definitions
 S09: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6, lighting: 2.0
 S09: UI refreshed for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 S09: UI refreshed for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 S10: Section rendered - initializing Self-Contained State Module.
 S10: Simplified global StateManager listeners added
 S10: ModeManager exposed globally for cross-section integration.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: Section rendered - initializing Self-Contained State Module.
 [S11 REF DEFAULTS] Published ref_d_85=1411.52 to StateManager
 [S11 REF DEFAULTS] Published ref_d_86=712.97 to StateManager
 [S11 REF DEFAULTS] Published ref_d_87=0.00 to StateManager
 [S11 REF DEFAULTS] Published ref_d_94=0.00 to StateManager
 [S11 REF DEFAULTS] Published ref_d_95=1100.42 to StateManager
 [S11 REF DEFAULTS] Published ref_d_96=29.70 to StateManager
 [S11] Listener: ref_d_97 changed → recalculating (src=default)
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 S10: Target listener triggered by i_97, recalculating all.
 S10: Target listener triggered by i_98, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 [S11 REF DEFAULTS] Published ref_d_97=50 to StateManager
 [S11 REF DEFAULTS] Published ref_f_85=5.3 to StateManager
 [S11 REF DEFAULTS] Published ref_f_86=4.1 to StateManager
 [S11 REF DEFAULTS] Published ref_f_87=6.6 to StateManager
 [S11 REF DEFAULTS] Published ref_f_94=1.8 to StateManager
 [S11 REF DEFAULTS] Published ref_f_95=3.5 to StateManager
 [S11 REF DEFAULTS] Published ref_g_88=1.99 to StateManager
 [S11 REF DEFAULTS] Published ref_g_89=1.42 to StateManager
 [S11 REF DEFAULTS] Published ref_g_90=1.42 to StateManager
 [S11 REF DEFAULTS] Published ref_g_91=1.42 to StateManager
 [S11 REF DEFAULTS] Published ref_g_92=1.42 to StateManager
 [S11 REF DEFAULTS] Published ref_g_93=1.42 to StateManager
 S11: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: ModeManager exposed globally for cross-section integration.
 [S11 Area Sync] S11 initialization complete - sync functions now enabled
 [S11 Area Sync] DUAL-STATE SYNC - populating BOTH Target and Reference states
 [S11 Area Sync] Reason: d_88=undefined, ref_d_73 in StateManager=7.50
 [S11 Area Sync] Applying 0 target updates, 6 reference updates
 [S11 Area Sync] Refreshing UI...
 [S11 Area Sync] Triggering single batch recalculation...
 [S11 Area Sync] Sync completed successfully
 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
 [g_109] Locked (not MEASURED mode), preserving state value
 [S12] ✅ Bidirectional WOMBAT sync listeners initialized
 S10: Target listener triggered by m_121, recalculating all.
 [Cooling Stage 2] ⏭️ Skipping - No active cooling system (d_116="No Cooling")
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Section rendered - initializing Pattern A Dual-State Module.
 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 [Cooling Stage 2] ⏭️ Skipping - No active cooling system (d_116="No Cooling")
 [Cooling Stage 2] ⏭️ Skipping - No active cooling system (d_116="No Cooling")
 [Cooling Stage 2] ⏭️ Skipping - No active cooling system (d_116="No Cooling")
 [Cooling Stage 2] ⏭️ Skipping - No active cooling system (d_116="No Cooling")
 S14: Pattern A initialization complete.
 [S18] initializeEventHandlers called
 [WOMBAT] Initializing event handlers
 [WOMBAT] Section 19 rendered
 [WOMBAT] Initialized d_151 = 8000.00 from S12 (d_105)
 [WOMBAT] Initialized d_150 = 1.5 from S12 (d_103)
 [WOMBAT] Initialized ref_d_151 = 8000.00 from S12 (ref_d_105)
 [WOMBAT] Initialized ref_d_150 = 1.5 from S12 (ref_d_103)
 [S19] Notes section rendered
 [S19] Notes & QC Monitor section loaded
 [S02] Registered dependencies from field metadata
 [S02] "Set Values" button wired successfully
 S02: Target defaults set from field definitions - single source of truth
 S02: Loaded and merged Target state from localStorage
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
 S03: ModeManager exposed globally for cross-section integration.
 S03: Checking climate data availability (attempt 1/10)
 S03: Climate data available Array(13)
 S03: Synced province "ON" to StateManager for cross-section communication
 City dropdown updated for ON - selected: Alexandria
 S03: Sliders initialized via FieldManager
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 S03: Self-Contained State Module initialization complete
 S06: Pattern A initialization starting...
 S06: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔄 [S06] updateCalculatedDisplayValues: mode=target
 S06: Pattern A initialization complete.
 🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions
 🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions
 ✅ [S07] TargetState.setDefaults: d_49="User Defined", d_51="Heatpump"
 🌐 [S07] TargetState.setDefaults: Published to StateManager
 🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults
 ✅ [S07] ReferenceState.setDefaults: All 6 field defaults loaded
 🔗 [S07] ReferenceState.setDefaults: Published all 6 Reference defaults with ref_ prefix
 [S08] S04 listeners setup complete
 S09: UI refreshed for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 S09: UI refreshed for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 S10: Section rendered - initializing Self-Contained State Module.
 S10: Simplified global StateManager listeners added
 S10: ModeManager exposed globally for cross-section integration.
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: Section rendered - initializing Self-Contained State Module.
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: ModeManager exposed globally for cross-section integration.
 [S11 Area Sync] S11 initialization complete - sync functions now enabled
 [S11 Area Sync] Starting sync in target mode
 [S11 Area Sync] Applying 6 target updates, 0 reference updates
 [S11 Area Sync] Refreshing UI...
 [S11 Area Sync] Triggering single batch recalculation...
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 S10: Target listener triggered by i_97, recalculating all.
 S10: Target listener triggered by i_98, recalculating all.
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 [S11 Area Sync] Sync completed successfully
 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
 [g_109] Locked (not MEASURED mode), preserving state value
 [S12] ✅ Bidirectional WOMBAT sync listeners initialized
 S10: Target listener triggered by m_121, recalculating all.
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Section rendered - initializing Pattern A Dual-State Module.
 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Pattern A initialization complete.
 [S18] initializeEventHandlers called
 [WOMBAT] Initializing event handlers
 [WOMBAT] Section 19 rendered
 [WOMBAT] Initialized d_151 = 8000.00 from S12 (d_105)
 [WOMBAT] Initialized d_150 = 1.5 from S12 (d_103)
 [S19] Notes section rendered
 [S19] Notes & QC Monitor section loaded
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 [CLOCK] Performance monitoring initialized
 [ParallelCoordinates] Setting up initial state
 [ParallelCoordinates] Initial state ready
 [S02] Registered dependencies from field metadata
 [S02] "Set Values" button wired successfully
 S02: Target defaults set from field definitions - single source of truth
 S02: Loaded and merged Target state from localStorage
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
 S03: ModeManager exposed globally for cross-section integration.
 S03: Checking climate data availability (attempt 1/10)
 S03: Climate data available Array(13)
 S03: Synced province "ON" to StateManager for cross-section communication
 City dropdown updated for ON - selected: Alexandria
 S03: Sliders initialized via FieldManager
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 S03: Self-Contained State Module initialization complete
 S06: Pattern A initialization starting...
 S06: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔄 [S06] updateCalculatedDisplayValues: mode=target
 S06: Pattern A initialization complete.
 🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions
 🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions
 ✅ [S07] TargetState.setDefaults: d_49="User Defined", d_51="Heatpump"
 🌐 [S07] TargetState.setDefaults: Published to StateManager
 🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults
 ✅ [S07] ReferenceState.setDefaults: All 6 field defaults loaded
 🔗 [S07] ReferenceState.setDefaults: Published all 6 Reference defaults with ref_ prefix
 [S08] S04 listeners setup complete
 S09: UI refreshed for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 S09: UI refreshed for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 S10: Section rendered - initializing Self-Contained State Module.
 S10: Simplified global StateManager listeners added
 S10: ModeManager exposed globally for cross-section integration.
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: Section rendered - initializing Self-Contained State Module.
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: ModeManager exposed globally for cross-section integration.
 [S11 Area Sync] S11 initialization complete - sync functions now enabled
 [S11 Area Sync] Starting sync in target mode
 [S11 Area Sync] Applying 6 target updates, 0 reference updates
 [S11 Area Sync] Refreshing UI...
 [S11 Area Sync] Triggering single batch recalculation...
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 S10: Target listener triggered by i_97, recalculating all.
 S10: Target listener triggered by i_98, recalculating all.
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 [S11 Area Sync] Sync completed successfully
 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
 [g_109] Locked (not MEASURED mode), preserving state value
 [S12] ✅ Bidirectional WOMBAT sync listeners initialized
 S10: Target listener triggered by m_121, recalculating all.
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Section rendered - initializing Pattern A Dual-State Module.
 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Pattern A initialization complete.
 [S18] initializeEventHandlers called
 [WOMBAT] Initializing event handlers
 [WOMBAT] Section 19 rendered
 [WOMBAT] Initialized d_151 = 8000.00 from S12 (d_105)
 [WOMBAT] Initialized d_150 = 1.5 from S12 (d_103)
 [S19] Notes section rendered
 [S19] Notes & QC Monitor section loaded
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 [ReferenceToggle] Master Reference Toggle initialization complete
 [S02] Registered dependencies from field metadata
 [S02] "Set Values" button wired successfully
 S02: Target defaults set from field definitions - single source of truth
 S02: Loaded and merged Target state from localStorage
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
 S03: ModeManager exposed globally for cross-section integration.
 S03: Checking climate data availability (attempt 1/10)
 S03: Climate data available Array(13)
 S03: Synced province "ON" to StateManager for cross-section communication
 City dropdown updated for ON - selected: Alexandria
 S03: Sliders initialized via FieldManager
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 S03: Self-Contained State Module initialization complete
 S06: Pattern A initialization starting...
 S06: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔄 [S06] updateCalculatedDisplayValues: mode=target
 S06: Pattern A initialization complete.
 🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions
 🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions
 ✅ [S07] TargetState.setDefaults: d_49="User Defined", d_51="Heatpump"
 🌐 [S07] TargetState.setDefaults: Published to StateManager
 🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults
 ✅ [S07] ReferenceState.setDefaults: All 6 field defaults loaded
 🔗 [S07] ReferenceState.setDefaults: Published all 6 Reference defaults with ref_ prefix
 [S08] S04 listeners setup complete
 S09: UI refreshed for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 S09: UI refreshed for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 S10: Section rendered - initializing Self-Contained State Module.
 S10: Simplified global StateManager listeners added
 S10: ModeManager exposed globally for cross-section integration.
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: Section rendered - initializing Self-Contained State Module.
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: ModeManager exposed globally for cross-section integration.
 [S11 Area Sync] S11 initialization complete - sync functions now enabled
 [S11 Area Sync] Starting sync in target mode
 [S11 Area Sync] Applying 6 target updates, 0 reference updates
 [S11 Area Sync] Refreshing UI...
 [S11 Area Sync] Triggering single batch recalculation...
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 S10: Target listener triggered by i_97, recalculating all.
 S10: Target listener triggered by i_98, recalculating all.
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 [S11 Area Sync] Sync completed successfully
 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
 [g_109] Locked (not MEASURED mode), preserving state value
 [S12] ✅ Bidirectional WOMBAT sync listeners initialized
 S10: Target listener triggered by m_121, recalculating all.
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Section rendered - initializing Pattern A Dual-State Module.
 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Pattern A initialization complete.
 [S18] initializeEventHandlers called
 [WOMBAT] Initializing event handlers
 [WOMBAT] Section 19 rendered
 [WOMBAT] Initialized d_151 = 8000.00 from S12 (d_105)
 [WOMBAT] Initialized d_150 = 1.5 from S12 (d_103)
 [S19] Notes section rendered
 [S19] Notes & QC Monitor section loaded
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 [S02] Registered dependencies from field metadata
 [S02] "Set Values" button wired successfully
 S02: Target defaults set from field definitions - single source of truth
 S02: Loaded and merged Target state from localStorage
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
 S03: ModeManager exposed globally for cross-section integration.
 S03: Checking climate data availability (attempt 1/10)
 S03: Climate data available Array(13)
 S03: Synced province "ON" to StateManager for cross-section communication
 City dropdown updated for ON - selected: Alexandria
 S03: Sliders initialized via FieldManager
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 S03: Self-Contained State Module initialization complete
 S06: Pattern A initialization starting...
 S06: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔄 [S06] updateCalculatedDisplayValues: mode=target
 S06: Pattern A initialization complete.
 🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions
 🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions
 ✅ [S07] TargetState.setDefaults: d_49="User Defined", d_51="Heatpump"
 🌐 [S07] TargetState.setDefaults: Published to StateManager
 🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults
 ✅ [S07] ReferenceState.setDefaults: All 6 field defaults loaded
 🔗 [S07] ReferenceState.setDefaults: Published all 6 Reference defaults with ref_ prefix
 [S08] S04 listeners setup complete
 S09: UI refreshed for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 S09: UI refreshed for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 [S09] Updated calculated display values for target mode
 S10: Section rendered - initializing Self-Contained State Module.
 S10: Simplified global StateManager listeners added
 S10: ModeManager exposed globally for cross-section integration.
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: Section rendered - initializing Self-Contained State Module.
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: ModeManager exposed globally for cross-section integration.
 [S11 Area Sync] S11 initialization complete - sync functions now enabled
 [S11 Area Sync] Starting sync in target mode
 [S11 Area Sync] Applying 6 target updates, 0 reference updates
 [S11 Area Sync] Refreshing UI...
 [S11 Area Sync] Triggering single batch recalculation...
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 S10: Target listener triggered by i_97, recalculating all.
 S10: Target listener triggered by i_98, recalculating all.
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 [S11 Area Sync] Sync completed successfully
 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
 [g_109] Locked (not MEASURED mode), preserving state value
 [S12] ✅ Bidirectional WOMBAT sync listeners initialized
 S10: Target listener triggered by m_121, recalculating all.
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Section rendered - initializing Pattern A Dual-State Module.
 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Pattern A initialization complete.
 [S18] initializeEventHandlers called
 [WOMBAT] Initializing event handlers
 [WOMBAT] Section 19 rendered
 [WOMBAT] Initialized d_151 = 8000.00 from S12 (d_105)
 [WOMBAT] Initialized d_150 = 1.5 from S12 (d_103)
 [S19] Notes section rendered
 [S19] Notes & QC Monitor section loaded
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 TEUI Calculator 4.011 initialization complete
 [CLOCK] Performance monitoring initialized
 [TooltipManager] Empty tooltip message for field: l_104
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [QCMonitor] QC monitoring disabled. Add ?qc=true to URL to activate.
 [WOMBAT] SVG element initialized
 [WOMBAT] Feedback console injected into section header
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [WOMBAT] SVG element initialized
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [WOMBAT] SVG element initialized
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [WOMBAT] SVG element initialized
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 🔍 [S01DB] updateTEUIDisplay START: e_10=341.2, h_10=93.99858460038593, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=22.3 (ref), h_6=11.7 (target) → reduction should be 48%
 🔍 [S01DB] UPDATING h_10: 94.0 (from j_32=134154.7799416708, area=1427.2)
 🔍 [S01] h_6 explanation: target=11.7, ref=22.3, reduction=0.4753363228699552, percent=48%
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 [WOMBAT] SVG element initialized
 S10: Target listener triggered by i_103, recalculating all.
 [WOMBAT SYNC] ref_d_103 changed: 1.5 → 1.5
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [WOMBAT SYNC] ref_d_105 changed: 8000.00 → 8000.00
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [CLOCK] Starting initial load timing
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 [DependencyGraph] Already initialized, skipping re-initialization
 🔍 [S01DB] updateTEUIDisplay START: e_10=182.2, h_10=93.80497415036699, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.7 (target) → reduction should be 49%
 🔍 [S01DB] UPDATING h_10: 93.8 (from j_32=133878.45910740376, area=1427.2)
 🔍 [S01] h_6 explanation: target=11.7, ref=23.1, reduction=0.49350649350649356, percent=49%
 🕐 [CLOCK] ⭐ INITIALIZATION COMPLETE: 244ms (all calculations finalized)
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 [WOMBAT] Topology view activated
 [WOMBAT] Syncing values from StateManager...
 🎨 [WOMBAT updateVisualization] Called with mode="target"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = false
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Footprint: 1100.42 m² (33.17m × 33.17m)
 [WOMBAT] Mezzanine/Partial floor calculation:
   Conditioned area: 1427.20 m²
   Full stories: 1 × 1100.42 m² = 1100.42 m²
   Basement floorplate: 0.00 m²
   Mezzanine area: 326.78 m²
 [WOMBAT] Wall area: 1065.10 m² (from S12 g_107 checksum)
 [WOMBAT] Roof area ratio: 1.283 (roof/footprint)
 [WOMBAT] Gable roof calculation:
   Ridge: longitudinal (33.17m)
   Span: 33.17m
   Slope length: 21.28m
   Height: 13.32m
   Gable end area (each): 221.00m²
 [WOMBAT] Gable roof solved:
   Ridge height: 13.32 m
   Gable end area (both): 442.00 m²
   Ridge orientation: longitudinal
 [WOMBAT] Constraint validation (g_106):
   Intended wall height: 1.5 storeys × 3m = 4.50m
   Required wall volume: 4951.89 m³
   Total conditioned volume (d_105): 8000.00 m³
   ✓ Volume sufficient for 4.50m walls
 [WOMBAT] Volume-constrained wall height:
   Total conditioned volume (d_105): 8000.00 m³
   Roof volume: 7331.18 m³
   Basement volume: 0.00 m³
   Above-grade rectangular volume: 668.82 m³
   Above-grade wall height: 0.608 m
 [WOMBAT] ✓ Using intended wall height from g_106: 4.50m
 [WOMBAT] Volume fit: -4283.07 m³ deficit
 [WOMBAT] Wall height verification:
   From volume: 4.500 m
   From wall area: 4.696 m
   Discrepancy: 4.4%
 [WOMBAT] Geometry solved (Target mode): Object
 🎨 [WOMBAT updateVisualization] SVG element found: true
 🎨 [WOMBAT] Delegating render to wombatRender.js
 [WombatRender] renderGableRoof called with:
   width: 33.17257903751229 length: 33.17257903751229 wallHeight: 4.5 roofHeight: 13.324330705644657
   scale: 8.195998646324238 centerX: 410 centerY: 364.0587935567328
   gableData: Object
 [ReferenceToggle] Found 16 dual-state sections: Array(16)
 [S02] Switched to REFERENCE mode
 [S02] Refreshing UI for REFERENCE mode
 [S02] Updated h_12 (reporting year) slider = "2022" (reference mode)
 [S02] Updated h_13 (service life) slider = "50" (reference mode)
 [S02] Updated h_15 = "1,427.20" (reference mode)
 [S02] Updated i_17 = "8154" (reference mode)
 [S02] Updated l_12 = "$0.1300" (reference mode)
 [S02] Updated l_13 = "$0.5070" (reference mode)
 [S02] Updated l_14 = "$1.6200" (reference mode)
 [S02] Updated l_15 = "$180.00" (reference mode)
 [S02] Updated l_16 = "$1.5000" (reference mode)
 Section03: Province selected: ON
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 City dropdown updated for ON - selected: Alexandria
 S05: Switched to REFERENCE mode
 S06: Switched to REFERENCE mode
 🔄 [S06] updateCalculatedDisplayValues: mode=reference
 🔄 [S06] updateCalculatedDisplayValues: mode=reference
 🔄 [S07] switchMode: Switching from "target" to "reference"
 🔄 [S07] refreshUI: Starting refresh for mode=reference
 🔍 [S07] refreshUI: fieldId=d_49, storedValue=User Defined, elementFound=true
 📋 [S07] refreshUI: fieldId=d_49, default=User Defined, valueToShow=User Defined, elementType=SELECT
 🔽 [S07] refreshUI: Setting dropdown d_49 from "User Defined" to "User Defined" (mode=reference)
 🔽 [S07] refreshUI: Dropdown d_49 now shows "User Defined"
 🔍 [S07] refreshUI: fieldId=e_49, storedValue=40.00, elementFound=true
 📋 [S07] refreshUI: fieldId=e_49, default=40.00, valueToShow=40.00, elementType=TD
 ✏️ [S07] refreshUI: Setting contenteditable e_49 = "40.00"
 🔍 [S07] refreshUI: fieldId=h_49, storedValue=40, elementFound=true
 📋 [S07] refreshUI: fieldId=h_49, default=40.00, valueToShow=40, elementType=TD
 🔍 [S07] refreshUI: fieldId=i_49, storedValue=1839600, elementFound=true
 📋 [S07] refreshUI: fieldId=i_49, default=1,839,600, valueToShow=1839600, elementType=TD
 🔍 [S07] refreshUI: fieldId=k_49, storedValue=null, elementFound=true
 📋 [S07] refreshUI: fieldId=k_49, default=0.00, valueToShow=0.00, elementType=TD
 🔍 [S07] refreshUI: fieldId=m_49, storedValue=100%, elementFound=true
 📋 [S07] refreshUI: fieldId=m_49, default=15%, valueToShow=100%, elementType=TD
 🔍 [S07] refreshUI: fieldId=n_49, storedValue=✓, elementFound=true
 📋 [S07] refreshUI: fieldId=n_49, default=✓, valueToShow=✓, elementType=TD
 🔍 [S07] refreshUI: fieldId=e_50, storedValue=10,000.00, elementFound=true
 📋 [S07] refreshUI: fieldId=e_50, default=10,000.00, valueToShow=10,000.00, elementType=TD
 ✏️ [S07] refreshUI: Setting contenteditable e_50 = "10,000.00"
 🔍 [S07] refreshUI: fieldId=h_50, storedValue=16, elementFound=true
 📋 [S07] refreshUI: fieldId=h_50, default=16.00, valueToShow=16, elementType=TD
 🔍 [S07] refreshUI: fieldId=i_50, storedValue=735840, elementFound=true
 📋 [S07] refreshUI: fieldId=i_50, default=735,840, valueToShow=735840, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_50, storedValue=38484.432, elementFound=true
 📋 [S07] refreshUI: fieldId=j_50, default=38,484.43, valueToShow=38484.432, elementType=TD
 🔍 [S07] refreshUI: fieldId=m_50, storedValue=100%, elementFound=true
 📋 [S07] refreshUI: fieldId=m_50, default=15%, valueToShow=100%, elementType=TD
 🔍 [S07] refreshUI: fieldId=n_50, storedValue=✓, elementFound=true
 📋 [S07] refreshUI: fieldId=n_50, default=✓, valueToShow=✓, elementType=TD
 🔍 [S07] refreshUI: fieldId=d_51, storedValue=Electric, elementFound=true
 📋 [S07] refreshUI: fieldId=d_51, default=Heatpump, valueToShow=Electric, elementType=SELECT
 🔽 [S07] refreshUI: Setting dropdown d_51 from "Heatpump" to "Electric" (mode=reference)
 🔽 [S07] refreshUI: Dropdown d_51 now shows "Electric"
 🔍 [S07] refreshUI: fieldId=e_51, storedValue=null, elementFound=true
 📋 [S07] refreshUI: fieldId=e_51, default=0.00, valueToShow=0.00, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_51, storedValue=42760.48, elementFound=true
 📋 [S07] refreshUI: fieldId=j_51, default=12,828.14, valueToShow=42760.48, elementType=TD
 🔍 [S07] refreshUI: fieldId=k_51, storedValue=42760.48, elementFound=true
 📋 [S07] refreshUI: fieldId=k_51, default=12,828.14, valueToShow=42760.48, elementType=TD
 🔍 [S07] refreshUI: fieldId=d_52, storedValue=90, elementFound=true
 📋 [S07] refreshUI: fieldId=d_52, default=300, valueToShow=90, elementType=range
 🎚️ [S07] refreshUI: Setting slider d_52 = "90"
 🎚️ [S07] refreshUI: Updating d_52 slider range for system="Electric"
 🎚️ [S07] refreshUI: d_52 slider range updated to min=90, max=100, step=1
 🔍 [S07] refreshUI: fieldId=e_52, storedValue=0.9, elementFound=true
 📋 [S07] refreshUI: fieldId=e_52, default=3.00, valueToShow=0.9, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_52, storedValue=42760.48, elementFound=true
 📋 [S07] refreshUI: fieldId=j_52, default=12,828.14, valueToShow=42760.48, elementType=TD
 🔍 [S07] refreshUI: fieldId=m_52, storedValue=100%, elementFound=true
 📋 [S07] refreshUI: fieldId=m_52, default=100%, valueToShow=100%, elementType=TD
 🔍 [S07] refreshUI: fieldId=n_52, storedValue=✓, elementFound=true
 📋 [S07] refreshUI: fieldId=n_52, default=✓, valueToShow=✓, elementType=TD
 🔍 [S07] refreshUI: fieldId=d_53, storedValue=0, elementFound=true
 📋 [S07] refreshUI: fieldId=d_53, default=0, valueToShow=0, elementType=range
 🎚️ [S07] refreshUI: Setting slider d_53 = "0"
 🔍 [S07] refreshUI: fieldId=e_53, storedValue=null, elementFound=true
 📋 [S07] refreshUI: fieldId=e_53, default=0.00, valueToShow=0.00, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_53, storedValue=42760.48, elementFound=true
 📋 [S07] refreshUI: fieldId=j_53, default=12,828.14, valueToShow=42760.48, elementType=TD
 🔍 [S07] refreshUI: fieldId=m_53, storedValue=N/A, elementFound=true
 📋 [S07] refreshUI: fieldId=m_53, default=0%, valueToShow=N/A, elementType=TD
 🔍 [S07] refreshUI: fieldId=n_53, storedValue=✓, elementFound=true
 📋 [S07] refreshUI: fieldId=n_53, default=✓, valueToShow=✓, elementType=TD
 🔍 [S07] refreshUI: fieldId=d_54, storedValue=3848.4432, elementFound=true
 📋 [S07] refreshUI: fieldId=d_54, default=0.00, valueToShow=3848.4432, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_54, storedValue=null, elementFound=true
 📋 [S07] refreshUI: fieldId=j_54, default=0.00, valueToShow=0.00, elementType=TD
 🔍 [S07] refreshUI: fieldId=k_54, storedValue=null, elementFound=true
 📋 [S07] refreshUI: fieldId=k_54, default=0.00, valueToShow=0.00, elementType=TD
 ✅ [S07] refreshUI: Completed refresh for mode=reference
 ✅ [S07] switchMode: Switch to "reference" completed
 S08: Switched to REFERENCE mode.
 S09: Switched to REFERENCE mode
 S09: UI refreshed for reference mode
 [S09] Updated calculated display values for reference mode
 [S09] Updated calculated display values for reference mode
 S11: Switched to REFERENCE mode
 [S11 Area Sync] Starting sync in reference mode
 [S11 Area Sync] Applying 0 target updates, 6 reference updates
 [S11 Area Sync] Refreshing UI...
 [S11 Area Sync] Triggering single batch recalculation...
 [S11 Area Sync] Sync completed successfully
 S12: Switched to REFERENCE mode
 S14: Switched to REFERENCE mode
 🎨 [WOMBAT updateVisualization] Called with mode="reference"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = true
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Footprint: 1100.42 m² (33.17m × 33.17m)
 [WOMBAT] Mezzanine/Partial floor calculation:
   Conditioned area: 1427.20 m²
   Full stories: 1 × 1100.42 m² = 1100.42 m²
   Basement floorplate: 0.00 m²
   Mezzanine area: 326.78 m²
 [WOMBAT] Wall area: 1065.10 m² (from S12 g_107 checksum)
 [WOMBAT] Roof area ratio: 1.283 (roof/footprint)
 [WOMBAT] Gable roof calculation:
   Ridge: longitudinal (33.17m)
   Span: 33.17m
   Slope length: 21.28m
   Height: 13.32m
   Gable end area (each): 221.00m²
 [WOMBAT] Gable roof solved:
   Ridge height: 13.32 m
   Gable end area (both): 442.00 m²
   Ridge orientation: longitudinal
 [WOMBAT] Volume-constrained wall height:
   Total conditioned volume (d_105): 8000.00 m³
   Roof volume: 7331.18 m³
   Basement volume: 0.00 m³
   Above-grade rectangular volume: 668.82 m³
   Above-grade wall height: 0.608 m
 [WOMBAT] Wall height verification:
   From volume: 0.608 m
   From wall area: 4.696 m
   Discrepancy: 672.6%
 [WOMBAT] Wall height discrepancy > 5% - volume and wall area may be inconsistent
solveGeometry @ Section19.js:1384Understand this warningAI
 [WOMBAT] Geometry solved (Reference mode): Object
 🎨 [WOMBAT updateVisualization] SVG element found: true
 🎨 [WOMBAT] Delegating render to wombatRender.js
 [WombatRender] renderGableRoof called with:
   width: 33.17257903751229 length: 33.17257903751229 wallHeight: 0.6077861202515881 roofHeight: 13.324330705644657
   scale: 9.017933837837612 centerX: 410 centerY: 350.42593850463766
   gableData: Object
 [WOMBAT] updateCalculatedDisplayValues() called for mode="reference"
 🎨 Master Toggle: Switched 16/16 sections to REFERENCE mode with global styling
 [ReferenceToggle] Found 16 dual-state sections: Array(16)
 🔄 [S06] updateCalculatedDisplayValues: mode=reference
 [S09] Updated calculated display values for reference mode
 [WOMBAT] updateCalculatedDisplayValues() called for mode="reference"
 [WOMBAT] Refreshing topology
 [WOMBAT] Syncing values from StateManager...
 🎨 [WOMBAT updateVisualization] Called with mode="reference"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = true
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Footprint: 1100.42 m² (33.17m × 33.17m)
 [WOMBAT] Mezzanine/Partial floor calculation:
   Conditioned area: 1427.20 m²
   Full stories: 1 × 1100.42 m² = 1100.42 m²
   Basement floorplate: 0.00 m²
   Mezzanine area: 326.78 m²
 [WOMBAT] Wall area: 1065.10 m² (from S12 g_107 checksum)
 [WOMBAT] Roof area ratio: 1.283 (roof/footprint)
 [WOMBAT] Gable roof calculation:
   Ridge: longitudinal (33.17m)
   Span: 33.17m
   Slope length: 21.28m
   Height: 13.32m
   Gable end area (each): 221.00m²
 [WOMBAT] Gable roof solved:
   Ridge height: 13.32 m
   Gable end area (both): 442.00 m²
   Ridge orientation: longitudinal
 [WOMBAT] Volume-constrained wall height:
   Total conditioned volume (d_105): 8000.00 m³
   Roof volume: 7331.18 m³
   Basement volume: 0.00 m³
   Above-grade rectangular volume: 668.82 m³
   Above-grade wall height: 0.608 m
 [WOMBAT] Wall height verification:
   From volume: 0.608 m
   From wall area: 4.696 m
   Discrepancy: 672.6%
 [WOMBAT] Wall height discrepancy > 5% - volume and wall area may be inconsistent
solveGeometry @ Section19.js:1384Understand this warningAI
 [WOMBAT] Geometry solved (Reference mode): Object
 🎨 [WOMBAT updateVisualization] SVG element found: true
 🎨 [WOMBAT] Delegating render to wombatRender.js
 [WombatRender] renderGableRoof called with:
   width: 33.17257903751229 length: 33.17257903751229 wallHeight: 0.6077861202515881 roofHeight: 13.324330705644657
   scale: 9.017933837837612 centerX: 410 centerY: 350.42593850463766
   gableData: Object
 S12 ReferenceState: Saved state after user-modified changed g_106 to 2
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [WOMBAT] Refreshing topology
 [WOMBAT] Syncing values from StateManager...
 🎨 [WOMBAT updateVisualization] Called with mode="reference"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = true
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Footprint: 1100.42 m² (33.17m × 33.17m)
 [WOMBAT] Mezzanine/Partial floor calculation:
   Conditioned area: 1427.20 m²
   Full stories: 1 × 1100.42 m² = 1100.42 m²
   Basement floorplate: 0.00 m²
   Mezzanine area: 326.78 m²
 [WOMBAT] Wall area: 1065.10 m² (from S12 g_107 checksum)
 [WOMBAT] Roof area ratio: 1.283 (roof/footprint)
 [WOMBAT] Gable roof calculation:
   Ridge: longitudinal (33.17m)
   Span: 33.17m
   Slope length: 21.28m
   Height: 13.32m
   Gable end area (each): 221.00m²
 [WOMBAT] Gable roof solved:
   Ridge height: 13.32 m
   Gable end area (both): 442.00 m²
   Ridge orientation: longitudinal
 [WOMBAT] Constraint validation (g_106):
   Intended wall height: 1.5 storeys × 2m = 3.00m
   Required wall volume: 3301.26 m³
   Total conditioned volume (d_105): 8000.00 m³
   ✓ Volume sufficient for 3.00m walls
 [WOMBAT] Volume-constrained wall height:
   Total conditioned volume (d_105): 8000.00 m³
   Roof volume: 7331.18 m³
   Basement volume: 0.00 m³
   Above-grade rectangular volume: 668.82 m³
   Above-grade wall height: 0.608 m
 [WOMBAT] ✓ Using intended wall height from g_106: 3.00m
 [WOMBAT] Volume fit: -2632.44 m³ deficit
 [WOMBAT] Wall height verification:
   From volume: 3.000 m
   From wall area: 4.696 m
   Discrepancy: 56.5%
 [WOMBAT] Wall height discrepancy > 5% - volume and wall area may be inconsistent
solveGeometry @ Section19.js:1384Understand this warningAI
 [WOMBAT] Geometry solved (Reference mode): Object
 🎨 [WOMBAT updateVisualization] SVG element found: true
 🎨 [WOMBAT] Delegating render to wombatRender.js
 [WombatRender] renderGableRoof called with:
   width: 33.17257903751229 length: 33.17257903751229 wallHeight: 3 roofHeight: 13.324330705644657
   scale: 8.49436938924849 centerX: 410 centerY: 359.10993003066477
   gableData: Object
 S12 ReferenceState: Saved state after user-modified changed g_106 to 3
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [WOMBAT] Refreshing topology
 [WOMBAT] Syncing values from StateManager...
 🎨 [WOMBAT updateVisualization] Called with mode="reference"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = true
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Footprint: 1100.42 m² (33.17m × 33.17m)
 [WOMBAT] Mezzanine/Partial floor calculation:
   Conditioned area: 1427.20 m²
   Full stories: 1 × 1100.42 m² = 1100.42 m²
   Basement floorplate: 0.00 m²
   Mezzanine area: 326.78 m²
Section19.js:1107 [WOMBAT] Wall area: 1065.10 m² (from S12 g_107 checksum)
Section19.js:1126 [WOMBAT] Roof area ratio: 1.283 (roof/footprint)
Section19.js:830 [WOMBAT] Gable roof calculation:
Section19.js:831   Ridge: longitudinal (33.17m)
Section19.js:832   Span: 33.17m
Section19.js:833   Slope length: 21.28m
Section19.js:834   Height: 13.32m
Section19.js:835   Gable end area (each): 221.00m²
Section19.js:1146 [WOMBAT] Gable roof solved:
Section19.js:1147   Ridge height: 13.32 m
Section19.js:1148   Gable end area (both): 442.00 m²
Section19.js:1149   Ridge orientation: longitudinal
Section19.js:1215 [WOMBAT] Constraint validation (g_106):
Section19.js:1216   Intended wall height: 1.5 storeys × 3m = 4.50m
Section19.js:1217   Required wall volume: 4951.89 m³
Section19.js:1218   Total conditioned volume (d_105): 8000.00 m³
Section19.js:1224   ✓ Volume sufficient for 4.50m walls
Section19.js:1317 [WOMBAT] Volume-constrained wall height:
Section19.js:1318   Total conditioned volume (d_105): 8000.00 m³
Section19.js:1319   Roof volume: 7331.18 m³
Section19.js:1320   Basement volume: 0.00 m³
Section19.js:1321   Above-grade rectangular volume: 668.82 m³
Section19.js:1322   Above-grade wall height: 0.608 m
Section19.js:1337 [WOMBAT] ✓ Using intended wall height from g_106: 4.50m
Section19.js:1343 [WOMBAT] Volume fit: -4283.07 m³ deficit
Section19.js:1378 [WOMBAT] Wall height verification:
Section19.js:1379   From volume: 4.500 m
Section19.js:1380   From wall area: 4.696 m
Section19.js:1381   Discrepancy: 4.4%
Section19.js:1475 [WOMBAT] Geometry solved (Reference mode): Object
Section19.js:1521 🎨 [WOMBAT updateVisualization] SVG element found: true
Section19.js:1528 🎨 [WOMBAT] Delegating render to wombatRender.js
wombatRender.js:888 [WombatRender] renderGableRoof called with:
wombatRender.js:889   width: 33.17257903751229 length: 33.17257903751229 wallHeight: 4.5 roofHeight: 13.324330705644657
wombatRender.js:899   scale: 8.195998646324238 centerX: 410 centerY: 364.0587935567328
wombatRender.js:900   gableData: Object