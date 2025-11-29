VM220:257 Console was cleared
VM220:258 
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
  
VM220:154 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VM220:155 📸 SNAPSHOT: Initial State
VM220:156 ⏱️  Time: 11:10:59 AM
VM220:157 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VM220:159 
🎛️  HEATING SYSTEM SELECTOR:
VM220:160    d_113 (Target):     Heatpump
VM220:161    ref_d_113 (Ref):    Gas
VM220:162    S13 Mode:           target
VM220:164 
⚡ EFFICIENCY FIELDS:
VM220:165    f_113 (HSPF - Target):    12.5
VM220:166    ref_f_113 (HSPF - Ref):   7.1
VM220:167    j_115 (AFUE - Target):    0.9
VM220:168    ref_j_115 (AFUE - Ref):   0.90
VM220:170 
🔢 CALCULATED EFFICIENCY:
VM220:171    h_113 (COPheat - Target): 3.663540445486518
VM220:172    ref_h_113 (COPheat - Ref):1
VM220:174 
🔥 ENERGY CONSUMPTION (j_32):
VM220:175    Target:  1831292.39334576
VM220:176    Ref:     8631977.970393535
VM220:178 
🌍 CARBON INTENSITY (h_10 - THE SYMPTOM):
VM220:179    Target:  163.99143846563624
VM220:180    Ref:     null
VM220:182 
🔒 FIELD LOCK STATES:
VM220:183    f_113 editable:  NO_CONTENTEDITABLE
VM220:184    f_113 disabled:  false
VM220:185    j_115 editable:  NO_CONTENTEDITABLE
VM220:186    j_115 disabled:  NO_INPUT
undefined
ReferenceToggle.js:117 [ReferenceToggle] Found 15 dual-state sections: (15) ['sect02', 'sect03', 'sect04', 'sect05', 'sect06', 'sect07', 'sect08', 'sect09', 'sect10', 'sect11', 'sect12', 'sect13', 'sect14', 'sect15', 'sect16']
Section02.js:1906 [S02] Switched to REFERENCE mode
 [S02] Refreshing UI for REFERENCE mode
 [S02] Updated h_12 (reporting year) slider = "2023" (reference mode)
 [S02] Updated h_13 (service life) slider = "50" (reference mode)
 [S02] Updated h_15 = "11,167.00" (reference mode)
 [S02] Updated i_17 = "XXXX" (reference mode)
 [S02] Updated l_12 = "$0.1300" (reference mode)
 [S02] Updated l_13 = "$0.5070" (reference mode)
 [S02] Updated l_14 = "$1.6200" (reference mode)
 [S02] Updated l_15 = "$180.00" (reference mode)
 [S02] Updated l_16 = "$1.5000" (reference mode)
 Section03: Province selected: ON
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 City dropdown updated for ON - selected: Milton
 S05: Switched to REFERENCE mode
 🔄 [S05] updateCalculatedDisplayValues: mode=reference
 🔄 [S05] updateCalculatedDisplayValues: mode=reference
 S06: Switched to REFERENCE mode
 🔄 [S06] updateCalculatedDisplayValues: mode=reference
 🔄 [S06] updateCalculatedDisplayValues: mode=reference
 🔄 [S07] switchMode: Switching from "target" to "reference"
 🔄 [S07] refreshUI: Starting refresh for mode=reference
 🔍 [S07] refreshUI: fieldId=d_49, storedValue=User Defined, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
 📋 [S07] refreshUI: fieldId=d_49, default=User Defined, valueToShow=User Defined, elementType=SELECT
 🔽 [S07] refreshUI: Setting dropdown d_49 from "User Defined" to "User Defined" (mode=reference)
 🔽 [S07] refreshUI: Dropdown d_49 now shows "User Defined"
 🔍 [S07] refreshUI: fieldId=e_49, storedValue=40, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_49
 ✅ [S07] getFieldDefault: Found default for e_49 = "40.00"
 📋 [S07] refreshUI: fieldId=e_49, default=40.00, valueToShow=40, elementType=TD
 ✏️ [S07] refreshUI: Setting contenteditable e_49 = "40"
 🔍 [S07] refreshUI: fieldId=h_49, storedValue=40, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=h_49
 ✅ [S07] getFieldDefault: Found default for h_49 = "40.00"
 📋 [S07] refreshUI: fieldId=h_49, default=40.00, valueToShow=40, elementType=TD
 🔍 [S07] refreshUI: fieldId=i_49, storedValue=35040000, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=i_49
 ✅ [S07] getFieldDefault: Found default for i_49 = "1,839,600"
 📋 [S07] refreshUI: fieldId=i_49, default=1,839,600, valueToShow=35040000, elementType=TD
 🔍 [S07] refreshUI: fieldId=k_49, storedValue=167788.3324571836, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_49
 ✅ [S07] getFieldDefault: Found default for k_49 = "0.00"
 📋 [S07] refreshUI: fieldId=k_49, default=0.00, valueToShow=167788.3324571836, elementType=TD
 🔍 [S07] refreshUI: fieldId=m_49, storedValue=38%, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=m_49
 ✅ [S07] getFieldDefault: Found default for m_49 = "15%"
 📋 [S07] refreshUI: fieldId=m_49, default=15%, valueToShow=38%, elementType=TD
 🔍 [S07] refreshUI: fieldId=n_49, storedValue=✓, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=n_49
 ✅ [S07] getFieldDefault: Found default for n_49 = "✓"
 📋 [S07] refreshUI: fieldId=n_49, default=✓, valueToShow=✓, elementType=TD
 🔍 [S07] refreshUI: fieldId=e_50, storedValue=10000, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_50
 ✅ [S07] getFieldDefault: Found default for e_50 = "10,000.00"
 📋 [S07] refreshUI: fieldId=e_50, default=10,000.00, valueToShow=10000, elementType=TD
 ✏️ [S07] refreshUI: Setting contenteditable e_50 = "10000"
 🔍 [S07] refreshUI: fieldId=h_50, storedValue=16, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=h_50
 ✅ [S07] getFieldDefault: Found default for h_50 = "16.00"
 📋 [S07] refreshUI: fieldId=h_50, default=16.00, valueToShow=16, elementType=TD
 🔍 [S07] refreshUI: fieldId=i_50, storedValue=14016000, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=i_50
 ✅ [S07] getFieldDefault: Found default for i_50 = "735,840"
 📋 [S07] refreshUI: fieldId=i_50, default=735,840, valueToShow=14016000, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_50, storedValue=733036.7999999999, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=j_50
 ✅ [S07] getFieldDefault: Found default for j_50 = "38,484.43"
 📋 [S07] refreshUI: fieldId=j_50, default=38,484.43, valueToShow=733036.7999999999, elementType=TD
 🔍 [S07] refreshUI: fieldId=m_50, storedValue=38%, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=m_50
 ✅ [S07] getFieldDefault: Found default for m_50 = "15%"
 📋 [S07] refreshUI: fieldId=m_50, default=15%, valueToShow=38%, elementType=TD
 🔍 [S07] refreshUI: fieldId=n_50, storedValue=✓, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=n_50
 ✅ [S07] getFieldDefault: Found default for n_50 = "✓"
 📋 [S07] refreshUI: fieldId=n_50, default=✓, valueToShow=✓, elementType=TD
 🔍 [S07] refreshUI: fieldId=d_51, storedValue=Gas, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_51
 ✅ [S07] getFieldDefault: Found default for d_51 = "Heatpump"
 📋 [S07] refreshUI: fieldId=d_51, default=Heatpump, valueToShow=Gas, elementType=SELECT
 🔽 [S07] refreshUI: Setting dropdown d_51 from "Heatpump" to "Gas" (mode=reference)
 🔽 [S07] refreshUI: Dropdown d_51 now shows "Gas"
 🔍 [S07] refreshUI: fieldId=e_51, storedValue=87344.26468359375, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_51
 ✅ [S07] getFieldDefault: Found default for e_51 = "0.00"
 📋 [S07] refreshUI: fieldId=e_51, default=0.00, valueToShow=87344.26468359375, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_51, storedValue=814485.3333333333, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=j_51
 ✅ [S07] getFieldDefault: Found default for j_51 = "12,828.14"
 📋 [S07] refreshUI: fieldId=j_51, default=12,828.14, valueToShow=814485.3333333333, elementType=TD
 🔍 [S07] refreshUI: fieldId=k_51, storedValue=null, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_51
 ✅ [S07] getFieldDefault: Found default for k_51 = "12,828.14"
 📋 [S07] refreshUI: fieldId=k_51, default=12,828.14, valueToShow=12,828.14, elementType=TD
 🔍 [S07] refreshUI: fieldId=d_52, storedValue=90, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_52
 ✅ [S07] getFieldDefault: Found default for d_52 = "300"
 📋 [S07] refreshUI: fieldId=d_52, default=300, valueToShow=90, elementType=range
 🎚️ [S07] refreshUI: Setting slider d_52 = "90"
 🎚️ [S07] refreshUI: Updating d_52 slider range for system="Gas"
 🎚️ [S07] refreshUI: d_52 slider range updated to min=50, max=98, step=1
 🔍 [S07] refreshUI: fieldId=e_52, storedValue=0.9, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_52
 ✅ [S07] getFieldDefault: Found default for e_52 = "3.00"
 📋 [S07] refreshUI: fieldId=e_52, default=3.00, valueToShow=0.9, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_52, storedValue=814485.3333333333, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=j_52
 ✅ [S07] getFieldDefault: Found default for j_52 = "12,828.14"
 📋 [S07] refreshUI: fieldId=j_52, default=12,828.14, valueToShow=814485.3333333333, elementType=TD
 🔍 [S07] refreshUI: fieldId=k_52, storedValue=0.90, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_52
 ✅ [S07] getFieldDefault: Found default for k_52 = "0.90"
 📋 [S07] refreshUI: fieldId=k_52, default=0.90, valueToShow=0.90, elementType=TD
 ✏️ [S07] refreshUI: Setting contenteditable k_52 = "0.90"
 🔍 [S07] refreshUI: fieldId=m_52, storedValue=333%, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=m_52
 ✅ [S07] getFieldDefault: Found default for m_52 = "100%"
 📋 [S07] refreshUI: fieldId=m_52, default=100%, valueToShow=333%, elementType=TD
 🔍 [S07] refreshUI: fieldId=n_52, storedValue=✓, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=n_52
 ✅ [S07] getFieldDefault: Found default for n_52 = "✓"
 📋 [S07] refreshUI: fieldId=n_52, default=✓, valueToShow=✓, elementType=TD
 🔍 [S07] refreshUI: fieldId=d_53, storedValue=0, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_53
 ✅ [S07] getFieldDefault: Found default for d_53 = "0"
 📋 [S07] refreshUI: fieldId=d_53, default=0, valueToShow=0, elementType=range
 🎚️ [S07] refreshUI: Setting slider d_53 = "0"
 🔍 [S07] refreshUI: fieldId=e_53, storedValue=null, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_53
 ✅ [S07] getFieldDefault: Found default for e_53 = "0.00"
 📋 [S07] refreshUI: fieldId=e_53, default=0.00, valueToShow=0.00, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_53, storedValue=814485.3333333333, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=j_53
 ✅ [S07] getFieldDefault: Found default for j_53 = "12,828.14"
 📋 [S07] refreshUI: fieldId=j_53, default=12,828.14, valueToShow=814485.3333333333, elementType=TD
 🔍 [S07] refreshUI: fieldId=m_53, storedValue=N/A, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=m_53
 ✅ [S07] getFieldDefault: Found default for m_53 = "0%"
 📋 [S07] refreshUI: fieldId=m_53, default=0%, valueToShow=N/A, elementType=TD
 🔍 [S07] refreshUI: fieldId=n_53, storedValue=✓, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=n_53
 ✅ [S07] getFieldDefault: Found default for n_53 = "✓"
 📋 [S07] refreshUI: fieldId=n_53, default=✓, valueToShow=✓, elementType=TD
