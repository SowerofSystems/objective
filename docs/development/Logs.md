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
 S03: Climate data available (13) ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
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
 [WOMBAT] ✅ Volume field Enter-key listener attached to d_198
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
 S03: Climate data available (13) ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
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
 [WOMBAT] ✅ Volume field Enter-key listener attached to d_198
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
 S03: Climate data available (13) ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
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
 [WOMBAT] ✅ Volume field Enter-key listener attached to d_198
 [WOMBAT] Section 19 rendered
 [WOMBAT] Initialized d_198 = 8000.00 from S12 (d_105)
 [WOMBAT] Initialized d_199 = 1.5 from S12 (d_103)
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
 S03: Climate data available (13) ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
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
 [WOMBAT] ✅ Volume field Enter-key listener attached to d_198
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
 S03: Climate data available (13) ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
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
 [WOMBAT] ✅ Volume field Enter-key listener attached to d_198
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
applyTooltip @ TooltipManager.js:795
(anonymous) @ TooltipManager.js:854
(anonymous) @ TooltipManager.js:846
applyTooltipsToSection @ TooltipManager.js:843
(anonymous) @ Section12.js:3312
setTimeout
onSectionRendered @ Section12.js:3311
calculateTargetModel @ Section03.js:1928
calculateAll @ Section03.js:1866
(anonymous) @ Section03.js:2728
checkData @ Section03.js:538
ensureAvailable @ Section03.js:554
onSectionRendered @ Section03.js:2687
initializeSectionEventHandlers @ FieldManager.js:418
renderSection @ FieldManager.js:463
(anonymous) @ FieldManager.js:490
renderAllSections @ FieldManager.js:489
(anonymous) @ FieldManager.js:1567Understand this warningAI
 [QCMonitor] QC monitoring disabled. Add ?qc=true to URL to activate.
 [WOMBAT] SVG element initialized
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795
(anonymous) @ TooltipManager.js:854
(anonymous) @ TooltipManager.js:846
applyTooltipsToSection @ TooltipManager.js:843
(anonymous) @ Section11.js:3576
setTimeout
onSectionRendered @ Section11.js:3575
initializeSectionEventHandlers @ FieldManager.js:418
renderSection @ FieldManager.js:463
(anonymous) @ FieldManager.js:490
renderAllSections @ FieldManager.js:489
(anonymous) @ FieldManager.js:1567Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795
(anonymous) @ TooltipManager.js:854
(anonymous) @ TooltipManager.js:846
applyTooltipsToSection @ TooltipManager.js:843
(anonymous) @ Section11.js:3576
setTimeout
onSectionRendered @ Section11.js:3575
initializeSectionEventHandlers @ FieldManager.js:418
renderSection @ FieldManager.js:463
(anonymous) @ FieldManager.js:490
renderAllSections @ FieldManager.js:489
(anonymous) @ FieldManager.js:1567Understand this warningAI
 [WOMBAT] SVG element initialized
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795
(anonymous) @ TooltipManager.js:854
(anonymous) @ TooltipManager.js:846
applyTooltipsToSection @ TooltipManager.js:843
(anonymous) @ Section11.js:3576
setTimeout
onSectionRendered @ Section11.js:3575
initializeSectionEventHandlers @ FieldManager.js:418
renderSection @ FieldManager.js:463
(anonymous) @ FieldManager.js:490
renderAllSections @ FieldManager.js:489
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:992Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795
(anonymous) @ TooltipManager.js:854
(anonymous) @ TooltipManager.js:846
applyTooltipsToSection @ TooltipManager.js:843
(anonymous) @ Section11.js:3576
setTimeout
onSectionRendered @ Section11.js:3575
initializeSectionEventHandlers @ FieldManager.js:418
renderSection @ FieldManager.js:463
(anonymous) @ FieldManager.js:490
renderAllSections @ FieldManager.js:489
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:992Understand this warningAI
 [WOMBAT] SVG element initialized
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795
(anonymous) @ TooltipManager.js:854
(anonymous) @ TooltipManager.js:846
applyTooltipsToSection @ TooltipManager.js:843
(anonymous) @ Section11.js:3576
setTimeout
onSectionRendered @ Section11.js:3575
initializeSectionEventHandlers @ FieldManager.js:418
renderSection @ FieldManager.js:463
(anonymous) @ FieldManager.js:490
renderAllSections @ FieldManager.js:489
(anonymous) @ init.js:906Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795
(anonymous) @ TooltipManager.js:854
(anonymous) @ TooltipManager.js:846
applyTooltipsToSection @ TooltipManager.js:843
(anonymous) @ Section11.js:3576
setTimeout
onSectionRendered @ Section11.js:3575
initializeSectionEventHandlers @ FieldManager.js:418
renderSection @ FieldManager.js:463
(anonymous) @ FieldManager.js:490
renderAllSections @ FieldManager.js:489
(anonymous) @ init.js:906Understand this warningAI
 [WOMBAT] SVG element initialized
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:795
(anonymous) @ TooltipManager.js:854
(anonymous) @ TooltipManager.js:846
applyTooltipsToSection @ TooltipManager.js:843
(anonymous) @ Section11.js:3576
setTimeout
onSectionRendered @ Section11.js:3575
initializeSectionEventHandlers @ FieldManager.js:418
renderSection @ FieldManager.js:463
(anonymous) @ FieldManager.js:490
renderAllSections @ FieldManager.js:489
(anonymous) @ objective.openbuilding.ca/:1425Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795
(anonymous) @ TooltipManager.js:854
(anonymous) @ TooltipManager.js:846
applyTooltipsToSection @ TooltipManager.js:843
(anonymous) @ Section11.js:3576
setTimeout
onSectionRendered @ Section11.js:3575
initializeSectionEventHandlers @ FieldManager.js:418
renderSection @ FieldManager.js:463
(anonymous) @ FieldManager.js:490
renderAllSections @ FieldManager.js:489
(anonymous) @ objective.openbuilding.ca/:1425Understand this warningAI
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
applyTooltip @ TooltipManager.js:795
(anonymous) @ TooltipManager.js:854
(anonymous) @ TooltipManager.js:846
applyTooltipsToSection @ TooltipManager.js:843
(anonymous) @ Section11.js:3576
setTimeout
onSectionRendered @ Section11.js:3575
initializeSectionEventHandlers @ FieldManager.js:418
renderSection @ FieldManager.js:463
(anonymous) @ FieldManager.js:490
renderAllSections @ FieldManager.js:489
initialize @ Calculator.js:66
(anonymous) @ objective.openbuilding.ca/:1445Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:795
(anonymous) @ TooltipManager.js:854
(anonymous) @ TooltipManager.js:846
applyTooltipsToSection @ TooltipManager.js:843
(anonymous) @ Section11.js:3576
setTimeout
onSectionRendered @ Section11.js:3575
initializeSectionEventHandlers @ FieldManager.js:418
renderSection @ FieldManager.js:463
(anonymous) @ FieldManager.js:490
renderAllSections @ FieldManager.js:489
initialize @ Calculator.js:66
(anonymous) @ objective.openbuilding.ca/:1445Understand this warningAI
 [CLOCK] Starting initial load timing
 [S09 M-N STORE] Storing to StateManager: ref_m_65="100%", ref_m_66="100%", ref_m_67="100%"
 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 [DependencyGraph] Already initialized, skipping re-initialization
 🔍 [S01DB] updateTEUIDisplay START: e_10=182.2, h_10=93.80497415036699, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.7 (target) → reduction should be 49%
 🔍 [S01DB] UPDATING h_10: 93.8 (from j_32=133878.45910740376, area=1427.2)
 🔍 [S01] h_6 explanation: target=11.7, ref=23.1, reduction=0.49350649350649356, percent=49%
 🕐 [CLOCK] ⭐ INITIALIZATION COMPLETE: 261ms (all calculations finalized)
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
objective.openbuilding.ca/:1 Blocked aria-hidden on an element because its descendant retained focus. The focus must not be hidden from assistive technology users. Avoid using aria-hidden on a focused element or its ancestor. Consider using the inert attribute instead, which will also prevent focus. For more details, see the aria-hidden section of the WAI-ARIA specification at https://w3c.github.io/aria/#aria-hidden.
Element with focus: button
Ancestor with aria-hidden:  <div class=​"modal fade" id=​"disclaimerModal" tabindex=​"-1" aria-labelledby=​"disclaimerModalLabel" style=​"display:​ none;​ padding-left:​ 0px;​" aria-hidden=​"true">​…​</div>​Understand this errorAI
 [WOMBAT] Topology view activated
 🎨 [WOMBAT updateVisualization] Called with mode="target"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = false
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): {footprint: {…}, height: 8.408071748878923, storyHeight: 5.605381165919282, stories: 1.5, volumePerFloor: 5333.333333333333, …}
 🎨 [WOMBAT updateVisualization] SVG element found: true
 🎨 [WOMBAT updateVisualization] SVG cleared
 🎨 [WOMBAT updateVisualization] modelColor = #007bff (isReference=false)
 S12 TargetState: Saved state after user-modified changed d_103 to 2
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [WOMBAT SYNC] d_103 changed: 1.5 → 2
 [WOMBAT] ✅ Synced d_199 = 2 from S12 (d_103)
 [WOMBAT calculateAll] Called - Current mode: target, isActivated: true
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): {footprint: {…}, height: 11.210762331838565, storyHeight: 5.605381165919282, stories: 2, volumePerFloor: 4000, …}
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Geometry solved (Reference mode): {footprint: {…}, height: 8.408071748878923, storyHeight: 5.605381165919282, stories: 1.5, volumePerFloor: 5333.333333333333, …}
 [WOMBAT calculateAll] Updating visualization for mode: target
 🎨 [WOMBAT updateVisualization] Called with mode="target"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = false
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): {footprint: {…}, height: 11.210762331838565, storyHeight: 5.605381165919282, stories: 2, volumePerFloor: 4000, …}
 🎨 [WOMBAT updateVisualization] SVG element found: true
 🎨 [WOMBAT updateVisualization] SVG cleared
 🎨 [WOMBAT updateVisualization] modelColor = #007bff (isReference=false)
 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
 [WOMBAT] ✅ Refreshed h_200 = 26.71 via FieldManager
 [WOMBAT] ✅ Refreshed h_201 = 26.71 via FieldManager
 [WOMBAT] ✅ Refreshed h_203 = 5.61 via FieldManager
 [WOMBAT] ✅ Refreshed d_198 = 8000.00 via FieldManager
 [WOMBAT] ✅ Refreshed d_199 = 2 via FieldManager
 [WOMBAT calculateAll] Complete
 [FieldManager] Routed d_103=2 through sect12 ModeManager
 S10: Target listener triggered by i_103, recalculating all.
 [FieldManager] Called sect12.calculateAll() after d_103 change
 S12 TargetState: Saved state after user-modified changed d_103 to 2
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔍 [S01DB] updateTEUIDisplay START: e_10=197.5, h_10=94.40742760684851, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.7 (target) → reduction should be 49%
 🔍 [S01DB] UPDATING h_10: 94.4 (from j_32=134738.2806804942, area=1427.2)
 🔍 [S01] h_6 explanation: target=11.7, ref=23.1, reduction=0.49350649350649356, percent=49%
 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 35ms (subsequent update)
 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 35ms (interaction → h_10 settlement)
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 S12 TargetState: Saved state after user-modified changed d_103 to 5
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [WOMBAT SYNC] d_103 changed: 2 → 5
 [WOMBAT] ✅ Synced d_199 = 5 from S12 (d_103)
 [WOMBAT calculateAll] Called - Current mode: target, isActivated: true
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): {footprint: {…}, height: 28.026905829596412, storyHeight: 5.605381165919282, stories: 5, volumePerFloor: 1600, …}
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Geometry solved (Reference mode): {footprint: {…}, height: 8.408071748878923, storyHeight: 5.605381165919282, stories: 1.5, volumePerFloor: 5333.333333333333, …}
 [WOMBAT calculateAll] Updating visualization for mode: target
 🎨 [WOMBAT updateVisualization] Called with mode="target"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = false
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): {footprint: {…}, height: 28.026905829596412, storyHeight: 5.605381165919282, stories: 5, volumePerFloor: 1600, …}
 🎨 [WOMBAT updateVisualization] SVG element found: true
 🎨 [WOMBAT updateVisualization] SVG cleared
 🎨 [WOMBAT updateVisualization] modelColor = #007bff (isReference=false)
 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
 [WOMBAT] ✅ Refreshed h_200 = 16.89 via FieldManager
 [WOMBAT] ✅ Refreshed h_201 = 16.89 via FieldManager
 [WOMBAT] ✅ Refreshed h_203 = 5.61 via FieldManager
 [WOMBAT] ✅ Refreshed d_198 = 8000.00 via FieldManager
 [WOMBAT] ✅ Refreshed d_199 = 5 via FieldManager
 [WOMBAT calculateAll] Complete
 [FieldManager] Routed d_103=5 through sect12 ModeManager
 S10: Target listener triggered by i_103, recalculating all.
 [FieldManager] Called sect12.calculateAll() after d_103 change
 S12 TargetState: Saved state after user-modified changed d_103 to 5
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔍 [S01DB] updateTEUIDisplay START: e_10=197.5, h_10=97.44937904612664, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.9 (target) → reduction should be 48%
 🔍 [S01DB] UPDATING h_10: 97.4 (from j_32=139079.75377463194, area=1427.2)
 🔍 [S01] h_6 explanation: target=11.9, ref=23.1, reduction=0.48484848484848486, percent=48%
 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 32ms (subsequent update)
 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 32ms (interaction → h_10 settlement)
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 [WOMBAT ModeManager] Publishing to StateManager: d_199 = 4 (Target mode)
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S12→WOMBAT] Syncing d_103 = 4 from WOMBAT d_199
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [WOMBAT SYNC] d_103 changed: 4 → 4
 S10: Target listener triggered by i_103, recalculating all.
 [FieldManager] Routed d_199=4 through sect19 ModeManager
 [WOMBAT calculateAll] Called - Current mode: target, isActivated: true
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): {footprint: {…}, height: 22.42152466367713, storyHeight: 5.605381165919282, stories: 4, volumePerFloor: 2000, …}
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Geometry solved (Reference mode): {footprint: {…}, height: 8.408071748878923, storyHeight: 5.605381165919282, stories: 1.5, volumePerFloor: 5333.333333333333, …}
 [WOMBAT calculateAll] Updating visualization for mode: target
 🎨 [WOMBAT updateVisualization] Called with mode="target"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = false
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): {footprint: {…}, height: 22.42152466367713, storyHeight: 5.605381165919282, stories: 4, volumePerFloor: 2000, …}
 🎨 [WOMBAT updateVisualization] SVG element found: true
 🎨 [WOMBAT updateVisualization] SVG cleared
 🎨 [WOMBAT updateVisualization] modelColor = #007bff (isReference=false)
 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
 [WOMBAT] ✅ Refreshed h_200 = 18.89 via FieldManager
 [WOMBAT] ✅ Refreshed h_201 = 18.89 via FieldManager
 [WOMBAT] ✅ Refreshed h_203 = 5.61 via FieldManager
 [WOMBAT] ✅ Refreshed d_198 = 8000.00 via FieldManager
 [WOMBAT] ✅ Refreshed d_199 = 4 via FieldManager
 [WOMBAT calculateAll] Complete
 [FieldManager] Called sect19.calculateAll() after d_199 change
 [WOMBAT DOM] Stories dropdown changed: d_199 = "undefined" (type: undefined)
