 Console was cleared
 ==================================================
 RESET DIAGNOSTICS - FULL SUITE
 ==================================================

 === DIAGNOSTIC 1: Check lastImportedState ===
 ✅ Found 249 fields in lastImportedState
 First 10 fields: (10) ['d_12', 'd_13', 'd_14', 'd_15', 'h_12', 'h_13', 'h_14', 'h_15', 'i_16', 'i_17']
 Last 10 fields: (10) ['ref_f_113', 'ref_j_115', 'ref_d_116', 'ref_d_118', 'ref_g_118', 'ref_l_118', 'ref_d_119', 'ref_l_119', 'ref_k_120', 'ref_d_142']
 
Key TEUI fields in lastImportedState:
   h_15: 11167
   d_27: 2000299
   d_28: 355013
   d_29: 0
   d_30: 0
   d_31: 0
 
=== DIAGNOSTIC 2: Check StateManager ===
 ✅ StateManager has 1025 total fields
 Field states:
   imported: 196
   user-modified: 12
VM2839:84   default: 46
VM2839:85   calculated: 771
VM2839:89 
Key TEUI fields in StateManager:
VM2839:93   h_15: 11167 (state: imported)
VM2839:93   d_27: 2000299 (state: imported)
VM2839:93   d_28: 355013 (state: imported)
VM2839:93   d_29: 0 (state: imported)
VM2839:93   d_30: 0 (state: imported)
VM2839:93   d_31: 0 (state: imported)
VM2839:98 
Reset Tier: 2 (0=defaults, 1=modified, 2=has import)
VM2839:105 
=== DIAGNOSTIC 3: Check TEUI Calculation Fields ===
VM2839:140 TEUI Field Values:
VM2839:145   h_15 (Conditioned Area (m²)): 11167 [imported]
VM2839:145   d_27 (Actual Elec Use (kWh)): 2000299 [imported]
VM2839:145   d_28 (Actual Gas Use (m³)): 355013 [imported]
VM2839:145   d_29 (Actual Propane Use (L)): 0 [imported]
VM2839:145   d_30 (Actual Oil Use (L)): 0 [imported]
VM2839:145   d_31 (Actual Wood Use (kg)): 0 [imported]
VM2839:145   d_44 (PV kWh/yr): 0 [imported]
VM2839:145   d_45 (Wind kWh/yr): 0 [imported]
VM2839:145   d_46 (Remove EV Charging kWh/yr): 0 [imported]
VM2839:145   h_121 (Heating ekWh/yr): null [unknown]
VM2839:145   h_122 (Cooling ekWh/yr): null [unknown]
VM2839:145   h_123 (DHW ekWh/yr): null [unknown]
VM2839:145   h_124 (Vent ekWh/yr): 36856.76907942541 [calculated]
VM2839:145   h_125 (Lighting ekWh/yr): null [unknown]
VM2839:145   h_126 (Plug ekWh/yr): 83.50 [calculated]
VM2839:145   f_32 (TEUI Target (ekWh/m²/yr)): 5678628.43315522 [calculated]
VM2839:145   j_32 (TEUI Actual (ekWh/m²/yr)): 5710470.347823744 [calculated]
VM2839:160 
Manual TEUI Calculation:
VM2839:161   Total ekWh: 36940.27
VM2839:162   Area: 11167.00 m²
VM2839:163   Expected TEUI: 3.31 ekWh/m²/yr
VM2839:164   Actual f_32: 5678628.43315522
VM2839:167 ⚠️ MISMATCH! Expected 3.31 but got 5678628.43315522
diagnostic3_checkTEUIFields @ VM2839:167
runAllDiagnostics @ VM2839:316
(anonymous) @ VM2850:1
VM2839:175 
=== DIAGNOSTIC 4: Compare lastImportedState vs StateManager ===
VM2839:186 Checking 249 imported fields against current StateManager...
VM2839:211 Results:
VM2839:212   ✅ Match: 249
VM2839:213   ⚠️ Mismatch: 0
VM2839:214   ❌ Missing: 0
VM2839:319 
==================================================
VM2839:320 SUMMARY
VM2839:321 ==================================================
VM2839:322 Run diagnostic5_traceRevert() to instrument the revert function
VM2839:323 Then trigger 'Undo Changes' and check console for detailed execution trace
{matchCount: 249, mismatchCount: 0, missingCount: 0, mismatches: Array(0)}
+++++
 Console was cleared
 ==================================================
 RESET DIAGNOSTICS - FULL SUITE
 ==================================================

 === DIAGNOSTIC 1: Check lastImportedState ===
 ✅ Found 249 fields in lastImportedState
 First 10 fields: (10) ['d_12', 'd_13', 'd_14', 'd_15', 'h_12', 'h_13', 'h_14', 'h_15', 'i_16', 'i_17']
 Last 10 fields: (10) ['ref_f_113', 'ref_j_115', 'ref_d_116', 'ref_d_118', 'ref_g_118', 'ref_l_118', 'ref_d_119', 'ref_l_119', 'ref_k_120', 'ref_d_142']
 
Key TEUI fields in lastImportedState:
   h_15: 11167
   d_27: 2000299
   d_28: 355013
   d_29: 0
   d_30: 0
   d_31: 0
 
=== DIAGNOSTIC 2: Check StateManager ===
 ✅ StateManager has 1025 total fields
 Field states:
   imported: 190
   user-modified: 17
   default: 46
   calculated: 771
 
Key TEUI fields in StateManager:
   h_15: 11167 (state: imported)
   d_27: 2000299 (state: imported)
   d_28: 355013 (state: imported)
   d_29: 0 (state: imported)
   d_30: 0 (state: imported)
