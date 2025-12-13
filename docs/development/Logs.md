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
 [WOMBAT] setupFieldListeners: Stories dropdown found = 
 [WOMBAT] ✅ Stories dropdown listener attached to d_199
 [WOMBAT] setupFieldListeners: Volume field found = 
 [WOMBAT] ✅ Volume field listener attached to d_198
 [WOMBAT] Section 19 rendered
 [WOMBAT] Initialized d_198 = 8000.00 from S12 (d_105)
 [WOMBAT] Initialized d_199 = 1.5 from S12 (d_103)
 [WOMBAT] Initialized ref_d_198 = 8000.00 from S12 (ref_d_105)
 [WOMBAT] Initialized ref_d_199 = 1.5 from S12 (ref_d_103)
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
 [WOMBAT] setupFieldListeners: Stories dropdown found = 
 [WOMBAT] ✅ Stories dropdown listener attached to d_199
 [WOMBAT] setupFieldListeners: Volume field found = 
 [WOMBAT] ✅ Volume field listener attached to d_198
 [WOMBAT] Section 19 rendered
 [WOMBAT] Initialized d_198 = 8000.00 from S12 (d_105)
 [WOMBAT] Initialized d_199 = 1.5 from S12 (d_103)
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
 [WOMBAT] setupFieldListeners: Stories dropdown found = 
 [WOMBAT] ✅ Stories dropdown listener attached to d_199
 [WOMBAT] setupFieldListeners: Volume field found = 
 [WOMBAT] ✅ Volume field listener attached to d_198
 [WOMBAT] Section 19 rendered
 [WOMBAT] Initialized d_198 = 8000.00 from S12 (d_105)
 [WOMBAT] Initialized d_199 = 1.5 from S12 (d_103)
 [S19] Notes section rendered
 [S19] Notes & QC Monitor section loaded
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 [ReferenceToggle] Master Reference Toggle initialization complete
Section19.js:1237 Uncaught Understand this errorAI
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
 [WOMBAT] setupFieldListeners: Stories dropdown found = 
 [WOMBAT] ✅ Stories dropdown listener attached to d_199
 [WOMBAT] setupFieldListeners: Volume field found = 
 [WOMBAT] ✅ Volume field listener attached to d_198
 [WOMBAT] Section 19 rendered
 [WOMBAT] Initialized d_198 = 8000.00 from S12 (d_105)
 [WOMBAT] Initialized d_199 = 1.5 from S12 (d_103)
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
 [WOMBAT] setupFieldListeners: Stories dropdown found = 
 [WOMBAT] ✅ Stories dropdown listener attached to d_199
 [WOMBAT] setupFieldListeners: Volume field found = 
 [WOMBAT] ✅ Volume field listener attached to d_198
 [WOMBAT] Section 19 rendered
 [WOMBAT] Initialized d_198 = 8000.00 from S12 (d_105)
 [WOMBAT] Initialized d_199 = 1.5 from S12 (d_103)
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
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795Understand this warningAI
 🔍 [S01DB] updateTEUIDisplay START: e_10=341.2, h_10=93.99858460038593, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=22.3 (ref), h_6=11.7 (target) → reduction should be 48%
 🔍 [S01DB] UPDATING h_10: 94.0 (from j_32=134154.7799416708, area=1427.2)
 🔍 [S01] h_6 explanation: target=11.7, ref=22.3, reduction=0.4753363228699552, percent=48%
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
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
 🕐 [CLOCK] ⭐ INITIALIZATION COMPLETE: 259ms (all calculations finalized)
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 [WOMBAT] Topology view activated
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): Object
 [FieldManager] Section sect19 has no ModeManager - using direct write for d_199
routeToSectionModeManager @ FieldManager.js:232Understand this warningAI
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S12→WOMBAT] Syncing d_103 = 3 from WOMBAT d_199
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [WOMBAT SYNC] d_103 changed: 1.5 → 3
 [WOMBAT] ✅ Synced d_199 = 3 from S12 (d_103)
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): Object
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Geometry solved (Reference mode): Object
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): Object
 S10: Target listener triggered by i_103, recalculating all.
 [WOMBAT DOM] Stories dropdown changed: d_199 = "undefined" (type: undefined)
 [WOMBAT] ❌ Dropdown value is invalid: "undefined"