Section19.js:1067 [WOMBAT] ❌ Dropdown value is invalid: "undefined"
(anonymous) @ Section19.js:1067Understand this errorAI
 🔍 [S01DB] updateTEUIDisplay START: e_10=197.5, h_10=96.10947186453984, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.8 (target) → reduction should be 49%
 🔍 [S01DB] UPDATING h_10: 96.1 (from j_32=137167.43824507127, area=1427.2)
 🔍 [S01] h_6 explanation: target=11.8, ref=23.1, reduction=0.48917748917748916, percent=49%
 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 107ms (subsequent update)
 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 107ms (interaction → h_10 settlement)
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 [WOMBAT ModeManager] Publishing to StateManager: d_199 = 2 (Target mode)
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S12→WOMBAT] Syncing d_103 = 2 from WOMBAT d_199
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [WOMBAT SYNC] d_103 changed: 2 → 2
 S10: Target listener triggered by i_103, recalculating all.
 [FieldManager] Routed d_199=2 through sect19 ModeManager
 [WOMBAT calculateAll] Called - Current mode: target, isActivated: true
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): {footprint: {…}, height: 11.210762331838565, storyHeight: 5.605381165919282, stories: 2, volumePerFloor: 4000, …}
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Geometry solved (Reference mode): {footprint: {…}, height: 8.408071748878923, storyHeight: 5.605381165919282, stories: 1.5, volumePerFloor: 5333.333333333333, …}
 [WOMBAT calculateAll] Updating visualization for mode: target
 🎨 [WOMBAT updateVisualization] Called with mode="target"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = false
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): {footprint: {…}, height: 11.210762331838565, storyHeight: 5.605381165919282, stories: 2, volumePerFloor: 4000, …}
 🎨 [WOMBAT updateVisualization] SVG element found: true
 🎨 [WOMBAT updateVisualization] SVG cleared
 🎨 [WOMBAT updateVisualization] modelColor = #007bff (isReference=false)
 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
 [WOMBAT] ✅ Refreshed h_200 = 26.71 via FieldManager
 [WOMBAT] ✅ Refreshed h_201 = 26.71 via FieldManager
 [WOMBAT] ✅ Refreshed h_203 = 5.61 via FieldManager
 [WOMBAT] ✅ Refreshed d_198 = 8000.00 via FieldManager
 [WOMBAT] ✅ Refreshed d_199 = 2 via FieldManager
 [WOMBAT calculateAll] Complete
 [FieldManager] Called sect19.calculateAll() after d_199 change
 [WOMBAT DOM] Stories dropdown changed: d_199 = "undefined" (type: undefined)