VM2839:93   d_31: 0 (state: imported)
VM2839:98 
Reset Tier: 2 (0=defaults, 1=modified, 2=has import)
VM2839:105 
=== DIAGNOSTIC 3: Check TEUI Calculation Fields ===
VM2839:140 TEUI Field Values:
VM2839:145   h_15 (Conditioned Area (m²)): 11167 [imported]
VM2839:145   d_27 (Actual Elec Use (kWh)): 2000299 [imported]
VM2839:145   d_28 (Actual Gas Use (m³)): 355013 [imported]
VM2839:145   d_29 (Actual Propane Use (L)): 0 [imported]
VM2839:145   d_30 (Actual Oil Use (L)): 0 [imported]
VM2839:145   d_31 (Actual Wood Use (kg)): 0 [imported]
VM2839:145   d_44 (PV kWh/yr): 0 [imported]
VM2839:145   d_45 (Wind kWh/yr): 0 [imported]
VM2839:145   d_46 (Remove EV Charging kWh/yr): 0 [imported]
VM2839:145   h_121 (Heating ekWh/yr): null [unknown]
VM2839:145   h_122 (Cooling ekWh/yr): null [unknown]
VM2839:145   h_123 (DHW ekWh/yr): null [unknown]
VM2839:145   h_124 (Vent ekWh/yr): 36856.76907942541 [calculated]
VM2839:145   h_125 (Lighting ekWh/yr): null [unknown]
VM2839:145   h_126 (Plug ekWh/yr): 83.50 [calculated]
VM2839:145   f_32 (TEUI Target (ekWh/m²/yr)): 5678628.43315522 [calculated]
VM2839:145   j_32 (TEUI Actual (ekWh/m²/yr)): 2616915.391109799 [calculated]
VM2839:160 
Manual TEUI Calculation:
VM2839:161   Total ekWh: 36940.27
VM2839:162   Area: 11167.00 m²
VM2839:163   Expected TEUI: 3.31 ekWh/m²/yr
VM2839:164   Actual f_32: 5678628.43315522
VM2839:167 ⚠️ MISMATCH! Expected 3.31 but got 5678628.43315522
diagnostic3_checkTEUIFields @ VM2839:167
runAllDiagnostics @ VM2839:316
(anonymous) @ VM2874:1
VM2839:175 
=== DIAGNOSTIC 4: Compare lastImportedState vs StateManager ===
VM2839:186 Checking 249 imported fields against current StateManager...
VM2839:211 Results:
VM2839:212   ✅ Match: 242
VM2839:213   ⚠️ Mismatch: 7
VM2839:214   ❌ Missing: 0
VM2839:217 
First 10 mismatches:
VM2839:219   d_12: imported=A-Assembly, current=B3-Detention Care & Treatment
VM2839:219   h_19: imported=Milton, current=Milverton
VM2839:219   d_51: imported=Gas, current=Heatpump
VM2839:219   d_52: imported=94, current=250
VM2839:219   d_113: imported=Gas, current=Heatpump
VM2839:219   d_118: imported=5, current=40
VM2839:219   ref_d_52: imported=90, current=94
VM2839:319 
==================================================
VM2839:320 SUMMARY
VM2839:321 ==================================================
VM2839:322 Run diagnostic5_traceRevert() to instrument the revert function
VM2839:323 Then trigger 'Undo Changes' and check console for detailed execution trace
{matchCount: 242, mismatchCount: 7, missingCount: 0, mismatches: Array(7)}
+++++
VM2839:309 Console was cleared
VM2839:310 ==================================================
VM2839:311 RESET DIAGNOSTICS - FULL SUITE
VM2839:312 ==================================================