Section07.js:210 🔍 [S07] refreshUI: fieldId=d_54, storedValue=73303.68, elementFound=true
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_54
Section07.js:339 ✅ [S07] getFieldDefault: Found default for d_54 = "0.00"
Section07.js:243 📋 [S07] refreshUI: fieldId=d_54, default=0.00, valueToShow=73303.68, elementType=TD
Section07.js:210 🔍 [S07] refreshUI: fieldId=j_54, storedValue=81448.53333333331, elementFound=true
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=j_54
Section07.js:339 ✅ [S07] getFieldDefault: Found default for j_54 = "0.00"
Section07.js:243 📋 [S07] refreshUI: fieldId=j_54, default=0.00, valueToShow=81448.53333333331, elementType=TD
Section07.js:210 🔍 [S07] refreshUI: fieldId=k_54, storedValue=null, elementFound=true
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_54
Section07.js:339 ✅ [S07] getFieldDefault: Found default for k_54 = "0.00"
Section07.js:243 📋 [S07] refreshUI: fieldId=k_54, default=0.00, valueToShow=0.00, elementType=TD
Section07.js:323 ✅ [S07] refreshUI: Completed refresh for mode=reference
Section07.js:187 ✅ [S07] switchMode: Switch to "reference" completed
Section08.js:133 S08: Switched to REFERENCE mode.
Section09.js:258 S09: Switched to REFERENCE mode
Section09.js:419 S09: UI refreshed for reference mode
Section09.js:494 [S09] Updated calculated display values for reference mode
Section09.js:494 [S09] Updated calculated display values for reference mode
Section10.js:307 [S10 DEBUG] Mode switch: target → REFERENCE
Section10.js:313 [S10 DEBUG] Calling updateCalculatedDisplayValues() for reference mode
Section11.js:428 S11: Switched to REFERENCE mode
Section11.js:2055 [S11 Area Sync] Starting sync in reference mode
Section11.js:2101 [S11 Area Sync] d_88 = 0 (from ref_d_73)
Section11.js:2101 [S11 Area Sync] d_89 = 914 (from ref_d_74)
Section11.js:2101 [S11 Area Sync] d_90 = 846 (from ref_d_75)
Section11.js:2101 [S11 Area Sync] d_91 = 845 (from ref_d_76)
Section11.js:2101 [S11 Area Sync] d_92 = 120 (from ref_d_77)
Section11.js:2101 [S11 Area Sync] d_93 = 0 (from ref_d_78)
Section11.js:2113 [S11 Area Sync] Refreshing UI...
Section11.js:2117 [S11 Area Sync] Triggering recalculation...
Section11.js:2902 [S11] calculateAll TRIGGERED. isReferenceMode: true
Section11.js:2341 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2341 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2413 [S11] REF TB%=50% → ref_i_97=533753.63, ref_k_97=15816.51
Section11.js:2597 [S11] Writing ref penalty: ref_i_97=533753.63, ref_k_97=15816.51
Section11.js:2346 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2346 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2120 [S11 Area Sync] Sync completed successfully
Section12.js:230 S12: Switched to REFERENCE mode
Section12.js:354 [Section12] Calculated display values updated for reference mode
Section12.js:354 [Section12] Calculated display values updated for reference mode
Section13.js:400 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=reference
Section13.js:407 [S13 updateCalc] ✅ Added j_116 to fieldFormats
Section13.js:400 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=reference
Section13.js:409 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
Section13.js:400 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=reference
Section13.js:409 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
Section14.js:127 S14: Switched to REFERENCE mode
ReferenceToggle.js:200 Uncaught TypeError: Cannot set properties of undefined (setting 'textContent')
    at updateKeyValuesToggleUI (ReferenceToggle.js:200:34)
    at switchAllSectionsMode (ReferenceToggle.js:176:5)
    at Object.switchMode (ReferenceToggle.js:224:5)
    at HTMLDivElement.<anonymous> (Section01.js:1346:37)
