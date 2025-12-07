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
 [S11 Area Sync] d_88 REFERENCE = 7.50
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 [S11 Area Sync] d_89 REFERENCE = 81.14
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 [S11 Area Sync] d_90 REFERENCE = 3.83
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 [S11 Area Sync] d_91 REFERENCE = 159.00
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 [S11 Area Sync] d_92 REFERENCE = 100.66
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 [S11 Area Sync] d_93 REFERENCE = 0.00
 [S11 Area Sync] Refreshing UI...
 [S11 Area Sync] Triggering recalculation...
 S10: Target listener triggered by i_97, recalculating all.
 S10: Target listener triggered by i_98, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 [S11 Area Sync] Sync completed successfully
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 S10: Target listener triggered by i_103, recalculating all.
 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
 [g_109] Locked (not MEASURED mode), preserving state value
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
 [S11 Area Sync] d_88 = 7.50 (from d_73)
 [S11 Area Sync] d_89 = 81.14 (from d_74)
 [S11 Area Sync] d_90 = 3.83 (from d_75)
 [S11 Area Sync] d_91 = 159.00 (from d_76)
 [S11 Area Sync] d_92 = 100.66 (from d_77)
 [S11 Area Sync] d_93 = 0.00 (from d_78)
 [S11 Area Sync] Refreshing UI...
 [S11 Area Sync] Triggering recalculation...
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 S10: Target listener triggered by i_97, recalculating all.
 S10: Target listener triggered by i_98, recalculating all.
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 [S11 Area Sync] Sync completed successfully
 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
 [g_109] Locked (not MEASURED mode), preserving state value
 S10: Target listener triggered by m_121, recalculating all.
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Section rendered - initializing Pattern A Dual-State Module.
 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Pattern A initialization complete.
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
 [S11 Area Sync] d_88 = 7.50 (from d_73)
 [S11 Area Sync] d_89 = 81.14 (from d_74)
 [S11 Area Sync] d_90 = 3.83 (from d_75)
 [S11 Area Sync] d_91 = 159.00 (from d_76)
 [S11 Area Sync] d_92 = 100.66 (from d_77)
 [S11 Area Sync] d_93 = 0.00 (from d_78)
 [S11 Area Sync] Refreshing UI...
 [S11 Area Sync] Triggering recalculation...
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 S10: Target listener triggered by i_97, recalculating all.
 S10: Target listener triggered by i_98, recalculating all.
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 [S11 Area Sync] Sync completed successfully
 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
 [g_109] Locked (not MEASURED mode), preserving state value
 S10: Target listener triggered by m_121, recalculating all.
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Section rendered - initializing Pattern A Dual-State Module.
 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Pattern A initialization complete.
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
 [S11 Area Sync] d_88 = 7.50 (from d_73)
 [S11 Area Sync] d_89 = 81.14 (from d_74)
 [S11 Area Sync] d_90 = 3.83 (from d_75)
 [S11 Area Sync] d_91 = 159.00 (from d_76)
 [S11 Area Sync] d_92 = 100.66 (from d_77)
 [S11 Area Sync] d_93 = 0.00 (from d_78)
 [S11 Area Sync] Refreshing UI...
 [S11 Area Sync] Triggering recalculation...
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 S10: Target listener triggered by i_97, recalculating all.
 S10: Target listener triggered by i_98, recalculating all.
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 [S11 Area Sync] Sync completed successfully
 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
 [g_109] Locked (not MEASURED mode), preserving state value
 S10: Target listener triggered by m_121, recalculating all.
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Section rendered - initializing Pattern A Dual-State Module.
 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Pattern A initialization complete.
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
Section11.js:2174 [S11] Setting up S10 area listeners...
Section11.js:2209 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3249 S11: Section rendered - initializing Self-Contained State Module.
Section11.js:2174 [S11] Setting up S10 area listeners...
Section11.js:2209 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3268 S11: ModeManager exposed globally for cross-section integration.
Section11.js:3276 [S11 Area Sync] S11 initialization complete - sync functions now enabled
Section11.js:2079 [S11 Area Sync] Starting sync in target mode
Section11.js:2125 [S11 Area Sync] d_88 = 7.50 (from d_73)
Section11.js:2125 [S11 Area Sync] d_89 = 81.14 (from d_74)
Section11.js:2125 [S11 Area Sync] d_90 = 3.83 (from d_75)
Section11.js:2125 [S11 Area Sync] d_91 = 159.00 (from d_76)
Section11.js:2125 [S11 Area Sync] d_92 = 100.66 (from d_77)
Section11.js:2125 [S11 Area Sync] d_93 = 0.00 (from d_78)
Section11.js:2137 [S11 Area Sync] Refreshing UI...
Section11.js:2141 [S11 Area Sync] Triggering recalculation...
Section11.js:3233 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
Section10.js:2966 S10: Target listener triggered by i_97, recalculating all.
Section10.js:2966 S10: Target listener triggered by i_98, recalculating all.
Section11.js:3233 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
Section11.js:2144 [S11 Area Sync] Sync completed successfully
Section11.js:3293 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
Section12.js:2974 [g_109] Locked (not MEASURED mode), preserving state value
Section10.js:2966 S10: Target listener triggered by m_121, recalculating all.
Section14.js:1429 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
Section14.js:1438 S14: Section rendered - initializing Pattern A Dual-State Module.
Section14.js:80 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
Section14.js:1429 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
Section14.js:1465 S14: Pattern A initialization complete.
Section19.js:1276 [S19] Notes section rendered
Section19.js:21 [S19] Notes & QC Monitor section loaded
Section03.js:1256 Section03: Province selected: ON
Section03.js:1317 City dropdown updated for ON - selected: Alexandria
Section03.js:1256 Section03: Province selected: ON
Section03.js:1317 City dropdown updated for ON - selected: Alexandria
index.html?_=1765045712576:1419 TEUI Calculator 4.011 initialization complete
Clock.js:28 [CLOCK] Performance monitoring initialized
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: l_104
applyTooltip @ TooltipManager.js:795Understand this warningAI
QCMonitor.js:40 [QCMonitor] QC monitoring disabled. Add ?qc=true to URL to activate.
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
Section01.js:773 🔍 [S01DB] updateTEUIDisplay START: e_10=341.2, h_10=93.88345196516993, useType=Utility Bills
Section01.js:843 🔍 [S01] T.1 Calculation: e_6=22.3 (ref), h_6=11.7 (target) → reduction should be 48%
Section01.js:942 🔍 [S01DB] UPDATING h_10: 93.9 (from j_32=133990.46264469053, area=1427.2)
Section01.js:529 🔍 [S01] h_6 explanation: target=11.7, ref=22.3, reduction=0.4753363228699552, percent=48%
Section01.js:1267 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
Section10.js:2966 S10: Target listener triggered by i_103, recalculating all.
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
TooltipManager.js:795 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
Clock.js:41 [CLOCK] Starting initial load timing
Section09.js:2103 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
Section06.js:599 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
Section06.js:594 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
Dependency.js:2091 [DependencyGraph] Already initialized, skipping re-initialization
Section01.js:773 🔍 [S01DB] updateTEUIDisplay START: e_10=182.2, h_10=93.68427304759112, useType=Utility Bills
Section01.js:843 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.7 (target) → reduction should be 49%
Section01.js:942 🔍 [S01DB] UPDATING h_10: 93.7 (from j_32=133706.19449352205, area=1427.2)
Section01.js:529 🔍 [S01] h_6 explanation: target=11.7, ref=23.1, reduction=0.49350649350649356, percent=49%
Clock.js:59 🕐 [CLOCK] ⭐ INITIALIZATION COMPLETE: 265ms (all calculations finalized)
Section01.js:1267 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10