VM2839:18 === DIAGNOSTIC 1: Check lastImportedState ===
VM2839:31 ✅ Found 249 fields in lastImportedState
VM2839:32 First 10 fields: (10) ['d_12', 'd_13', 'd_14', 'd_15', 'h_12', 'h_13', 'h_14', 'h_15', 'i_16', 'i_17']
VM2839:33 Last 10 fields: (10) ['ref_f_113', 'ref_j_115', 'ref_d_116', 'ref_d_118', 'ref_g_118', 'ref_l_118', 'ref_d_119', 'ref_l_119', 'ref_k_120', 'ref_d_142']
VM2839:37 
Key TEUI fields in lastImportedState:
VM2839:40   h_15: 11167
VM2839:40   d_27: 2000299
VM2839:40   d_28: 355013
VM2839:40   d_29: 0
VM2839:40   d_30: 0
VM2839:40   d_31: 0
VM2839:53 
=== DIAGNOSTIC 2: Check StateManager ===
VM2839:61 ✅ StateManager has 1025 total fields
VM2839:81 Field states:
VM2839:82   imported: 190
VM2839:83   user-modified: 17
VM2839:84   default: 46
VM2839:85   calculated: 771
VM2839:89 
Key TEUI fields in StateManager:
VM2839:93   h_15: 11167 (state: imported)
VM2839:93   d_27: 2000299 (state: imported)
VM2839:93   d_28: 355013 (state: imported)
VM2839:93   d_29: 0 (state: imported)
VM2839:93   d_30: 0 (state: imported)
VM2839:93   d_31: 0 (state: imported)
VM2839:98 
Reset Tier: 2 (0=defaults, 1=modified, 2=has import)
VM2839:105 
=== DIAGNOSTIC 3: Check TEUI Calculation Fields ===
VM2839:140 TEUI Field Values:
VM2839:145   h_15 (Conditioned Area (m²)): 11167 [imported]
VM2839:145   d_27 (Actual Elec Use (kWh)): 2000299 [imported]
VM2839:145   d_28 (Actual Gas Use (m³)): 355013 [imported]
VM2839:145   d_29 (Actual Propane Use (L)): 0 [imported]
VM2839:145   d_30 (Actual Oil Use (L)): 0 [imported]
VM2839:145   d_31 (Actual Wood Use (kg)): 0 [imported]
VM2839:145   d_44 (PV kWh/yr): 0 [imported]
VM2839:145   d_45 (Wind kWh/yr): 0 [imported]
VM2839:145   d_46 (Remove EV Charging kWh/yr): 0 [imported]
VM2839:145   h_121 (Heating ekWh/yr): null [unknown]
VM2839:145   h_122 (Cooling ekWh/yr): null [unknown]
VM2839:145   h_123 (DHW ekWh/yr): null [unknown]
VM2839:145   h_124 (Vent ekWh/yr): 36856.76907942541 [calculated]
VM2839:145   h_125 (Lighting ekWh/yr): null [unknown]
VM2839:145   h_126 (Plug ekWh/yr): 83.50 [calculated]
VM2839:145   f_32 (TEUI Target (ekWh/m²/yr)): 5678628.43315522 [calculated]
VM2839:145   j_32 (TEUI Actual (ekWh/m²/yr)): 2616915.391109799 [calculated]
VM2839:160 
Manual TEUI Calculation:
VM2839:161   Total ekWh: 36940.27
VM2839:162   Area: 11167.00 m²
VM2839:163   Expected TEUI: 3.31 ekWh/m²/yr
VM2839:164   Actual f_32: 5678628.43315522
VM2839:167 ⚠️ MISMATCH! Expected 3.31 but got 5678628.43315522
diagnostic3_checkTEUIFields @ VM2839:167
runAllDiagnostics @ VM2839:316
(anonymous) @ VM2874:1
VM2839:175 
=== DIAGNOSTIC 4: Compare lastImportedState vs StateManager ===
VM2839:186 Checking 249 imported fields against current StateManager...
VM2839:211 Results:
VM2839:212   ✅ Match: 242
VM2839:213   ⚠️ Mismatch: 7
VM2839:214   ❌ Missing: 0
VM2839:217 
First 10 mismatches:
VM2839:219   d_12: imported=A-Assembly, current=B3-Detention Care & Treatment
VM2839:219   h_19: imported=Milton, current=Milverton
VM2839:219   d_51: imported=Gas, current=Heatpump
VM2839:219   d_52: imported=94, current=250
VM2839:219   d_113: imported=Gas, current=Heatpump
VM2839:219   d_118: imported=5, current=40
VM2839:219   ref_d_52: imported=90, current=94
VM2839:319 
==================================================
VM2839:320 SUMMARY
VM2839:321 ==================================================
VM2839:322 Run diagnostic5_traceRevert() to instrument the revert function
VM2839:323 Then trigger 'Undo Changes' and check console for detailed execution trace
{matchCount: 242, mismatchCount: 7, missingCount: 0, mismatches: Array(7)}
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 S10: Target listener triggered by i_97, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateThermalBridgePenalty @ Section11.js:1608
calculateTargetModel @ Section11.js:1938
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateThermalBridgePenalty @ Section11.js:1608
calculateTargetModel @ Section11.js:1938
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateThermalBridgePenalty @ Section11.js:1608
calculateTargetModel @ Section11.js:1938
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateThermalBridgePenalty @ Section11.js:1608
calculateTargetModel @ Section11.js:1938
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateThermalBridgePenalty @ Section11.js:1608
calculateTargetModel @ Section11.js:1938
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateThermalBridgePenalty @ Section11.js:1608
calculateTargetModel @ Section11.js:1938
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateThermalBridgePenalty @ Section11.js:1608
calculateTargetModel @ Section11.js:1938
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateThermalBridgePenalty @ Section11.js:1608
calculateTargetModel @ Section11.js:1938
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section10.js:1963 [S10 DEBUG] Dual-engine calculations complete in target mode
Section10.js:2888 S10: Target listener triggered by i_98, recalculating all.
Section10.js:1955 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateTargetModel @ Section11.js:1950
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateTargetModel @ Section11.js:1950
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateTargetModel @ Section11.js:1950
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateTargetModel @ Section11.js:1950
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateTargetModel @ Section11.js:1950
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateTargetModel @ Section11.js:1950
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateTargetModel @ Section11.js:1950
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateTargetModel @ Section11.js:1950
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:240
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateTargetModel @ Section03.js:1785
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section10.js:1963 [S10 DEBUG] Dual-engine calculations complete in target mode
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section03.js:1944 [S03] Target CALCULATED results stored (setpoints + derived values only - climate data already published)
Section12.js:1667 [S12] U-agg TGT: TB%=30 → g_101=0.676346, g_102=0.371429
Section12.js:1948 [S12] 🎯 TGT CLIMATE READ: d_20=4200, d_21=0
Section12.js:2026 [S12DB] TGT CLIMATE: d_20=4200, d_21=0, d_22=1960, h_22=-1680
Section12.js:2050 [S12DB] TGT h_101 calc: (4200*0.6763455491781712*24)/1000 = 68.17563135715966
Section12.js:2053 [S12DB] TGT i_101 result: 68.17563135715966 * 16633 = 1133965.2763636366
 [S12DB] TGT g_104 calc: (0.6763455491781712*16633 + 0.37142857142857144*11168)/27801.000001 = 0.5538566887752582
 [S12DB] TGT ROW104: i_101=1133965.2763636366, i_102=195127.296, i_103=652032.9037894738 → i_104=1981125.4761531106
 [S12DB] TGT ROW104: h_21="Capacitance", k_98=-64327.68 → k_104=-64327.68
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1930
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateTargetModel @ Section03.js:1804
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1930
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateTargetModel @ Section03.js:1804
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1930
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateTargetModel @ Section03.js:1804
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1930
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateTargetModel @ Section03.js:1804
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1930
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateTargetModel @ Section03.js:1804
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1930
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateTargetModel @ Section03.js:1804
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1930
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateTargetModel @ Section03.js:1804
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1930
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateTargetModel @ Section03.js:1804
calculateAll @ Section03.js:1744
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Section12] Calculated display values updated for target mode
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section03.js:1914 [S03] Reference CALCULATED results stored (climate data + setpoints - INPUT fields excluded)
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S03] Target CALCULATED results stored (setpoints + derived values only - climate data already published)
 [S12] U-agg TGT: TB%=30 → g_101=0.676346, g_102=0.371429
 [S12] 🎯 TGT CLIMATE READ: d_20=4200, d_21=0
 [S12DB] TGT CLIMATE: d_20=4200, d_21=0, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4200*0.6763455491781712*24)/1000 = 68.17563135715966
 [S12DB] TGT i_101 result: 68.17563135715966 * 16633 = 1133965.2763636366
 [S12DB] TGT g_104 calc: (0.6763455491781712*16633 + 0.37142857142857144*11168)/27801.000001 = 0.5538566887752582
 [S12DB] TGT ROW104: i_101=1133965.2763636366, i_102=195127.296, i_103=652032.9037894738 → i_104=1981125.4761531106
 [S12DB] TGT ROW104: h_21="Capacitance", k_98=-64327.68 → k_104=-64327.68
 [Section12] Calculated display values updated for target mode
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=533766.70, ref_k_97=15810.91
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2342
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [S03] Reference CALCULATED results stored (climate data + setpoints - INPUT fields excluded)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 S10: Target listener triggered by i_71, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section10.js:1963 [S10 DEBUG] Dual-engine calculations complete in target mode
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1945
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1945
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1945
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1945
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1945
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1945
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1945
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1945
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
 [S09] Updated calculated display values for target mode
 [S09] Updated calculated display values for target mode
 [S09] Updated calculated display values for target mode
 S05: Reference standard changed, reloading defaults
 S05: Reference defaults loaded from standard: OBC SB10 5.5-6 Z5 (2010)
 S06: Reference standard changed, reloading defaults
 S06: Reference defaults loaded from standard: OBC SB10 5.5-6 Z5 (2010)
 S09: Reference values updated for standard: OBC SB10 5.5-6 Z5 (2010), lighting: 2.0
 [S09] Updated calculated display values for target mode
 S09: Reference values updated for standard: OBC SB10 5.5-6 Z5 (2010), lighting: 2.0
 [S09] Updated calculated display values for target mode
 S09: Reference values updated for standard: OBC SB10 5.5-6 Z5 (2010), lighting: 2.0
 [S09] Updated calculated display values for target mode
 S11: Reference standard changed, reloading defaults
 [S11 REF DEFAULTS] Published ref_d_85=1411.52 to StateManager
 [S11 REF DEFAULTS] Published ref_d_86=712.97 to StateManager
 [S11 REF DEFAULTS] Published ref_d_87=0.00 to StateManager
 [S11 REF DEFAULTS] Published ref_d_94=0.00 to StateManager
 [S11 REF DEFAULTS] Published ref_d_95=1100.42 to StateManager
 [S11 REF DEFAULTS] Published ref_d_96=29.70 to StateManager
 [S11] Listener: ref_d_97 changed → recalculating (src=default)
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=28102.75, ref_k_97=-1003.33
 S10: Reference listener triggered by ref_i_98, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=28102.75, ref_k_97=-1003.33