updateKeyValuesToggleUI @ ReferenceToggle.js:200
switchAllSectionsMode @ ReferenceToggle.js:176
switchMode @ ReferenceToggle.js:224
(anonymous) @ Section01.js:1346Understand this errorAI
Section01.js:773 🔍 [S01DB] updateTEUIDisplay START: e_10=773, h_10=149.2674155616435, useType=Utility Bills
Section01.js:843 🔍 [S01] T.1 Calculation: e_6=138 (ref), h_6=23 (target) → reduction should be 83%
Section01.js:942 🔍 [S01DB] UPDATING h_10: 149.3 (from j_32=1666869.2295768731, area=11167)
Section01.js:529 🔍 [S01] h_6 explanation: target=23, ref=138, reduction=0.8333333333333334, percent=83%
Clock.js:65 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 59ms (subsequent update)
Clock.js:172 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 59ms (interaction → h_10 settlement)
Section01.js:1267 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
StateManager.js:701 [StateManager] Saved 249 imported fields to localStorage
captureSnapshot("After Reference Toggle")
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 📸 SNAPSHOT: After Reference Toggle
 ⏱️  Time: 11:11:38 AM
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
🎛️  HEATING SYSTEM SELECTOR:
    d_113 (Target):     Gas
    ref_d_113 (Ref):    Gas
    S13 Mode:           reference
 