(anonymous) @ Section19.js:965Understand this errorAI
 🔍 [S01DB] updateTEUIDisplay START: e_10=197.5, h_10=95.1406159024694, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.8 (target) → reduction should be 49%
 🔍 [S01DB] UPDATING h_10: 95.1 (from j_32=135784.68701600435, area=1427.2)
 🔍 [S01] h_6 explanation: target=11.8, ref=23.1, reduction=0.48917748917748916, percent=49%
 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 108ms (subsequent update)
 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 108ms (interaction → h_10 settlement)
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 [FieldManager] Section sect19 has no ModeManager - using direct write for d_199
routeToSectionModeManager @ FieldManager.js:232Understand this warningAI
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S12→WOMBAT] Syncing d_103 = 5 from WOMBAT d_199
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [WOMBAT SYNC] d_103 changed: 3 → 5
 [WOMBAT] ✅ Synced d_199 = 5 from S12 (d_103)
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): Object
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Geometry solved (Reference mode): Object
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): Object
 S10: Target listener triggered by i_103, recalculating all.
 [WOMBAT DOM] Stories dropdown changed: d_199 = "undefined" (type: undefined)
 [WOMBAT] ❌ Dropdown value is invalid: "undefined"
(anonymous) @ Section19.js:965Understand this errorAI
 🔍 [S01DB] updateTEUIDisplay START: e_10=197.5, h_10=97.44937904612664, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.9 (target) → reduction should be 48%
 🔍 [S01DB] UPDATING h_10: 97.4 (from j_32=139079.75377463194, area=1427.2)
 🔍 [S01] h_6 explanation: target=11.9, ref=23.1, reduction=0.48484848484848486, percent=48%
 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 108ms (subsequent update)
 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 108ms (interaction → h_10 settlement)
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 [FieldManager] Section sect19 has no ModeManager - using direct write for d_198
routeToSectionModeManager @ FieldManager.js:232Understand this warningAI
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S12→WOMBAT] Syncing d_105 = 10000 from WOMBAT d_198
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 S10: Target listener triggered by m_121, recalculating all.
 [S14 LISTENER] 🔥 d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 d_122 changed - triggering calculateAll() + UI update
 [WOMBAT SYNC] d_105 changed: 8000.00 → 10000
 [WOMBAT] ✅ Synced d_198 = 10000 from S12 (d_105)
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): Object
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Geometry solved (Reference mode): Object
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): Object
 [WOMBAT DOM] Volume field changed: d_198 = "10000"
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [WOMBAT] ✅ Published d_198 = 10000 via ModeManager (target mode)
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): Object
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Geometry solved (Reference mode): Object
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): Object
 🔍 [S01DB] updateTEUIDisplay START: e_10=197.5, h_10=97.44770689512379, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.9 (target) → reduction should be 48%
Section01.js:942 🔍 [S01DB] UPDATING h_10: 97.4 (from j_32=139077.36728072067, area=1427.2)
Section01.js:529 🔍 [S01] h_6 explanation: target=11.9, ref=23.1, reduction=0.48484848484848486, percent=48%
Clock.js:65 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 32ms (subsequent update)
Clock.js:178 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 32ms (interaction → h_10 settlement)
Section01.js:1267 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
Section12.js:93 S12 TargetState: Saved state after user-modified changed d_105 to 11000
Clock.js:163 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section10.js:2966 S10: Target listener triggered by m_121, recalculating all.
Section14.js:1404 [S14 LISTENER] 🔥 d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 d_122 changed - triggering calculateAll() + UI update
Section19.js:1068 [WOMBAT SYNC] d_105 changed: 10000 → 11000
Section19.js:1074 [WOMBAT] ✅ Synced d_198 = 11000 from S12 (d_105)
Section19.js:466 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
Section19.js:554 [WOMBAT] Geometry solved (Target mode): Object
Section19.js:466 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
Section19.js:554 [WOMBAT] Geometry solved (Reference mode): Object
Section19.js:466 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
Section19.js:554 [WOMBAT] Geometry solved (Target mode): Object
Section01.js:773 🔍 [S01DB] updateTEUIDisplay START: e_10=197.5, h_10=97.9801654015433, useType=Utility Bills
Section01.js:843 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.9 (target) → reduction should be 48%
Section01.js:942 🔍 [S01DB] UPDATING h_10: 98.0 (from j_32=139837.2920610826, area=1427.2)
Section01.js:529 🔍 [S01] h_6 explanation: target=11.9, ref=23.1, reduction=0.48484848484848486, percent=48%
Clock.js:65 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 114ms (subsequent update)
Clock.js:178 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 114ms (interaction → h_10 settlement)
Section01.js:1267 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10