Section10.js:2897 S10: Reference listener triggered by ref_i_97, recalculating all.
Section10.js:1955 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
Section10.js:1963 [S10 DEBUG] Dual-engine calculations complete in target mode
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1389445.23 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=28102.75, ref_k_97=-1003.33
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=28102.75, ref_k_97=-1003.33
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2307 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=28102.75, ref_k_97=-1003.33
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=28102.75, ref_k_97=-1003.33
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2307 [S11] Listener: ref_d_97 changed → recalculating (src=default)
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=28102.75, ref_k_97=-1003.33
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=28102.75, ref_k_97=-1003.33
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:272 [S11 REF DEFAULTS] Published ref_d_97=50 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_f_85=5.3 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_f_86=4.1 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_f_87=6.6 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_f_94=1.8 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_f_95=3.5 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_g_88=1.99 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_g_89=2.56 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_g_90=2.56 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_g_91=2.56 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_g_92=2.56 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_g_93=2.56 to StateManager
Section11.js:279 S11: Reference defaults loaded from standard: OBC SB10 5.5-6 Z5 (2010)
Section11.js:310 S11: Reference standard updated, areas preserved, performance values updated
Section14.js:1457 [Section14] d_13 changed - updating reference indicators
Section14.js:85 S14: Reference standard changed, reloading defaults
Section14.js:79 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z5 (2010)
Section14.js:1457 [Section14] d_13 changed - updating reference indicators
Section05.js:1211 [S05→S02] Updated d_16 = 650 based on d_15 = Self Reported
Section05.js:1211 [S05→S02] Updated d_16 = 650 based on d_15 = Self Reported
Section03.js:1187 Section03: Province selected: ON
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section03.js:1248 City dropdown updated for ON - selected: Milverton
Section03.js:1187 Section03: Province selected: ON
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section03.js:1248 City dropdown updated for ON - selected: Milverton
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section09.js:456 [S09] Updated calculated display values for target mode
Section09.js:456 [S09] Updated calculated display values for target mode
Section09.js:456 [S09] Updated calculated display values for target mode
Section03.js:1187 Section03: Province selected: ON
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section03.js:1187 Section03: Province selected: ON
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section03.js:1248 City dropdown updated for ON - selected: Milverton
Section03.js:1187 Section03: Province selected: ON
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section03.js:1248 City dropdown updated for ON - selected: Milverton
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section03.js:1248 City dropdown updated for ON - selected: Milverton
Section03.js:1187 Section03: Province selected: ON
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section03.js:1248 City dropdown updated for ON - selected: Milverton
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section10.js:2897 S10: Reference listener triggered by ref_i_98, recalculating all.
Section10.js:1955 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
Section10.js:1963 [S10 DEBUG] Dual-engine calculations complete in target mode
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1372631.00 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1372631.00 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 S10: Reference listener triggered by ref_i_97, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
Section10.js:1963 [S10 DEBUG] Dual-engine calculations complete in target mode
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1372631.00 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1372631.00 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S09] Updated calculated display values for target mode
 [S09] Updated calculated display values for target mode
 [S09] Updated calculated display values for target mode
 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
 [S07] calculateEmissionsAndLosses: systemType="Gas" (REF)
 [S07] 🔥 Gas calc: demand=814485.3333333333, afue=0.9 → e_51=87344.26468359375, k_54=0 (cleared)
 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
 [S07] calculateEmissionsAndLosses: systemType="Gas" (REF)
 [S07] 🔥 Gas calc: demand=814485.3333333333, afue=0.9 → e_51=87344.26468359375, k_54=0 (cleared)
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section07.js:929 [S07] calculateEmissionsAndLosses: systemType="Gas" (TGT)
Section07.js:955 [S07] 🔥 Gas calc: demand=292434.89361702127, afue=0.94 → e_51=30025.82661571028, k_54=0 (cleared)
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section07.js:929 [S07] calculateEmissionsAndLosses: systemType="Gas" (REF)
Section07.js:955 [S07] 🔥 Gas calc: demand=814485.3333333333, afue=0.9 → e_51=87344.26468359375, k_54=0 (cleared)
Section11.js:1344 [S11 Listener] d_73 changed to 0 (Target mode)
Section11.js:1344 [S11 Listener] d_73 changed to 0 (Target mode)
Section11.js:1344 [S11 Listener] d_74 changed to 914 (Target mode)
Section11.js:1344 [S11 Listener] d_74 changed to 914 (Target mode)
Section11.js:1344 [S11 Listener] d_75 changed to 846 (Target mode)
Section11.js:1344 [S11 Listener] d_75 changed to 846 (Target mode)
Section11.js:1344 [S11 Listener] d_76 changed to 845 (Target mode)
Section11.js:1344 [S11 Listener] d_76 changed to 845 (Target mode)
Section11.js:1344 [S11 Listener] d_77 changed to 120 (Target mode)
Section11.js:1344 [S11 Listener] d_77 changed to 120 (Target mode)
Section11.js:1344 [S11 Listener] d_78 changed to 0 (Target mode)
Section11.js:1344 [S11 Listener] d_78 changed to 0 (Target mode)
Section11.js:2298 [S11] Listener: d_97 changed → recalculating (src=system_reverted_to_import)
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] Listener: d_97 changed → recalculating (src=system_reverted_to_import)
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:1782
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:1782
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:1782
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:1782
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:1782
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:1782
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:1782
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:1782
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:1891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:1891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:1891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:1891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:1891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:1891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:1891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:1891
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section13.js:2670 [S13] 🔗 Published ref_d_120=29625.39 L/s for Reference ventilation energy calc
Section14.js:1434 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1434 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section13.js:2838 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S03] Target CALCULATED results stored (setpoints + derived values only - climate data already published)
 [S12] U-agg TGT: TB%=30 → g_101=0.676346, g_102=0.371429
 [S12] 🎯 TGT CLIMATE READ: d_20=4200, d_21=0
 [S12DB] TGT CLIMATE: d_20=4200, d_21=0, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4200*0.6763455491781712*24)/1000 = 68.17563135715966
 [S12DB] TGT i_101 result: 68.17563135715966 * 16633 = 1133965.2763636366
 [S12DB] TGT g_104 calc: (0.6763455491781712*16633 + 0.37142857142857144*11168)/27801.000001 = 0.5538566887752582
 [S12DB] TGT ROW104: i_101=1133965.2763636366, i_102=195127.296, i_103=652032.9037894738 → i_104=1981125.4761531106
 [S12DB] TGT ROW104: h_21="Capacitance", k_98=-64327.68 → k_104=-64327.68
 [Section12] Calculated display values updated for target mode
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section14.js:1434 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section14.js:1434 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [S03] Reference CALCULATED results stored (climate data + setpoints - INPUT fields excluded)
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section03.js:1944 [S03] Target CALCULATED results stored (setpoints + derived values only - climate data already published)
Section12.js:1667 [S12] U-agg TGT: TB%=30 → g_101=0.676346, g_102=0.371429
Section12.js:1948 [S12] 🎯 TGT CLIMATE READ: d_20=4200, d_21=0
Section12.js:2026 [S12DB] TGT CLIMATE: d_20=4200, d_21=0, d_22=1960, h_22=-1680
Section12.js:2050 [S12DB] TGT h_101 calc: (4200*0.6763455491781712*24)/1000 = 68.17563135715966
Section12.js:2053 [S12DB] TGT i_101 result: 68.17563135715966 * 16633 = 1133965.2763636366
Section12.js:2202 [S12DB] TGT g_104 calc: (0.6763455491781712*16633 + 0.37142857142857144*11168)/27801.000001 = 0.5538566887752582
Section12.js:2229 [S12DB] TGT ROW104: i_101=1133965.2763636366, i_102=195127.296, i_103=652032.9037894738 → i_104=1981125.4761531106
Section12.js:2232 [S12DB] TGT ROW104: h_21="Capacitance", k_98=-64327.68 → k_104=-64327.68
Section12.js:327 [Section12] Calculated display values updated for target mode
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Section03.js:2358
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section03.js:1914 [S03] Reference CALCULATED results stored (climate data + setpoints - INPUT fields excluded)
Section09.js:1932 [S09] 🔗 Published ref_i_63=3650 for S13
Section09.js:456 [S09] Updated calculated display values for target mode
Section09.js:1932 [S09] 🔗 Published ref_i_63=3650 for S13
Section09.js:456 [S09] Updated calculated display values for target mode
Section09.js:1932 [S09] 🔗 Published ref_i_63=3650 for S13
Section09.js:456 [S09] Updated calculated display values for target mode
Section09.js:189 S09: Reference values updated for standard: OBC SB10 5.5-6 Z5 (2010), lighting: 2.0
Section09.js:1932 [S09] 🔗 Published ref_i_63=3650 for S13
Section09.js:456 [S09] Updated calculated display values for target mode
Section09.js:189 S09: Reference values updated for standard: OBC SB10 5.5-6 Z5 (2010), lighting: 2.0
Section09.js:1932 [S09] 🔗 Published ref_i_63=3650 for S13
Section09.js:456 [S09] Updated calculated display values for target mode
Section09.js:189 S09: Reference values updated for standard: OBC SB10 5.5-6 Z5 (2010), lighting: 2.0
Section09.js:1932 [S09] 🔗 Published ref_i_63=3650 for S13
Section09.js:456 [S09] Updated calculated display values for target mode
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:1211 [S05→S02] Updated ref_d_16 = 650 based on ref_d_15 = Self Reported
Section05.js:1211 [S05→S02] Updated ref_d_16 = 650 based on ref_d_15 = Self Reported
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
StateManager.js:355 [StateManager DEBUG] ref_h_15 setValue: "11167" (state: system_reverted_to_import, prev: 11167)
StateManager.js:358 [StateManager] ref_h_15 setValue stack trace:
setValue @ StateManager.js:358
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section09.js:1932 [S09] 🔗 Published ref_i_63=3650 for S13
Section09.js:456 [S09] Updated calculated display values for target mode
Section09.js:1932 [S09] 🔗 Published ref_i_63=3650 for S13
Section09.js:456 [S09] Updated calculated display values for target mode
Section09.js:1932 [S09] 🔗 Published ref_i_63=3650 for S13
Section09.js:456 [S09] Updated calculated display values for target mode
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section09.js:1932 [S09] 🔗 Published ref_i_63=3650 for S13
Section09.js:456 [S09] Updated calculated display values for target mode
Section09.js:1932 [S09] 🔗 Published ref_i_63=3650 for S13
Section09.js:456 [S09] Updated calculated display values for target mode
Section09.js:1932 [S09] 🔗 Published ref_i_63=3650 for S13
Section09.js:456 [S09] Updated calculated display values for target mode
 [S07] calculateEmissionsAndLosses: systemType="Gas" (TGT)
 [S07] 🔥 Gas calc: demand=292434.89361702127, afue=0.94 → e_51=30025.82661571028, k_54=0 (cleared)
 [S07] calculateEmissionsAndLosses: systemType="Gas" (REF)
 [S07] 🔥 Gas calc: demand=814485.3333333333, afue=0.9 → e_51=87344.26468359375, k_54=0 (cleared)
 [S07] calculateEmissionsAndLosses: systemType="Gas" (TGT)
 [S07] 🔥 Gas calc: demand=292434.89361702127, afue=0.94 → e_51=30025.82661571028, k_54=0 (cleared)
 [S07] calculateEmissionsAndLosses: systemType="Gas" (REF)
 [S07] 🔥 Gas calc: demand=814485.3333333333, afue=0.9 → e_51=87344.26468359375, k_54=0 (cleared)
 [S07] calculateEmissionsAndLosses: systemType="Gas" (TGT)