⚡ EFFICIENCY FIELDS:
    f_113 (HSPF - Target):    7.1
    ref_f_113 (HSPF - Ref):   7.1
    j_115 (AFUE - Target):    0.90
    ref_j_115 (AFUE - Ref):   0.90
 
🔢 CALCULATED EFFICIENCY:
VM220:171    h_113 (COPheat - Target): 3.663540445486518
VM220:172    ref_h_113 (COPheat - Ref):1
VM220:174 
🔥 ENERGY CONSUMPTION (j_32):
VM220:175    Target:  1666869.2295768731
VM220:176    Ref:     8631977.970393535
VM220:178 
🌍 CARBON INTENSITY (h_10 - THE SYMPTOM):
VM220:179    Target:  149.2674155616435
VM220:180    Ref:     null
VM220:182 
🔒 FIELD LOCK STATES:
VM220:183    f_113 editable:  NO_CONTENTEDITABLE
VM220:184    f_113 disabled:  true
VM220:185    j_115 editable:  NO_CONTENTEDITABLE
VM220:186    j_115 disabled:  NO_INPUT
VM220:198 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VM220:199 🔍 CHANGES: Initial State → After Reference Toggle
VM220:200 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VM220:204 
   d_113:
VM220:205       Before: Heatpump
VM220:206       After:  Gas (Δ N/A)
VM220:216       🎛️  SYSTEM TYPE CHANGED!
VM220:204 
   f_113:
VM220:205       Before: 12.5
VM220:206       After:  7.1 (Δ -5.400000)
VM220:204 
   j_115:
VM220:205       Before: 0.9
VM220:206       After:  0.90 (Δ 0.000000)
VM220:204 
   j_32:
VM220:205       Before: 1831292.39334576
VM220:206       After:  1666869.2295768731 (Δ -164423.163769)
VM220:213       ⚠️  ENERGY CONSUMPTION CHANGED!
VM220:204 
   h_10:
VM220:205       Before: 163.99143846563624
VM220:206       After:  149.2674155616435 (Δ -14.724023)
VM220:210       ⚠️  SYMPTOM FIELD CHANGED!
VM220:204 
   fieldLocks.f_113_disabled:
VM220:205       Before: false
VM220:206       After:  true
undefined
ReferenceToggle.js:117 [ReferenceToggle] Found 15 dual-state sections: (15) ['sect02', 'sect03', 'sect04', 'sect05', 'sect06', 'sect07', 'sect08', 'sect09', 'sect10', 'sect11', 'sect12', 'sect13', 'sect14', 'sect15', 'sect16']
Section02.js:1906 [S02] Switched to TARGET mode
Section02.js:1964 [S02] Refreshing UI for TARGET mode
Section02.js:2022 [S02] Updated h_12 (reporting year) slider = "2023" (target mode)
Section02.js:2039 [S02] Updated h_13 (service life) slider = "50" (target mode)
 [S02] Updated h_15 = "11,167.00" (target mode)
 [S02] Updated i_17 = "XXXX" (target mode)
 [S02] Updated l_12 = "$0.1300" (target mode)
 [S02] Updated l_13 = "$0.5070" (target mode)
 [S02] Updated l_14 = "$1.6200" (target mode)
 [S02] Updated l_15 = "$180.00" (target mode)
 [S02] Updated l_16 = "$1.5000" (target mode)
 Section03: Province selected: ON
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 City dropdown updated for ON - selected: Milton
 S05: Switched to TARGET mode
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 S06: Switched to TARGET mode
 🔄 [S06] updateCalculatedDisplayValues: mode=target
 🔄 [S06] updateCalculatedDisplayValues: mode=target
 🔄 [S07] switchMode: Switching from "reference" to "target"
 🔄 [S07] refreshUI: Starting refresh for mode=target
 🔍 [S07] refreshUI: fieldId=d_49, storedValue=User Defined, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
 📋 [S07] refreshUI: fieldId=d_49, default=User Defined, valueToShow=User Defined, elementType=SELECT
 🔽 [S07] refreshUI: Setting dropdown d_49 from "User Defined" to "User Defined" (mode=target)
 🔽 [S07] refreshUI: Dropdown d_49 now shows "User Defined"
 🔍 [S07] refreshUI: fieldId=e_49, storedValue=15, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_49
 ✅ [S07] getFieldDefault: Found default for e_49 = "40.00"
 📋 [S07] refreshUI: fieldId=e_49, default=40.00, valueToShow=15, elementType=TD
 ✏️ [S07] refreshUI: Setting contenteditable e_49 = "15"
 🔍 [S07] refreshUI: fieldId=h_49, storedValue=15, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=h_49
 ✅ [S07] getFieldDefault: Found default for h_49 = "40.00"
 📋 [S07] refreshUI: fieldId=h_49, default=40.00, valueToShow=15, elementType=TD
 🔍 [S07] refreshUI: fieldId=i_49, storedValue=13140000, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=i_49
 ✅ [S07] getFieldDefault: Found default for i_49 = "1,839,600"
 📋 [S07] refreshUI: fieldId=i_49, default=1,839,600, valueToShow=13140000, elementType=TD
 🔍 [S07] refreshUI: fieldId=k_49, storedValue=null, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_49
 ✅ [S07] getFieldDefault: Found default for k_49 = "0.00"
 📋 [S07] refreshUI: fieldId=k_49, default=0.00, valueToShow=0.00, elementType=TD
 🔍 [S07] refreshUI: fieldId=m_49, storedValue=38%, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=m_49
 ✅ [S07] getFieldDefault: Found default for m_49 = "15%"
 📋 [S07] refreshUI: fieldId=m_49, default=15%, valueToShow=38%, elementType=TD
 🔍 [S07] refreshUI: fieldId=n_49, storedValue=✓, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=n_49
 ✅ [S07] getFieldDefault: Found default for n_49 = "✓"
 📋 [S07] refreshUI: fieldId=n_49, default=✓, valueToShow=✓, elementType=TD
 🔍 [S07] refreshUI: fieldId=e_50, storedValue=10000, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_50
 ✅ [S07] getFieldDefault: Found default for e_50 = "10,000.00"
 📋 [S07] refreshUI: fieldId=e_50, default=10,000.00, valueToShow=10000, elementType=TD
 ✏️ [S07] refreshUI: Setting contenteditable e_50 = "10000"
 🔍 [S07] refreshUI: fieldId=h_50, storedValue=6, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=h_50
 ✅ [S07] getFieldDefault: Found default for h_50 = "16.00"
 📋 [S07] refreshUI: fieldId=h_50, default=16.00, valueToShow=6, elementType=TD
 🔍 [S07] refreshUI: fieldId=i_50, storedValue=5256000, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=i_50
 ✅ [S07] getFieldDefault: Found default for i_50 = "735,840"
 📋 [S07] refreshUI: fieldId=i_50, default=735,840, valueToShow=5256000, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_50, storedValue=274888.8, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=j_50
 ✅ [S07] getFieldDefault: Found default for j_50 = "38,484.43"
 📋 [S07] refreshUI: fieldId=j_50, default=38,484.43, valueToShow=274888.8, elementType=TD
 🔍 [S07] refreshUI: fieldId=m_50, storedValue=38%, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=m_50
 ✅ [S07] getFieldDefault: Found default for m_50 = "15%"
 📋 [S07] refreshUI: fieldId=m_50, default=15%, valueToShow=38%, elementType=TD
 🔍 [S07] refreshUI: fieldId=n_50, storedValue=✓, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=n_50
 ✅ [S07] getFieldDefault: Found default for n_50 = "✓"
 📋 [S07] refreshUI: fieldId=n_50, default=✓, valueToShow=✓, elementType=TD
 🔍 [S07] refreshUI: fieldId=d_51, storedValue=Heatpump, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_51
 ✅ [S07] getFieldDefault: Found default for d_51 = "Heatpump"
 📋 [S07] refreshUI: fieldId=d_51, default=Heatpump, valueToShow=Heatpump, elementType=SELECT
 🔽 [S07] refreshUI: Setting dropdown d_51 from "Gas" to "Heatpump" (mode=target)
 🔽 [S07] refreshUI: Dropdown d_51 now shows "Heatpump"
 🔍 [S07] refreshUI: fieldId=e_51, storedValue=null, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_51
 ✅ [S07] getFieldDefault: Found default for e_51 = "0.00"
 📋 [S07] refreshUI: fieldId=e_51, default=0.00, valueToShow=0.00, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_51, storedValue=91629.59999999999, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=j_51
 ✅ [S07] getFieldDefault: Found default for j_51 = "12,828.14"
 📋 [S07] refreshUI: fieldId=j_51, default=12,828.14, valueToShow=91629.59999999999, elementType=TD
 🔍 [S07] refreshUI: fieldId=k_51, storedValue=91629.59999999999, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_51
 ✅ [S07] getFieldDefault: Found default for k_51 = "12,828.14"
 📋 [S07] refreshUI: fieldId=k_51, default=12,828.14, valueToShow=91629.59999999999, elementType=TD
 🔍 [S07] refreshUI: fieldId=d_52, storedValue=300, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_52
 ✅ [S07] getFieldDefault: Found default for d_52 = "300"
 📋 [S07] refreshUI: fieldId=d_52, default=300, valueToShow=300, elementType=range
 🎚️ [S07] refreshUI: Setting slider d_52 = "300"
 🎚️ [S07] refreshUI: Updating d_52 slider range for system="Heatpump"
 🎚️ [S07] refreshUI: d_52 slider range updated to min=100, max=450, step=10
 🔍 [S07] refreshUI: fieldId=e_52, storedValue=3, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_52
 ✅ [S07] getFieldDefault: Found default for e_52 = "3.00"
 📋 [S07] refreshUI: fieldId=e_52, default=3.00, valueToShow=3, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_52, storedValue=91629.59999999999, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=j_52
 ✅ [S07] getFieldDefault: Found default for j_52 = "12,828.14"
 📋 [S07] refreshUI: fieldId=j_52, default=12,828.14, valueToShow=91629.59999999999, elementType=TD
 🔍 [S07] refreshUI: fieldId=k_52, storedValue=0.94, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_52
 ✅ [S07] getFieldDefault: Found default for k_52 = "0.90"
 📋 [S07] refreshUI: fieldId=k_52, default=0.90, valueToShow=0.94, elementType=TD
 ✏️ [S07] refreshUI: Setting contenteditable k_52 = "0.94"
 🔍 [S07] refreshUI: fieldId=m_52, storedValue=333%, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=m_52
 ✅ [S07] getFieldDefault: Found default for m_52 = "100%"
 📋 [S07] refreshUI: fieldId=m_52, default=100%, valueToShow=333%, elementType=TD
 🔍 [S07] refreshUI: fieldId=n_52, storedValue=✓, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=n_52
 ✅ [S07] getFieldDefault: Found default for n_52 = "✓"
 📋 [S07] refreshUI: fieldId=n_52, default=✓, valueToShow=✓, elementType=TD
 🔍 [S07] refreshUI: fieldId=d_53, storedValue=0, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_53
 ✅ [S07] getFieldDefault: Found default for d_53 = "0"
 📋 [S07] refreshUI: fieldId=d_53, default=0, valueToShow=0, elementType=range
 🎚️ [S07] refreshUI: Setting slider d_53 = "0"
 🔍 [S07] refreshUI: fieldId=e_53, storedValue=null, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_53
 ✅ [S07] getFieldDefault: Found default for e_53 = "0.00"
 📋 [S07] refreshUI: fieldId=e_53, default=0.00, valueToShow=0.00, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_53, storedValue=91629.59999999999, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=j_53
 ✅ [S07] getFieldDefault: Found default for j_53 = "12,828.14"
 📋 [S07] refreshUI: fieldId=j_53, default=12,828.14, valueToShow=91629.59999999999, elementType=TD
 🔍 [S07] refreshUI: fieldId=m_53, storedValue=N/A, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=m_53
 ✅ [S07] getFieldDefault: Found default for m_53 = "0%"
 📋 [S07] refreshUI: fieldId=m_53, default=0%, valueToShow=N/A, elementType=TD
 🔍 [S07] refreshUI: fieldId=n_53, storedValue=✓, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=n_53
 ✅ [S07] getFieldDefault: Found default for n_53 = "✓"
 📋 [S07] refreshUI: fieldId=n_53, default=✓, valueToShow=✓, elementType=TD
 🔍 [S07] refreshUI: fieldId=d_54, storedValue=null, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_54
 ✅ [S07] getFieldDefault: Found default for d_54 = "0.00"
 📋 [S07] refreshUI: fieldId=d_54, default=0.00, valueToShow=0.00, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_54, storedValue=null, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=j_54
 ✅ [S07] getFieldDefault: Found default for j_54 = "0.00"
 📋 [S07] refreshUI: fieldId=j_54, default=0.00, valueToShow=0.00, elementType=TD
 🔍 [S07] refreshUI: fieldId=k_54, storedValue=null, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_54
 ✅ [S07] getFieldDefault: Found default for k_54 = "0.00"