Section19.js:1067 [WOMBAT] ❌ Dropdown value is invalid: "undefined"
(anonymous) @ Section19.js:1067Understand this errorAI
 🔍 [S01DB] updateTEUIDisplay START: e_10=197.5, h_10=94.40742760684851, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.7 (target) → reduction should be 49%
 🔍 [S01DB] UPDATING h_10: 94.4 (from j_32=134738.2806804942, area=1427.2)
 🔍 [S01] h_6 explanation: target=11.7, ref=23.1, reduction=0.49350649350649356, percent=49%
 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 106ms (subsequent update)
 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 106ms (interaction → h_10 settlement)
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 [ReferenceToggle] Found 16 dual-state sections: (16) ['sect02', 'sect03', 'sect04', 'sect05', 'sect06', 'sect07', 'sect08', 'sect09', 'sect10', 'sect11', 'sect12', 'sect13', 'sect14', 'sect15', 'sect16', 'sect19']
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
 🔄 [WOMBAT ModeManager] switchMode() called with mode="reference"
 ✅ [WOMBAT ModeManager] currentMode set to "reference"
 🎨 [WOMBAT ModeManager] isActivated = true
 🎨 [WOMBAT ModeManager] Calling updateVisualization("reference")...
 🎨 [WOMBAT updateVisualization] Called with mode="reference"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = true
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Geometry solved (Reference mode): {footprint: {…}, height: 8.408071748878923, storyHeight: 5.605381165919282, stories: 1.5, volumePerFloor: 5333.333333333333, …}
 🎨 [WOMBAT updateVisualization] SVG element found: true
 🎨 [WOMBAT updateVisualization] SVG cleared
 🎨 [WOMBAT updateVisualization] modelColor = #dc3545 (isReference=true)
 ✅ [WOMBAT ModeManager] updateVisualization() completed
 [WOMBAT] updateCalculatedDisplayValues() called for mode="reference"
 [WOMBAT] ✅ Refreshed h_200 = 30.85 via FieldManager
 [WOMBAT] ✅ Refreshed h_201 = 30.85 via FieldManager
 [WOMBAT] ✅ Refreshed h_203 = 5.61 via FieldManager
 [WOMBAT] ✅ Refreshed d_198 = 8000.00 via FieldManager
 [WOMBAT] ✅ Refreshed d_199 = 1.5 via FieldManager
 🎨 Master Toggle: Switched 16/16 sections to REFERENCE mode with global styling
 [ReferenceToggle] Found 16 dual-state sections: (16) ['sect02', 'sect03', 'sect04', 'sect05', 'sect06', 'sect07', 'sect08', 'sect09', 'sect10', 'sect11', 'sect12', 'sect13', 'sect14', 'sect15', 'sect16', 'sect19']
 🔄 [S06] updateCalculatedDisplayValues: mode=reference
 [S09] Updated calculated display values for reference mode
 [WOMBAT] updateCalculatedDisplayValues() called for mode="reference"
 [WOMBAT] ✅ Refreshed h_200 = 30.85 via FieldManager
 [WOMBAT] ✅ Refreshed h_201 = 30.85 via FieldManager
 [WOMBAT] ✅ Refreshed h_203 = 5.61 via FieldManager
 [WOMBAT] ✅ Refreshed d_198 = 8000.00 via FieldManager
 [WOMBAT] ✅ Refreshed d_199 = 1.5 via FieldManager
 [WOMBAT ModeManager] Publishing to StateManager: ref_d_199 = 4 (Reference mode)
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S12→WOMBAT] Syncing ref_d_103 = 4 from WOMBAT ref_d_199
 S12 ReferenceState: Saved state after user changed d_103 to 4
 [WOMBAT SYNC] ref_d_103 changed: 4 → 4
 [S12→WOMBAT] ✅ Refreshed d_103 DOM = 4 (Reference mode)
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [WOMBAT SYNC] ref_d_103 changed: 4 → 4
 [FieldManager] Routed d_199=4 through sect19 ModeManager
 [WOMBAT calculateAll] Called - Current mode: reference, isActivated: true
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): {footprint: {…}, height: 11.210762331838565, storyHeight: 5.605381165919282, stories: 2, volumePerFloor: 4000, …}
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Geometry solved (Reference mode): {footprint: {…}, height: 22.42152466367713, storyHeight: 5.605381165919282, stories: 4, volumePerFloor: 2000, …}
 [WOMBAT calculateAll] Updating visualization for mode: reference
 🎨 [WOMBAT updateVisualization] Called with mode="reference"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = true
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Geometry solved (Reference mode): {footprint: {…}, height: 22.42152466367713, storyHeight: 5.605381165919282, stories: 4, volumePerFloor: 2000, …}
 🎨 [WOMBAT updateVisualization] SVG element found: true
 🎨 [WOMBAT updateVisualization] SVG cleared
 🎨 [WOMBAT updateVisualization] modelColor = #dc3545 (isReference=true)
 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
 [WOMBAT] updateCalculatedDisplayValues() called for mode="reference"
 [WOMBAT] ✅ Refreshed h_200 = 18.89 via FieldManager
 [WOMBAT] ✅ Refreshed h_201 = 18.89 via FieldManager
 [WOMBAT] ✅ Refreshed h_203 = 5.61 via FieldManager
 [WOMBAT] ✅ Refreshed d_198 = 8000.00 via FieldManager
 [WOMBAT] ✅ Refreshed d_199 = 4 via FieldManager
 [WOMBAT calculateAll] Complete
 [FieldManager] Called sect19.calculateAll() after d_199 change
 [WOMBAT DOM] Stories dropdown changed: d_199 = "undefined" (type: undefined)