Section07.js:955 [S07] 🔥 Gas calc: demand=292434.89361702127, afue=0.94 → e_51=30025.82661571028, k_54=0 (cleared)
Section07.js:929 [S07] calculateEmissionsAndLosses: systemType="Gas" (REF)
Section07.js:955 [S07] 🔥 Gas calc: demand=814485.3333333333, afue=0.9 → e_51=87344.26468359375, k_54=0 (cleared)
Section11.js:1361 [S11 Listener] ref_d_73 changed to 0 (Reference mode)
Section11.js:1361 [S11 Listener] ref_d_73 changed to 0 (Reference mode)
Section11.js:1361 [S11 Listener] ref_d_74 changed to 914 (Reference mode)
Section11.js:1361 [S11 Listener] ref_d_74 changed to 914 (Reference mode)
Section11.js:1361 [S11 Listener] ref_d_75 changed to 846 (Reference mode)
Section11.js:1361 [S11 Listener] ref_d_75 changed to 846 (Reference mode)
Section11.js:1361 [S11 Listener] ref_d_76 changed to 845 (Reference mode)
Section11.js:1361 [S11 Listener] ref_d_76 changed to 845 (Reference mode)
Section11.js:1361 [S11 Listener] ref_d_77 changed to 120 (Reference mode)
Section11.js:1361 [S11 Listener] ref_d_77 changed to 120 (Reference mode)
Section11.js:1361 [S11 Listener] ref_d_78 changed to 0 (Reference mode)
Section11.js:1361 [S11 Listener] ref_d_78 changed to 0 (Reference mode)
Section11.js:2307 [S11] Listener: ref_d_97 changed → recalculating (src=system_reverted_to_import)
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:2307 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2307 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2307 [S11] Listener: ref_d_97 changed → recalculating (src=system_reverted_to_import)
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ StateManager.js:1660
revertToLastImportedState @ StateManager.js:1658
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Clock.js:44 [CLOCK] Starting current calculation timing
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S03] Target CALCULATED results stored (setpoints + derived values only - climate data already published)
 [S12] U-agg TGT: TB%=30 → g_101=0.676346, g_102=0.371429
 [S12] 🎯 TGT CLIMATE READ: d_20=4200, d_21=0
 [S12DB] TGT CLIMATE: d_20=4200, d_21=0, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4200*0.6763455491781712*24)/1000 = 68.17563135715966
 [S12DB] TGT i_101 result: 68.17563135715966 * 16633 = 1133965.2763636366
 [S12DB] TGT g_104 calc: (0.6763455491781712*16633 + 0.37142857142857144*11168)/27801.000001 = 0.5538566887752582
 [S12DB] TGT ROW104: i_101=1133965.2763636366, i_102=195127.296, i_103=652032.9037894738 → i_104=1981125.4761531106
 [S12DB] TGT ROW104: h_21="Capacitance", k_98=-64327.68 → k_104=-64327.68
 [Section12] Calculated display values updated for target mode
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1355123.31 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
 [S03] Reference CALCULATED results stored (climate data + setpoints - INPUT fields excluded)
 [S07] calculateEmissionsAndLosses: systemType="Gas" (TGT)
 [S07] 🔥 Gas calc: demand=292434.89361702127, afue=0.94 → e_51=30025.82661571028, k_54=0 (cleared)
 [S07] calculateEmissionsAndLosses: systemType="Gas" (REF)
 [S07] 🔥 Gas calc: demand=814485.3333333333, afue=0.9 → e_51=87344.26468359375, k_54=0 (cleared)
 [S09] 🔗 Published ref_i_63=3650 for S13
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S11 Listener] ref_d_73 changed to 0 (Reference mode)
 [S11 Listener] ref_d_73 changed to 0 (Reference mode)
 [S11 Listener] ref_d_74 changed to 914 (Reference mode)
 [S11 Listener] ref_d_74 changed to 914 (Reference mode)
 [S11 Listener] ref_d_75 changed to 846 (Reference mode)
 [S11 Listener] ref_d_75 changed to 846 (Reference mode)
 [S11 Listener] ref_d_76 changed to 845 (Reference mode)
 [S11 Listener] ref_d_76 changed to 845 (Reference mode)
 [S11 Listener] ref_d_77 changed to 120 (Reference mode)
 [S11 Listener] ref_d_77 changed to 120 (Reference mode)
 [S11 Listener] ref_d_78 changed to 0 (Reference mode)
 [S11 Listener] ref_d_78 changed to 0 (Reference mode)
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S12] U-agg REF: TB%=50 → g_101=0.879413, g_102=0.428608
 [S12] 🔵 REF CLIMATE READ: d_20=3920, d_21=410
 [S12DB] REF CLIMATE: d_20=3920, d_21=410, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (3920*0.8794130088475913*24)/1000 = 82.73517587238139
 [S12DB] REF i_101 result: 82.73517587238139 * 16633 = 1376134.1802853197
 [S12DB] REF g_104 calc: (0.8794130088475913*16633 + 0.4286076715786601*11168)/27801.000001 = 0.6983190191595318
 [S12DB] REF ROW104: i_101=1376134.1802853197, i_102=225165.91999999998, i_103=608564.0435368421 → i_104=2209864.1438221615
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-37022.02566037736 → k_104=-37022.02566037736
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1286479.47 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1286479.47 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=30 → g_101=0.676346, g_102=0.371429
 [S12] 🎯 TGT CLIMATE READ: d_20=4200, d_21=0
 [S12DB] TGT CLIMATE: d_20=4200, d_21=0, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4200*0.6763455491781712*24)/1000 = 68.17563135715966
 [S12DB] TGT i_101 result: 68.17563135715966 * 16633 = 1133965.2763636366
 [S12DB] TGT g_104 calc: (0.6763455491781712*16633 + 0.37142857142857144*11168)/27801.000001 = 0.5538566887752582
 [S12DB] TGT ROW104: i_101=1133965.2763636366, i_102=195127.296, i_103=652032.9037894738 → i_104=1981125.4761531106
 [S12DB] TGT ROW104: h_21="Capacitance", k_98=-64327.68 → k_104=-64327.68
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=1286479.47 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264Understand this warningAI
 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ index.html#:264
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1286479.47 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section12.js:327 [Section12] Calculated display values updated for target mode
Section07.js:929 [S07] calculateEmissionsAndLosses: systemType="Gas" (TGT)
Section07.js:955 [S07] 🔥 Gas calc: demand=292434.89361702127, afue=0.94 → e_51=30025.82661571028, k_54=0 (cleared)
Section07.js:929 [S07] calculateEmissionsAndLosses: systemType="Gas" (REF)
Section07.js:955 [S07] 🔥 Gas calc: demand=814485.3333333333, afue=0.9 → e_51=87344.26468359375, k_54=0 (cleared)
Section13.js:2670 [S13] 🔗 Published ref_d_120=39500.51 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=47.559 kg/s, ΔT=3.6°C → 4095.20 kWh/day → 491423.59 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=491423.59 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=342219.10 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=1286479.47 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateReferenceModel @ Section13.js:3115
calculateAll @ Section13.js:3043
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=35.669 kg/s, ΔT=3.6°C → 3071.40 kWh/day → 368567.69 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=368567.69 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019
calculateTargetModel @ Section13.js:3183
calculateAll @ Section13.js:3045
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Section06.js:539 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0)
Section06.js:534 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0)
Dependency.js:116 [DependencyGraph] Data loaded: 349 nodes, 586 links
Dependency.js:329 [DependencyGraph] Container has zero dimensions. Graph might not be visible.
setupSvg @ Dependency.js:329
initializeGraphInstanceAndUI @ Dependency.js:1960
calculateAll @ Section17.js:50
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
revertToLastImportedState @ StateManager.js:1701
resetTier1_UndoChanges @ StateManager.js:1797
onclick @ VM2878 index.html:1Understand this warningAI
Dependency.js:688 [DependencyGraph] Calculating node sizes...
StateManager.js:1706 [StateManager] 🔄 Refreshing Pattern A section UIs after revert...
Section02.js:1913 [S02] Refreshing UI for TARGET mode
 [S02] Updated h_12 (reporting year) slider = "2023" (target mode)
 [S02] Updated h_13 (service life) slider = "50" (target mode)
 [S02] Updated h_15 = "11,167.00" (target mode)
 [S02] Updated i_17 = "XXXX" (target mode)
 [S02] Updated l_12 = "$0.1300" (target mode)
 [S02] Updated l_13 = "$0.5070" (target mode)
 [S02] Updated l_14 = "$1.6200" (target mode)
 [S02] Updated l_15 = "$180.00" (target mode)
 [S02] Updated l_16 = "$1.5000" (target mode)
 [StateManager] ✅ sect02 UI refreshed after revert
 Section03: Province selected: ON
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 City dropdown updated for ON - selected: Milverton
 [StateManager] ✅ sect03 UI refreshed after revert
 [StateManager] ✅ sect04 UI refreshed after revert
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [StateManager] ✅ sect05 UI refreshed after revert
 🔄 [S06] updateCalculatedDisplayValues: mode=target
 [StateManager] ✅ sect06 UI refreshed after revert
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
 🔍 [S07] refreshUI: fieldId=k_49, storedValue=57679.612928779454, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_49
 ✅ [S07] getFieldDefault: Found default for k_49 = "0.00"
 📋 [S07] refreshUI: fieldId=k_49, default=0.00, valueToShow=57679.612928779454, elementType=TD
 🔍 [S07] refreshUI: fieldId=n_49, storedValue=5%, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=n_49
 ✅ [S07] getFieldDefault: Found default for n_49 = "15%"
 📋 [S07] refreshUI: fieldId=n_49, default=15%, valueToShow=5%, elementType=TD
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
 🔍 [S07] refreshUI: fieldId=n_50, storedValue=5%, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=n_50
 ✅ [S07] getFieldDefault: Found default for n_50 = "15%"
 📋 [S07] refreshUI: fieldId=n_50, default=15%, valueToShow=5%, elementType=TD
 🔍 [S07] refreshUI: fieldId=d_51, storedValue=Heatpump, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_51
 ✅ [S07] getFieldDefault: Found default for d_51 = "Heatpump"
 📋 [S07] refreshUI: fieldId=d_51, default=Heatpump, valueToShow=Heatpump, elementType=SELECT
 🔽 [S07] refreshUI: Setting dropdown d_51 from "Gas" to "Heatpump" (mode=target)
 🔽 [S07] refreshUI: Dropdown d_51 now shows "Heatpump"
 🔍 [S07] refreshUI: fieldId=e_51, storedValue=30025.82661571028, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_51
 ✅ [S07] getFieldDefault: Found default for e_51 = "0.00"
 📋 [S07] refreshUI: fieldId=e_51, default=0.00, valueToShow=30025.82661571028, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_51, storedValue=292434.89361702127, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=j_51
 ✅ [S07] getFieldDefault: Found default for j_51 = "12,828.14"
 📋 [S07] refreshUI: fieldId=j_51, default=12,828.14, valueToShow=292434.89361702127, elementType=TD
 🔍 [S07] refreshUI: fieldId=k_51, storedValue=null, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_51
 ✅ [S07] getFieldDefault: Found default for k_51 = "12,828.14"
 📋 [S07] refreshUI: fieldId=k_51, default=12,828.14, valueToShow=12,828.14, elementType=TD
 🔍 [S07] refreshUI: fieldId=d_52, storedValue=250, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_52
 ✅ [S07] getFieldDefault: Found default for d_52 = "300"
 📋 [S07] refreshUI: fieldId=d_52, default=300, valueToShow=250, elementType=range
 🎚️ [S07] refreshUI: Setting slider d_52 = "250"
 🎚️ [S07] refreshUI: Updating d_52 slider range for system="Heatpump"
 🎚️ [S07] refreshUI: d_52 slider range updated to min=100, max=450, step=10
 🔍 [S07] refreshUI: fieldId=e_52, storedValue=2.5, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_52
 ✅ [S07] getFieldDefault: Found default for e_52 = "3.00"
 📋 [S07] refreshUI: fieldId=e_52, default=3.00, valueToShow=2.5, elementType=TD
 🔍 [S07] refreshUI: fieldId=j_52, storedValue=292434.89361702127, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=j_52
 ✅ [S07] getFieldDefault: Found default for j_52 = "12,828.14"
 📋 [S07] refreshUI: fieldId=j_52, default=12,828.14, valueToShow=292434.89361702127, elementType=TD
 🔍 [S07] refreshUI: fieldId=k_52, storedValue=0.94, elementFound=true
 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_52
 ✅ [S07] getFieldDefault: Found default for k_52 = "0.90"
 📋 [S07] refreshUI: fieldId=k_52, default=0.90, valueToShow=0.94, elementType=TD