Section07.js:243 📋 [S07] refreshUI: fieldId=k_54, default=0.00, valueToShow=0.00, elementType=TD
Section07.js:323 ✅ [S07] refreshUI: Completed refresh for mode=target
Section07.js:187 ✅ [S07] switchMode: Switch to "target" completed
Section08.js:133 S08: Switched to TARGET mode.
Section09.js:258 S09: Switched to TARGET mode
Section09.js:419 S09: UI refreshed for target mode
Section09.js:494 [S09] Updated calculated display values for target mode
Section09.js:494 [S09] Updated calculated display values for target mode
Section10.js:307 [S10 DEBUG] Mode switch: reference → TARGET
Section10.js:313 [S10 DEBUG] Calling updateCalculatedDisplayValues() for target mode
Section11.js:428 S11: Switched to TARGET mode
Section11.js:2055 [S11 Area Sync] Starting sync in target mode
Section11.js:2101 [S11 Area Sync] d_88 = 0 (from d_73)
Section11.js:2101 [S11 Area Sync] d_89 = 914 (from d_74)
Section11.js:2101 [S11 Area Sync] d_90 = 846 (from d_75)
Section11.js:2101 [S11 Area Sync] d_91 = 845 (from d_76)
Section11.js:2101 [S11 Area Sync] d_92 = 120 (from d_77)
Section11.js:2101 [S11 Area Sync] d_93 = 0 (from d_78)
Section11.js:2113 [S11 Area Sync] Refreshing UI...
Section11.js:2117 [S11 Area Sync] Triggering recalculation...
Section11.js:2902 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:2341 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2341 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2413 [S11] REF TB%=50% → ref_i_97=533753.63, ref_k_97=15816.51
Section11.js:2597 [S11] Writing ref penalty: ref_i_97=533753.63, ref_k_97=15816.51
Section11.js:2346 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2346 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2120 [S11 Area Sync] Sync completed successfully
Section12.js:230 S12: Switched to TARGET mode
Section12.js:354 [Section12] Calculated display values updated for target mode
Section12.js:354 [Section12] Calculated display values updated for target mode
Section13.js:400 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
Section13.js:409 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
Section13.js:400 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
Section13.js:407 [S13 updateCalc] ✅ Added j_116 to fieldFormats
Section13.js:400 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
Section13.js:407 [S13 updateCalc] ✅ Added j_116 to fieldFormats
Section14.js:127 S14: Switched to TARGET mode
ReferenceToggle.js:205 Uncaught TypeError: Cannot set properties of undefined (setting 'textContent')
    at updateKeyValuesToggleUI (ReferenceToggle.js:205:34)
    at switchAllSectionsMode (ReferenceToggle.js:176:5)
    at Object.switchMode (ReferenceToggle.js:224:5)
    at HTMLDivElement.<anonymous> (Section01.js:1346:37)