Section19.js:1067 [WOMBAT] ❌ Dropdown value is invalid: "undefined"
(anonymous) @ Section19.js:1067Understand this errorAI
 🔍 [S01DB] updateTEUIDisplay START: e_10=197.5, h_10=94.40742760684851, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.3 (ref), h_6=11.7 (target) → reduction should be 50%
 🔍 [S01DB] UPDATING h_10: 94.4 (from j_32=134738.2806804942, area=1427.2)
 🔍 [S01] h_6 explanation: target=11.7, ref=23.3, reduction=0.49785407725321895, percent=50%
 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 329ms (subsequent update)
 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 329ms (interaction → h_10 settlement)
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 S12 ReferenceState: Saved state after user-modified changed d_103 to 5
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [WOMBAT SYNC] ref_d_103 changed: 4 → 5
 [WOMBAT] ✅ Synced ref_d_199 = 5 from S12 (ref_d_103)
 [WOMBAT calculateAll] Called - Current mode: reference, isActivated: true
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Geometry solved (Target mode): {footprint: {…}, height: 11.210762331838565, storyHeight: 5.605381165919282, stories: 2, volumePerFloor: 4000, …}
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Geometry solved (Reference mode): {footprint: {…}, height: 28.026905829596412, storyHeight: 5.605381165919282, stories: 5, volumePerFloor: 1600, …}
 [WOMBAT calculateAll] Updating visualization for mode: reference
 🎨 [WOMBAT updateVisualization] Called with mode="reference"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = true
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Geometry solved (Reference mode): {footprint: {…}, height: 28.026905829596412, storyHeight: 5.605381165919282, stories: 5, volumePerFloor: 1600, …}
 🎨 [WOMBAT updateVisualization] SVG element found: true
 🎨 [WOMBAT updateVisualization] SVG cleared
 🎨 [WOMBAT updateVisualization] modelColor = #dc3545 (isReference=true)
 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
 [WOMBAT] updateCalculatedDisplayValues() called for mode="reference"
 [WOMBAT] ✅ Refreshed h_200 = 16.89 via FieldManager
 [WOMBAT] ✅ Refreshed h_201 = 16.89 via FieldManager