Section07.js:251 ✏️ [S07] refreshUI: Setting contenteditable k_52 = "0.94"
Section07.js:210 🔍 [S07] refreshUI: fieldId=n_52, storedValue=278%, elementFound=true
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=n_52
Section07.js:339 ✅ [S07] getFieldDefault: Found default for n_52 = "100%"
Section07.js:243 📋 [S07] refreshUI: fieldId=n_52, default=100%, valueToShow=278%, elementType=TD
Section07.js:210 🔍 [S07] refreshUI: fieldId=d_53, storedValue=0, elementFound=true
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_53
Section07.js:339 ✅ [S07] getFieldDefault: Found default for d_53 = "0"
Section07.js:243 📋 [S07] refreshUI: fieldId=d_53, default=0, valueToShow=0, elementType=range
Section07.js:274 🎚️ [S07] refreshUI: Setting slider d_53 = "0"
Section07.js:210 🔍 [S07] refreshUI: fieldId=e_53, storedValue=null, elementFound=true
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_53
Section07.js:339 ✅ [S07] getFieldDefault: Found default for e_53 = "0.00"
Section07.js:243 📋 [S07] refreshUI: fieldId=e_53, default=0.00, valueToShow=0.00, elementType=TD
Section07.js:210 🔍 [S07] refreshUI: fieldId=j_53, storedValue=292434.89361702127, elementFound=true
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=j_53
Section07.js:339 ✅ [S07] getFieldDefault: Found default for j_53 = "12,828.14"
Section07.js:243 📋 [S07] refreshUI: fieldId=j_53, default=12,828.14, valueToShow=292434.89361702127, elementType=TD
Section07.js:210 🔍 [S07] refreshUI: fieldId=n_53, storedValue=0%, elementFound=true
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=n_53
Section07.js:339 ✅ [S07] getFieldDefault: Found default for n_53 = "0%"
Section07.js:243 📋 [S07] refreshUI: fieldId=n_53, default=0%, valueToShow=0%, elementType=TD
Section07.js:210 🔍 [S07] refreshUI: fieldId=d_54, storedValue=null, elementFound=true
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_54
Section07.js:339 ✅ [S07] getFieldDefault: Found default for d_54 = "0.00"
Section07.js:243 📋 [S07] refreshUI: fieldId=d_54, default=0.00, valueToShow=0.00, elementType=TD
Section07.js:210 🔍 [S07] refreshUI: fieldId=j_54, storedValue=17546.09361702129, elementFound=true
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=j_54
Section07.js:339 ✅ [S07] getFieldDefault: Found default for j_54 = "0.00"
Section07.js:243 📋 [S07] refreshUI: fieldId=j_54, default=0.00, valueToShow=17546.09361702129, elementType=TD
Section07.js:210 🔍 [S07] refreshUI: fieldId=k_54, storedValue=null, elementFound=true
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_54
Section07.js:339 ✅ [S07] getFieldDefault: Found default for k_54 = "0.00"
Section07.js:243 📋 [S07] refreshUI: fieldId=k_54, default=0.00, valueToShow=0.00, elementType=TD
Section07.js:323 ✅ [S07] refreshUI: Completed refresh for mode=target
StateManager.js:1733 [StateManager] ✅ sect07 UI refreshed after revert
Section09.js:381 S09: UI refreshed for target mode
Section09.js:456 [S09] Updated calculated display values for target mode
StateManager.js:1733 [StateManager] ✅ sect09 UI refreshed after revert
StateManager.js:1733 [StateManager] ✅ sect10 UI refreshed after revert
StateManager.js:1733 [StateManager] ✅ sect11 UI refreshed after revert
Section12.js:327 [Section12] Calculated display values updated for target mode
StateManager.js:1733 [StateManager] ✅ sect12 UI refreshed after revert
StateManager.js:1733 [StateManager] ✅ sect13 UI refreshed after revert
StateManager.js:1733 [StateManager] ✅ sect15 UI refreshed after revert
StateManager.js:1752 [StateManager] Reverted to last imported state. 126 fields updated.
StateManager.js:1798 [Reset Tier 1] Reverted to imported state
Section12.js:1667 [S12] U-agg REF: TB%=50 → g_101=0.879413, g_102=0.428608
Section12.js:1941 [S12] 🔵 REF CLIMATE READ: d_20=3920, d_21=410
Section12.js:2015 [S12DB] REF CLIMATE: d_20=3920, d_21=410, d_22=1960, h_22=-1680
Section12.js:2043 [S12DB] REF h_101 calc: (3920*0.8794130088475913*24)/1000 = 82.73517587238139
Section12.js:2046 [S12DB] REF i_101 result: 82.73517587238139 * 16633 = 1376134.1802853197
Section12.js:2198 [S12DB] REF g_104 calc: (0.8794130088475913*16633 + 0.4286076715786601*11168)/27801.000001 = 0.6983190191595318
Section12.js:2222 [S12DB] REF ROW104: i_101=1376134.1802853197, i_102=225165.91999999998, i_103=608564.0435368421 → i_104=2209864.1438221615
Section12.js:2225 [S12DB] REF ROW104: h_21="Capacitance", k_98=-37022.02566037736 → k_104=-37022.02566037736
Section12.js:2409 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
Section12.js:1667 [S12] U-agg TGT: TB%=30 → g_101=0.676346, g_102=0.371429
Section12.js:1948 [S12] 🎯 TGT CLIMATE READ: d_20=4200, d_21=0
Section12.js:2026 [S12DB] TGT CLIMATE: d_20=4200, d_21=0, d_22=1960, h_22=-1680
Section12.js:2050 [S12DB] TGT h_101 calc: (4200*0.6763455491781712*24)/1000 = 68.17563135715966
Section12.js:2053 [S12DB] TGT i_101 result: 68.17563135715966 * 16633 = 1133965.2763636366
Section12.js:2202 [S12DB] TGT g_104 calc: (0.6763455491781712*16633 + 0.37142857142857144*11168)/27801.000001 = 0.5538566887752582
Section12.js:2229 [S12DB] TGT ROW104: i_101=1133965.2763636366, i_102=195127.296, i_103=652032.9037894738 → i_104=1981125.4761531106
Section12.js:2232 [S12DB] TGT ROW104: h_21="Capacitance", k_98=-64327.68 → k_104=-64327.68
Section12.js:327 [Section12] Calculated display values updated for target mode
Section11.js:1238 [S11 Area Sync] Starting sync in target mode
Section11.js:1284 [S11 Area Sync] d_88 = 0 (from d_73)
Section11.js:1284 [S11 Area Sync] d_89 = 914 (from d_74)
Section11.js:1284 [S11 Area Sync] d_90 = 846 (from d_75)
Section11.js:1284 [S11 Area Sync] d_91 = 845 (from d_76)
Section11.js:1284 [S11 Area Sync] d_92 = 120 (from d_77)
Section11.js:1284 [S11 Area Sync] d_93 = 0 (from d_78)
Section11.js:1296 [S11 Area Sync] Refreshing UI...
Section11.js:1300 [S11 Area Sync] Triggering recalculation...
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=50% → ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=205615.66, ref_k_97=-18511.01
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1303 [S11 Area Sync] Sync completed successfully
Section01.js:755 🔍 [S01DB] updateTEUIDisplay START: e_10=913.5, h_10=145.31531039145656, useType=Utility Bills
Section01.js:825 🔍 [S01] T.1 Calculation: e_6=135.1 (ref), h_6=27.9 (target) → reduction should be 79%
Section01.js:924 🔍 [S01DB] UPDATING h_10: 173.2 (from j_32=1933837.0217978011, area=11167)
Section01.js:511 🔍 [S01] h_6 explanation: target=27.9, ref=135.1, reduction=0.7934863064396743, percent=79%
Clock.js:65 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 142ms (subsequent update)
Clock.js:161 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 142ms (interaction → h_10 settlement)
Section01.js:1249 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
StateManager.js:598 [StateManager] Saved 249 imported fields to localStorage