updateKeyValuesToggleUI @ ReferenceToggle.js:205
switchAllSectionsMode @ ReferenceToggle.js:176
switchMode @ ReferenceToggle.js:224
(anonymous) @ Section01.js:1346Understand this errorAI
captureSnapshot("After Target Toggle")
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 📸 SNAPSHOT: After Target Toggle
 ⏱️  Time: 11:12:00 AM
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
🎛️  HEATING SYSTEM SELECTOR:
    d_113 (Target):     Heatpump
VM220:161    ref_d_113 (Ref):    Gas
VM220:162    S13 Mode:           target
VM220:164 
⚡ EFFICIENCY FIELDS:
VM220:165    f_113 (HSPF - Target):    12.5
VM220:166    ref_f_113 (HSPF - Ref):   7.1
VM220:167    j_115 (AFUE - Target):    0.9
VM220:168    ref_j_115 (AFUE - Ref):   0.90
VM220:170 
🔢 CALCULATED EFFICIENCY:
VM220:171    h_113 (COPheat - Target): 3.663540445486518
VM220:172    ref_h_113 (COPheat - Ref):1
VM220:174 
🔥 ENERGY CONSUMPTION (j_32):
VM220:175    Target:  1666869.2295768731
VM220:176    Ref:     8631977.970393535
VM220:178 
🌍 CARBON INTENSITY (h_10 - THE SYMPTOM):
VM220:179    Target:  149.2674155616435
VM220:180    Ref:     null
VM220:182 
🔒 FIELD LOCK STATES:
VM220:183    f_113 editable:  NO_CONTENTEDITABLE
VM220:184    f_113 disabled:  false
VM220:185    j_115 editable:  NO_CONTENTEDITABLE
VM220:186    j_115 disabled:  NO_INPUT
VM220:198 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VM220:199 🔍 CHANGES: After Reference Toggle → After Target Toggle
VM220:200 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VM220:204 
   d_113:
VM220:205       Before: Gas
VM220:206       After:  Heatpump (Δ N/A)
VM220:216       🎛️  SYSTEM TYPE CHANGED!
VM220:204 
   f_113:
VM220:205       Before: 7.1
VM220:206       After:  12.5 (Δ 5.400000)
VM220:204 
   j_115:
VM220:205       Before: 0.90
VM220:206       After:  0.9 (Δ 0.000000)
VM220:204 
   fieldLocks.f_113_disabled:
VM220:205       Before: true
VM220:206       After:  false
undefined
stopDiagnostic()
VM220:225 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VM220:226 🔬 PATTERN ANALYSIS
VM220:227 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VM220:229 
Total snapshots: 3
VM220:235 
🌍 h_10 (GHGI) Oscillation Pattern:
VM220:236    Unique values: 163.99143846563624, 149.2674155616435
VM220:238    ⚠️  OSCILLATION DETECTED! Switching between 2 values.
VM220:242 
⚡ Efficiency Field Usage Pattern:
VM220:247    [0] Initial State:
VM220:248       d_113=Heatpump, h_113=3.663540445486518 → Using HSPF (f_113)
VM220:247    [1] After Reference Toggle:
VM220:248       d_113=Gas, h_113=3.663540445486518 → Using HSPF (f_113)
VM220:247    [2] After Target Toggle:
VM220:248       d_113=Heatpump, h_113=3.663540445486518 → Using HSPF (f_113)
VM220:296 
✅ Diagnostic stopped. 3 snapshots captured.
VM220:297 
To review a specific snapshot: window.TEUI_DIAGNOSTIC.printSnapshot(window.TEUI_DIAGNOSTIC.snapshots[INDEX])
VM220:298 To compare two snapshots: window.TEUI_DIAGNOSTIC.printComparison(window.TEUI_DIAGNOSTIC.compareSnapshots(snapshots[0], snapshots[1]))
undefined