Section19.js:199 [WOMBAT] ✅ Refreshed h_203 = 5.61 via FieldManager
Section19.js:199 [WOMBAT] ✅ Refreshed d_198 = 8000.00 via FieldManager
Section19.js:199 [WOMBAT] ✅ Refreshed d_199 = 5 via FieldManager
Section19.js:1341 [WOMBAT calculateAll] Complete
FieldManager.js:210 [FieldManager] Routed d_103=5 through sect12 ModeManager
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1404 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section19.js:1226 [WOMBAT SYNC] ref_d_103 changed: 5 → 5
FieldManager.js:222 [FieldManager] Called sect12.calculateAll() after d_103 change
Section12.js:202 S12 ReferenceState: Saved state after user-modified changed d_103 to 5
Clock.js:163 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section19.js:1226 [WOMBAT SYNC] ref_d_103 changed: 5 → 5
Section19.js:1226 [WOMBAT SYNC] ref_d_103 changed: 5 → 5
Section01.js:773 🔍 [S01DB] updateTEUIDisplay START: e_10=201.7, h_10=94.40742760684851, useType=Utility Bills
Section01.js:843 🔍 [S01] T.1 Calculation: e_6=23.4 (ref), h_6=11.7 (target) → reduction should be 50%
Section01.js:942 🔍 [S01DB] UPDATING h_10: 94.4 (from j_32=134738.2806804942, area=1427.2)
Section01.js:529 🔍 [S01] h_6 explanation: target=11.7, ref=23.4, reduction=0.5, percent=50%
Clock.js:65 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 26ms (subsequent update)
Clock.js:178 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 26ms (interaction → h_10 settlement)
Section01.js:1267 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10