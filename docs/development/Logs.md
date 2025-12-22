Clock.js:163 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
FieldManager.js:210 [FieldManager] Routed d_159=multiplanar through sect19 ModeManager
Section19.js:2544 [WOMBAT calculateAll] Called - Current mode: target, isActivated: true
Section19.js:1283 [WOMBAT-2] Prismatic solver (Target mode)
Section19.js:1313 [WOMBAT-2 DEBUG] d_154_raw from state: 0.0 (type: string)
Section19.js:1322 [WOMBAT-2 DEBUG] aspectRatio calculated: 1
Section19.js:1323 [WOMBAT-2 DEBUG] footprintArea: 1100.92
Section19.js:1329 [WOMBAT-2 DEBUG] width: 33.18011452662574, length: 33.18011452662573
Section19.js:1330 [WOMBAT-2] Aspect ratio: 0.0 → 1.00:1 (L:W)
Section19.js:1331 [WOMBAT-2] Footprint: 33.18m × 33.18m = 1100.92m²
Section19.js:1348 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³, roof=multiplanar (requested: multiplanar)
Section19.js:1356 [WOMBAT-2] Footprint: 33.18m (short) × 33.18m (long)
Section19.js:1357 [WOMBAT-2] Ridge orientation: transverse
Section19.js:948 [WOMBAT] Square building detected → Pure pyramid
Section19.js:975 [WOMBAT] Pyramid roof solved algebraically:
Section19.js:976   Footprint: 33.18m × 33.18m (square)
   Roof height: 13.31m
   Roof pitch: 9.6:12 (rise:run ratio)
   Roof volume: 4885.12m³
   Target area: 1411.52m²
 [WOMBAT-2] Roof solved: type=pyramid, height=13.31m, volume=4885.12m³
 [WOMBAT-2] Foundation type: slab-on-grade
 [WOMBAT-2] Attempting reference wall height:
   Target wall height: 5.15 m (1 × 5.15m from g_106)
   Would give volume: 10554.86 m³
     = Wall volume: 5669.74 m³
     + Roof volume: 4885.12 m³
     + Basement volume: 0.00 m³
   USER TARGET (d_105): 8319.50 m³
 [WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit
solveGeometry @ Section19.js:1482
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
 [WOMBAT-2] → Wall height reduced: 5.15m → 3.12m
solveGeometry @ Section19.js:1483
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
 [WOMBAT-2] → Storey height: 5.15m → 3.12m
solveGeometry @ Section19.js:1484
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
 [WOMBAT-2] → To restore: increase Conditioned Volume or reduce Roof Area
solveGeometry @ Section19.js:1485
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
 [WOMBAT-2] Final geometry:
   Footprint: 1100.92 m² (d_95 - SACRED)
   Roof area: 1411.52 m² (d_85 - SACRED)
   Roof height: 13.31 m
   Wall height: 3.12 m (COMPRESSED)
   Storey height: 3.12 m
   Wall volume: 3434.38 m³
   Roof volume: 4885.12 m³
   Basement volume: 0.00 m³
   Total volume: 8319.50 m³
 [WOMBAT] Pyramid: 1 apex node at (0, 0, 16.43m)
 [WOMBAT-2] Polyhedral roof (pyramid): 1 ridge node(s)
 [WOMBAT-2] Footprint dimensions: width=33.18m, length=33.18m (from aspect ratio)
 [WOMBAT-2] Prismatic solver (Reference mode)
 [WOMBAT-2 DEBUG] d_154_raw from state: 0.0 (type: string)
 [WOMBAT-2 DEBUG] aspectRatio calculated: 1
 [WOMBAT-2 DEBUG] footprintArea: 1100.92
 [WOMBAT-2 DEBUG] width: 33.18011452662574, length: 33.18011452662573
 [WOMBAT-2] Aspect ratio: 0.0 → 1.00:1 (L:W)
 [WOMBAT-2] Footprint: 33.18m × 33.18m = 1100.92m²
 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³, roof=flat (requested: flat)
 [WOMBAT-2] Footprint: 33.18m (short) × 33.18m (long)
 [WOMBAT-2] Ridge orientation: transverse
 [WOMBAT-2] Roof solved: type=flat, height=0.00m, volume=0.00m³
 [WOMBAT-2] Foundation type: slab-on-grade
 [WOMBAT-2] Attempting reference wall height:
   Target wall height: 5.15 m (1 × 5.15m from g_106)
   Would give volume: 5669.74 m³
     = Wall volume: 5669.74 m³
     + Roof volume: 0.00 m³
     + Basement volume: 0.00 m³
   USER TARGET (d_105): 8319.50 m³
 [WOMBAT-2] ✓ Using reference wall height (volume within budget)
 [WOMBAT-2] Final geometry:
   Footprint: 1100.92 m² (d_95 - SACRED)
   Roof area: 1411.52 m² (d_85 - SACRED)
   Roof height: 0.00 m
   Wall height: 5.15 m (reference)
   Storey height: 5.15 m
   Wall volume: 5669.74 m³
   Roof volume: 0.00 m³
   Basement volume: 0.00 m³
   Total volume: 5669.74 m³
 [WOMBAT-2] Prismatic roof: profile=flat, extrusion=33.18m
 [WOMBAT-2] Footprint dimensions: width=33.18m, length=33.18m (from aspect ratio)
 [WOMBAT calculateAll] Updating visualization for mode: target
 🎨 [WOMBAT updateVisualization] Called with mode="target"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = false
 [WOMBAT-2] Prismatic solver (Target mode)
 [WOMBAT-2 DEBUG] d_154_raw from state: 0.0 (type: string)
 [WOMBAT-2 DEBUG] aspectRatio calculated: 1
 [WOMBAT-2 DEBUG] footprintArea: 1100.92
 [WOMBAT-2 DEBUG] width: 33.18011452662574, length: 33.18011452662573
 [WOMBAT-2] Aspect ratio: 0.0 → 1.00:1 (L:W)
 [WOMBAT-2] Footprint: 33.18m × 33.18m = 1100.92m²
 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³, roof=multiplanar (requested: multiplanar)
 [WOMBAT-2] Footprint: 33.18m (short) × 33.18m (long)
 [WOMBAT-2] Ridge orientation: transverse
 [WOMBAT] Square building detected → Pure pyramid
 [WOMBAT] Pyramid roof solved algebraically:
   Footprint: 33.18m × 33.18m (square)
   Roof height: 13.31m
   Roof pitch: 9.6:12 (rise:run ratio)
   Roof volume: 4885.12m³
   Target area: 1411.52m²
 [WOMBAT-2] Roof solved: type=pyramid, height=13.31m, volume=4885.12m³
 [WOMBAT-2] Foundation type: slab-on-grade
 [WOMBAT-2] Attempting reference wall height:
   Target wall height: 5.15 m (1 × 5.15m from g_106)
   Would give volume: 10554.86 m³
     = Wall volume: 5669.74 m³
     + Roof volume: 4885.12 m³
     + Basement volume: 0.00 m³
   USER TARGET (d_105): 8319.50 m³
 [WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit
solveGeometry @ Section19.js:1482
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
 [WOMBAT-2] → Wall height reduced: 5.15m → 3.12m
solveGeometry @ Section19.js:1483
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
 [WOMBAT-2] → Storey height: 5.15m → 3.12m
solveGeometry @ Section19.js:1484
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
 [WOMBAT-2] → To restore: increase Conditioned Volume or reduce Roof Area
solveGeometry @ Section19.js:1485
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
 [WOMBAT-2] Final geometry:
   Footprint: 1100.92 m² (d_95 - SACRED)
Section19.js:1506   Roof area: 1411.52 m² (d_85 - SACRED)
Section19.js:1507   Roof height: 13.31 m
Section19.js:1508   Wall height: 3.12 m (COMPRESSED)
Section19.js:1509   Storey height: 3.12 m
Section19.js:1513   Wall volume: 3434.38 m³
Section19.js:1514   Roof volume: 4885.12 m³
Section19.js:1515   Basement volume: 0.00 m³
Section19.js:1516   Total volume: 8319.50 m³
Section19.js:1255 [WOMBAT] Pyramid: 1 apex node at (0, 0, 16.43m)
Section19.js:1554 [WOMBAT-2] Polyhedral roof (pyramid): 1 ridge node(s)
Section19.js:1555 [WOMBAT-2] Footprint dimensions: width=33.18m, length=33.18m (from aspect ratio)
Section19.js:1655 🎨 [WOMBAT updateVisualization] SVG element found: true
Section19.js:1662 🎨 [WOMBAT] Delegating render to wombatRender.js
wombatRender.js:154 [WombatRender-4] Prismatic render called
wombatRender.js:155   Geometry: {footprint: {…}, ridgeOrientation: 'transverse', roofType: 'pyramid', roofHeight: 13.31191999549655, roofVolume: 4885.119653814021, …}
wombatRender.js:156   Mode: target
wombatRender.js:157   Options: {showBelowGrade: false}
wombatRender.js:339 [WombatRender-4] Rendered successfully
Section19.js:2563 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
Section19.js:204 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
Section19.js:2567 [WOMBAT calculateAll] Complete
FieldManager.js:222 [FieldManager] Called sect19.calculateAll() after d_159 change

LOGS ABOVE FROM PYRAMID CALCULATION. 

Clock.js:163 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
FieldManager.js:210 [FieldManager] Routed d_159=multiplanar through sect19 ModeManager
Section19.js:2544 [WOMBAT calculateAll] Called - Current mode: target, isActivated: true
Section19.js:1283 [WOMBAT-2] Prismatic solver (Target mode)
Section19.js:1313 [WOMBAT-2 DEBUG] d_154_raw from state: 0.0 (type: string)
Section19.js:1322 [WOMBAT-2 DEBUG] aspectRatio calculated: 1
Section19.js:1323 [WOMBAT-2 DEBUG] footprintArea: 1100.92
Section19.js:1329 [WOMBAT-2 DEBUG] width: 33.18011452662574, length: 33.18011452662573
Section19.js:1330 [WOMBAT-2] Aspect ratio: 0.0 → 1.00:1 (L:W)
Section19.js:1331 [WOMBAT-2] Footprint: 33.18m × 33.18m = 1100.92m²
Section19.js:1348 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³, roof=multiplanar (requested: multiplanar)
Section19.js:1356 [WOMBAT-2] Footprint: 33.18m (short) × 33.18m (long)
Section19.js:1357 [WOMBAT-2] Ridge orientation: transverse
Section19.js:948 [WOMBAT] Square building detected → Pure pyramid
Section19.js:975 [WOMBAT] Pyramid roof solved algebraically:
Section19.js:976   Footprint: 33.18m × 33.18m (square)
Section19.js:977   Roof height: 13.31m
Section19.js:978   Roof pitch: 9.6:12 (rise:run ratio)
Section19.js:979   Roof volume: 4885.12m³
Section19.js:980   Target area: 1411.52m²
Section19.js:1371 [WOMBAT-2] Roof solved: type=pyramid, height=13.31m, volume=4885.12m³
Section19.js:1417 [WOMBAT-2] Foundation type: slab-on-grade
Section19.js:1437 [WOMBAT-2] Attempting reference wall height:
Section19.js:1438   Target wall height: 5.15 m (1 × 5.15m from g_106)
Section19.js:1439   Would give volume: 10554.86 m³
Section19.js:1440     = Wall volume: 5669.74 m³
Section19.js:1441     + Roof volume: 4885.12 m³
Section19.js:1442     + Basement volume: 0.00 m³
Section19.js:1443   USER TARGET (d_105): 8319.50 m³
Section19.js:1482 [WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit
solveGeometry @ Section19.js:1482
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
Section19.js:1483 [WOMBAT-2] → Wall height reduced: 5.15m → 3.12m
solveGeometry @ Section19.js:1483
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
Section19.js:1484 [WOMBAT-2] → Storey height: 5.15m → 3.12m
solveGeometry @ Section19.js:1484
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
Section19.js:1485 [WOMBAT-2] → To restore: increase Conditioned Volume or reduce Roof Area
solveGeometry @ Section19.js:1485
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
Section19.js:1504 [WOMBAT-2] Final geometry:
Section19.js:1505   Footprint: 1100.92 m² (d_95 - SACRED)
Section19.js:1506   Roof area: 1411.52 m² (d_85 - SACRED)
Section19.js:1507   Roof height: 13.31 m
Section19.js:1508   Wall height: 3.12 m (COMPRESSED)
Section19.js:1509   Storey height: 3.12 m
Section19.js:1513   Wall volume: 3434.38 m³
Section19.js:1514   Roof volume: 4885.12 m³
Section19.js:1515   Basement volume: 0.00 m³
Section19.js:1516   Total volume: 8319.50 m³
Section19.js:1255 [WOMBAT] Pyramid: 1 apex node at (0, 0, 16.43m)
Section19.js:1554 [WOMBAT-2] Polyhedral roof (pyramid): 1 ridge node(s)
Section19.js:1555 [WOMBAT-2] Footprint dimensions: width=33.18m, length=33.18m (from aspect ratio)
Section19.js:1283 [WOMBAT-2] Prismatic solver (Reference mode)
Section19.js:1313 [WOMBAT-2 DEBUG] d_154_raw from state: 0.0 (type: string)
Section19.js:1322 [WOMBAT-2 DEBUG] aspectRatio calculated: 1
Section19.js:1323 [WOMBAT-2 DEBUG] footprintArea: 1100.92
Section19.js:1329 [WOMBAT-2 DEBUG] width: 33.18011452662574, length: 33.18011452662573
Section19.js:1330 [WOMBAT-2] Aspect ratio: 0.0 → 1.00:1 (L:W)
Section19.js:1331 [WOMBAT-2] Footprint: 33.18m × 33.18m = 1100.92m²
Section19.js:1348 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³, roof=flat (requested: flat)
Section19.js:1356 [WOMBAT-2] Footprint: 33.18m (short) × 33.18m (long)
Section19.js:1357 [WOMBAT-2] Ridge orientation: transverse
Section19.js:1371 [WOMBAT-2] Roof solved: type=flat, height=0.00m, volume=0.00m³
Section19.js:1417 [WOMBAT-2] Foundation type: slab-on-grade
Section19.js:1437 [WOMBAT-2] Attempting reference wall height:
Section19.js:1438   Target wall height: 5.15 m (1 × 5.15m from g_106)
Section19.js:1439   Would give volume: 5669.74 m³
Section19.js:1440     = Wall volume: 5669.74 m³
Section19.js:1441     + Roof volume: 0.00 m³
Section19.js:1442     + Basement volume: 0.00 m³
Section19.js:1443   USER TARGET (d_105): 8319.50 m³
Section19.js:1498 [WOMBAT-2] ✓ Using reference wall height (volume within budget)
Section19.js:1504 [WOMBAT-2] Final geometry:
Section19.js:1505   Footprint: 1100.92 m² (d_95 - SACRED)
Section19.js:1506   Roof area: 1411.52 m² (d_85 - SACRED)
Section19.js:1507   Roof height: 0.00 m
Section19.js:1508   Wall height: 5.15 m (reference)
Section19.js:1509   Storey height: 5.15 m
Section19.js:1513   Wall volume: 5669.74 m³
Section19.js:1514   Roof volume: 0.00 m³
Section19.js:1515   Basement volume: 0.00 m³
Section19.js:1516   Total volume: 5669.74 m³
Section19.js:1563 [WOMBAT-2] Prismatic roof: profile=flat, extrusion=33.18m
Section19.js:1564 [WOMBAT-2] Footprint dimensions: width=33.18m, length=33.18m (from aspect ratio)
Section19.js:2556 [WOMBAT calculateAll] Updating visualization for mode: target
Section19.js:1638 🎨 [WOMBAT updateVisualization] Called with mode="target"
Section19.js:1639 🎨 [WOMBAT updateVisualization] isActivated = true
Section19.js:1649 🎨 [WOMBAT updateVisualization] isReference = false
Section19.js:1283 [WOMBAT-2] Prismatic solver (Target mode)
Section19.js:1313 [WOMBAT-2 DEBUG] d_154_raw from state: 0.0 (type: string)
Section19.js:1322 [WOMBAT-2 DEBUG] aspectRatio calculated: 1
Section19.js:1323 [WOMBAT-2 DEBUG] footprintArea: 1100.92
Section19.js:1329 [WOMBAT-2 DEBUG] width: 33.18011452662574, length: 33.18011452662573
Section19.js:1330 [WOMBAT-2] Aspect ratio: 0.0 → 1.00:1 (L:W)
Section19.js:1331 [WOMBAT-2] Footprint: 33.18m × 33.18m = 1100.92m²
Section19.js:1348 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³, roof=multiplanar (requested: multiplanar)
Section19.js:1356 [WOMBAT-2] Footprint: 33.18m (short) × 33.18m (long)
Section19.js:1357 [WOMBAT-2] Ridge orientation: transverse
Section19.js:948 [WOMBAT] Square building detected → Pure pyramid
Section19.js:975 [WOMBAT] Pyramid roof solved algebraically:
Section19.js:976   Footprint: 33.18m × 33.18m (square)
Section19.js:977   Roof height: 13.31m
Section19.js:978   Roof pitch: 9.6:12 (rise:run ratio)
Section19.js:979   Roof volume: 4885.12m³
Section19.js:980   Target area: 1411.52m²
Section19.js:1371 [WOMBAT-2] Roof solved: type=pyramid, height=13.31m, volume=4885.12m³
Section19.js:1417 [WOMBAT-2] Foundation type: slab-on-grade
Section19.js:1437 [WOMBAT-2] Attempting reference wall height:
Section19.js:1438   Target wall height: 5.15 m (1 × 5.15m from g_106)
Section19.js:1439   Would give volume: 10554.86 m³
Section19.js:1440     = Wall volume: 5669.74 m³
Section19.js:1441     + Roof volume: 4885.12 m³
Section19.js:1442     + Basement volume: 0.00 m³
Section19.js:1443   USER TARGET (d_105): 8319.50 m³
Section19.js:1482 [WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit
solveGeometry @ Section19.js:1482
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
Section19.js:1483 [WOMBAT-2] → Wall height reduced: 5.15m → 3.12m
solveGeometry @ Section19.js:1483
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
Section19.js:1484 [WOMBAT-2] → Storey height: 5.15m → 3.12m
solveGeometry @ Section19.js:1484
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
Section19.js:1485 [WOMBAT-2] → To restore: increase Conditioned Volume or reduce Roof Area
solveGeometry @ Section19.js:1485
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
Section19.js:1504 [WOMBAT-2] Final geometry:
Section19.js:1505   Footprint: 1100.92 m² (d_95 - SACRED)
Section19.js:1506   Roof area: 1411.52 m² (d_85 - SACRED)
Section19.js:1507   Roof height: 13.31 m
Section19.js:1508   Wall height: 3.12 m (COMPRESSED)
Section19.js:1509   Storey height: 3.12 m
Section19.js:1513   Wall volume: 3434.38 m³
Section19.js:1514   Roof volume: 4885.12 m³
Section19.js:1515   Basement volume: 0.00 m³
Section19.js:1516   Total volume: 8319.50 m³
Section19.js:1255 [WOMBAT] Pyramid: 1 apex node at (0, 0, 16.43m)
Section19.js:1554 [WOMBAT-2] Polyhedral roof (pyramid): 1 ridge node(s)
Section19.js:1555 [WOMBAT-2] Footprint dimensions: width=33.18m, length=33.18m (from aspect ratio)
Section19.js:1655 🎨 [WOMBAT updateVisualization] SVG element found: true
Section19.js:1662 🎨 [WOMBAT] Delegating render to wombatRender.js
wombatRender.js:154 [WombatRender-4] Prismatic render called
wombatRender.js:155   Geometry: {footprint: {…}, ridgeOrientation: 'transverse', roofType: 'pyramid', roofHeight: 13.31191999549655, roofVolume: 4885.119653814021, …}
wombatRender.js:156   Mode: target
wombatRender.js:157   Options: {showBelowGrade: false}
wombatRender.js:339 [WombatRender-4] Rendered successfully
Section19.js:2563 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
Section19.js:204 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
Section19.js:2567 [WOMBAT calculateAll] Complete
FieldManager.js:222 [FieldManager] Called sect19.calculateAll() after d_159 change
Clock.js:163 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
FieldManager.js:210 [FieldManager] Routed d_154=0.1 through sect19 ModeManager
Section19.js:2544 [WOMBAT calculateAll] Called - Current mode: target, isActivated: true
Section19.js:1283 [WOMBAT-2] Prismatic solver (Target mode)
Section19.js:1313 [WOMBAT-2 DEBUG] d_154_raw from state: 0.1 (type: string)
Section19.js:1322 [WOMBAT-2 DEBUG] aspectRatio calculated: 1.1
Section19.js:1323 [WOMBAT-2 DEBUG] footprintArea: 1100.92
 [WOMBAT-2 DEBUG] width: 31.635997908021864, length: 34.79959769882405
 [WOMBAT-2] Aspect ratio: 0.1 → 1.10:1 (L:W)
 [WOMBAT-2] Footprint: 31.64m × 34.80m = 1100.92m²
 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³, roof=multiplanar (requested: multiplanar)
 [WOMBAT-2] Footprint: 31.64m (short) × 34.80m (long)
 [WOMBAT-2] Ridge orientation: longitudinal
 [WOMBAT-DEBUG] Testing two formulas:
   v1: u = A/(2L-W) = 1411.52/37.96 = 37.18m
   v2: u = A/(2L) = 1411.52/69.60 = 20.28m
 [WOMBAT-DEBUG] Area verification:
   v1 formula [2(L-W)u + Wu]: 769.92m²
   v2 formula [2(L-W)u + 2W·hipRafter]: 1755.67m²
   Target: 1411.52m²
 [WOMBAT] Hip roof solved algebraically:
   Footprint: 31.64m × 34.80m
   Ridge length: 3.16m
   Roof height: 12.69m
   Roof pitch: 9.6:12 (rise:run ratio)
   Target area: 1411.52m²
   Achieved area: 1755.67m²
   Error: 344.1523m²
   Roof volume: 2752.32m³
 [WOMBAT-2] Roof solved: type=hip, height=12.69m, volume=2752.32m³
 [WOMBAT-2] Foundation type: slab-on-grade
 [WOMBAT-2] Attempting reference wall height:
   Target wall height: 5.15 m (1 × 5.15m from g_106)
   Would give volume: 8422.06 m³
     = Wall volume: 5669.74 m³
     + Roof volume: 2752.32 m³
     + Basement volume: 0.00 m³
   USER TARGET (d_105): 8319.50 m³
 [WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit
solveGeometry @ Section19.js:1482
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] → Wall height reduced: 5.15m → 5.06m
solveGeometry @ Section19.js:1483
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] → Storey height: 5.15m → 5.06m
solveGeometry @ Section19.js:1484
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] → To restore: increase Conditioned Volume or reduce Roof Area
solveGeometry @ Section19.js:1485
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] Final geometry:
   Footprint: 1100.92 m² (d_95 - SACRED)
   Roof area: 1411.52 m² (d_85 - SACRED)
   Roof height: 12.69 m
   Wall height: 5.06 m (COMPRESSED)
   Storey height: 5.06 m
   Wall volume: 5567.18 m³
   Roof volume: 2752.32 m³
   Basement volume: 0.00 m³
   Total volume: 8319.50 m³
 [WOMBAT] Hip: 2 ridge nodes, ridge length=3.16m
 [WOMBAT-2] Polyhedral roof (hip): 2 ridge node(s)
 [WOMBAT-2] Footprint dimensions: width=31.64m, length=34.80m (from aspect ratio)
 [WOMBAT-2] Prismatic solver (Reference mode)
 [WOMBAT-2 DEBUG] d_154_raw from state: 0.0 (type: string)
 [WOMBAT-2 DEBUG] aspectRatio calculated: 1
 [WOMBAT-2 DEBUG] footprintArea: 1100.92
 [WOMBAT-2 DEBUG] width: 33.18011452662574, length: 33.18011452662573
 [WOMBAT-2] Aspect ratio: 0.0 → 1.00:1 (L:W)
 [WOMBAT-2] Footprint: 33.18m × 33.18m = 1100.92m²
 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³, roof=flat (requested: flat)
 [WOMBAT-2] Footprint: 33.18m (short) × 33.18m (long)
 [WOMBAT-2] Ridge orientation: transverse
 [WOMBAT-2] Roof solved: type=flat, height=0.00m, volume=0.00m³
 [WOMBAT-2] Foundation type: slab-on-grade
 [WOMBAT-2] Attempting reference wall height:
   Target wall height: 5.15 m (1 × 5.15m from g_106)
   Would give volume: 5669.74 m³
     = Wall volume: 5669.74 m³
     + Roof volume: 0.00 m³
     + Basement volume: 0.00 m³
   USER TARGET (d_105): 8319.50 m³
 [WOMBAT-2] ✓ Using reference wall height (volume within budget)
 [WOMBAT-2] Final geometry:
   Footprint: 1100.92 m² (d_95 - SACRED)
   Roof area: 1411.52 m² (d_85 - SACRED)
   Roof height: 0.00 m
   Wall height: 5.15 m (reference)
   Storey height: 5.15 m
   Wall volume: 5669.74 m³
   Roof volume: 0.00 m³
   Basement volume: 0.00 m³
   Total volume: 5669.74 m³
 [WOMBAT-2] Prismatic roof: profile=flat, extrusion=33.18m
 [WOMBAT-2] Footprint dimensions: width=33.18m, length=33.18m (from aspect ratio)
 [WOMBAT calculateAll] Updating visualization for mode: target
 🎨 [WOMBAT updateVisualization] Called with mode="target"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = false
 [WOMBAT-2] Prismatic solver (Target mode)
 [WOMBAT-2 DEBUG] d_154_raw from state: 0.1 (type: string)
 [WOMBAT-2 DEBUG] aspectRatio calculated: 1.1
 [WOMBAT-2 DEBUG] footprintArea: 1100.92
 [WOMBAT-2 DEBUG] width: 31.635997908021864, length: 34.79959769882405
 [WOMBAT-2] Aspect ratio: 0.1 → 1.10:1 (L:W)
 [WOMBAT-2] Footprint: 31.64m × 34.80m = 1100.92m²
 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³, roof=multiplanar (requested: multiplanar)
 [WOMBAT-2] Footprint: 31.64m (short) × 34.80m (long)
 [WOMBAT-2] Ridge orientation: longitudinal
 [WOMBAT-DEBUG] Testing two formulas:
   v1: u = A/(2L-W) = 1411.52/37.96 = 37.18m
   v2: u = A/(2L) = 1411.52/69.60 = 20.28m
 [WOMBAT-DEBUG] Area verification:
   v1 formula [2(L-W)u + Wu]: 769.92m²
   v2 formula [2(L-W)u + 2W·hipRafter]: 1755.67m²
   Target: 1411.52m²
 [WOMBAT] Hip roof solved algebraically:
   Footprint: 31.64m × 34.80m
   Ridge length: 3.16m
   Roof height: 12.69m
   Roof pitch: 9.6:12 (rise:run ratio)
   Target area: 1411.52m²
   Achieved area: 1755.67m²
   Error: 344.1523m²
   Roof volume: 2752.32m³
 [WOMBAT-2] Roof solved: type=hip, height=12.69m, volume=2752.32m³
 [WOMBAT-2] Foundation type: slab-on-grade
 [WOMBAT-2] Attempting reference wall height:
   Target wall height: 5.15 m (1 × 5.15m from g_106)
   Would give volume: 8422.06 m³
     = Wall volume: 5669.74 m³
     + Roof volume: 2752.32 m³
     + Basement volume: 0.00 m³
   USER TARGET (d_105): 8319.50 m³
 [WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit
solveGeometry @ Section19.js:1482
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] → Wall height reduced: 5.15m → 5.06m
solveGeometry @ Section19.js:1483
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] → Storey height: 5.15m → 5.06m
solveGeometry @ Section19.js:1484
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] → To restore: increase Conditioned Volume or reduce Roof Area
solveGeometry @ Section19.js:1485
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] Final geometry:
   Footprint: 1100.92 m² (d_95 - SACRED)
   Roof area: 1411.52 m² (d_85 - SACRED)
   Roof height: 12.69 m
   Wall height: 5.06 m (COMPRESSED)
   Storey height: 5.06 m
   Wall volume: 5567.18 m³
   Roof volume: 2752.32 m³
   Basement volume: 0.00 m³
   Total volume: 8319.50 m³
 [WOMBAT] Hip: 2 ridge nodes, ridge length=3.16m
 [WOMBAT-2] Polyhedral roof (hip): 2 ridge node(s)
 [WOMBAT-2] Footprint dimensions: width=31.64m, length=34.80m (from aspect ratio)
 🎨 [WOMBAT updateVisualization] SVG element found: true
 🎨 [WOMBAT] Delegating render to wombatRender.js
 [WombatRender-4] Prismatic render called
   Geometry: {footprint: {…}, ridgeOrientation: 'longitudinal', roofType: 'hip', roofHeight: 12.692417706736306, roofVolume: 2752.323856395481, …}
   Mode: target
   Options: {showBelowGrade: false}
 [WombatRender-4] Rendered successfully
 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
 [WOMBAT calculateAll] Complete
 [FieldManager] Called sect19.calculateAll() after d_154 change
 [WOMBAT] Aspect ratio slider changed: d_154 = 0.1
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [WOMBAT calculateAll] Called - Current mode: target, isActivated: true
 [WOMBAT-2] Prismatic solver (Target mode)
 [WOMBAT-2 DEBUG] d_154_raw from state: 0.1 (type: string)
 [WOMBAT-2 DEBUG] aspectRatio calculated: 1.1
 [WOMBAT-2 DEBUG] footprintArea: 1100.92
 [WOMBAT-2 DEBUG] width: 31.635997908021864, length: 34.79959769882405
 [WOMBAT-2] Aspect ratio: 0.1 → 1.10:1 (L:W)
 [WOMBAT-2] Footprint: 31.64m × 34.80m = 1100.92m²
 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³, roof=multiplanar (requested: multiplanar)
 [WOMBAT-2] Footprint: 31.64m (short) × 34.80m (long)
 [WOMBAT-2] Ridge orientation: longitudinal
 [WOMBAT-DEBUG] Testing two formulas:
   v1: u = A/(2L-W) = 1411.52/37.96 = 37.18m
   v2: u = A/(2L) = 1411.52/69.60 = 20.28m
 [WOMBAT-DEBUG] Area verification:
   v1 formula [2(L-W)u + Wu]: 769.92m²
   v2 formula [2(L-W)u + 2W·hipRafter]: 1755.67m²
   Target: 1411.52m²
 [WOMBAT] Hip roof solved algebraically:
   Footprint: 31.64m × 34.80m
   Ridge length: 3.16m
   Roof height: 12.69m
   Roof pitch: 9.6:12 (rise:run ratio)
   Target area: 1411.52m²
   Achieved area: 1755.67m²
   Error: 344.1523m²
   Roof volume: 2752.32m³
 [WOMBAT-2] Roof solved: type=hip, height=12.69m, volume=2752.32m³
 [WOMBAT-2] Foundation type: slab-on-grade
 [WOMBAT-2] Attempting reference wall height:
   Target wall height: 5.15 m (1 × 5.15m from g_106)
   Would give volume: 8422.06 m³
     = Wall volume: 5669.74 m³
     + Roof volume: 2752.32 m³
     + Basement volume: 0.00 m³
   USER TARGET (d_105): 8319.50 m³
 [WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit
solveGeometry @ Section19.js:1482
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
(anonymous) @ Section19.js:2149Understand this warningAI
 [WOMBAT-2] → Wall height reduced: 5.15m → 5.06m
solveGeometry @ Section19.js:1483
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
(anonymous) @ Section19.js:2149Understand this warningAI
 [WOMBAT-2] → Storey height: 5.15m → 5.06m
solveGeometry @ Section19.js:1484
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
(anonymous) @ Section19.js:2149Understand this warningAI
 [WOMBAT-2] → To restore: increase Conditioned Volume or reduce Roof Area
solveGeometry @ Section19.js:1485
calculateTargetModel @ Section19.js:2488
calculateAll @ Section19.js:2549
(anonymous) @ Section19.js:2149Understand this warningAI
 [WOMBAT-2] Final geometry:
   Footprint: 1100.92 m² (d_95 - SACRED)
   Roof area: 1411.52 m² (d_85 - SACRED)
   Roof height: 12.69 m
   Wall height: 5.06 m (COMPRESSED)
   Storey height: 5.06 m
   Wall volume: 5567.18 m³
   Roof volume: 2752.32 m³
   Basement volume: 0.00 m³
   Total volume: 8319.50 m³
 [WOMBAT] Hip: 2 ridge nodes, ridge length=3.16m
 [WOMBAT-2] Polyhedral roof (hip): 2 ridge node(s)
 [WOMBAT-2] Footprint dimensions: width=31.64m, length=34.80m (from aspect ratio)
 [WOMBAT-2] Prismatic solver (Reference mode)
 [WOMBAT-2 DEBUG] d_154_raw from state: 0.0 (type: string)
 [WOMBAT-2 DEBUG] aspectRatio calculated: 1
 [WOMBAT-2 DEBUG] footprintArea: 1100.92
 [WOMBAT-2 DEBUG] width: 33.18011452662574, length: 33.18011452662573
 [WOMBAT-2] Aspect ratio: 0.0 → 1.00:1 (L:W)
 [WOMBAT-2] Footprint: 33.18m × 33.18m = 1100.92m²
 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³, roof=flat (requested: flat)
 [WOMBAT-2] Footprint: 33.18m (short) × 33.18m (long)
 [WOMBAT-2] Ridge orientation: transverse
 [WOMBAT-2] Roof solved: type=flat, height=0.00m, volume=0.00m³
 [WOMBAT-2] Foundation type: slab-on-grade
 [WOMBAT-2] Attempting reference wall height:
   Target wall height: 5.15 m (1 × 5.15m from g_106)
   Would give volume: 5669.74 m³
     = Wall volume: 5669.74 m³
     + Roof volume: 0.00 m³
     + Basement volume: 0.00 m³
   USER TARGET (d_105): 8319.50 m³
 [WOMBAT-2] ✓ Using reference wall height (volume within budget)
 [WOMBAT-2] Final geometry:
   Footprint: 1100.92 m² (d_95 - SACRED)
   Roof area: 1411.52 m² (d_85 - SACRED)
   Roof height: 0.00 m
   Wall height: 5.15 m (reference)
   Storey height: 5.15 m
   Wall volume: 5669.74 m³
   Roof volume: 0.00 m³
   Basement volume: 0.00 m³
   Total volume: 5669.74 m³
 [WOMBAT-2] Prismatic roof: profile=flat, extrusion=33.18m
 [WOMBAT-2] Footprint dimensions: width=33.18m, length=33.18m (from aspect ratio)
 [WOMBAT calculateAll] Updating visualization for mode: target
 🎨 [WOMBAT updateVisualization] Called with mode="target"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = false
 [WOMBAT-2] Prismatic solver (Target mode)
 [WOMBAT-2 DEBUG] d_154_raw from state: 0.1 (type: string)
 [WOMBAT-2 DEBUG] aspectRatio calculated: 1.1
 [WOMBAT-2 DEBUG] footprintArea: 1100.92
 [WOMBAT-2 DEBUG] width: 31.635997908021864, length: 34.79959769882405
 [WOMBAT-2] Aspect ratio: 0.1 → 1.10:1 (L:W)
 [WOMBAT-2] Footprint: 31.64m × 34.80m = 1100.92m²
 [WOMBAT-2] Inputs: footprint=1100.92m², volume=8319.50m³, roof=multiplanar (requested: multiplanar)
 [WOMBAT-2] Footprint: 31.64m (short) × 34.80m (long)
 [WOMBAT-2] Ridge orientation: longitudinal
 [WOMBAT-DEBUG] Testing two formulas:
   v1: u = A/(2L-W) = 1411.52/37.96 = 37.18m
   v2: u = A/(2L) = 1411.52/69.60 = 20.28m
 [WOMBAT-DEBUG] Area verification:
   v1 formula [2(L-W)u + Wu]: 769.92m²
   v2 formula [2(L-W)u + 2W·hipRafter]: 1755.67m²
   Target: 1411.52m²
 [WOMBAT] Hip roof solved algebraically:
   Footprint: 31.64m × 34.80m
   Ridge length: 3.16m
   Roof height: 12.69m
   Roof pitch: 9.6:12 (rise:run ratio)
   Target area: 1411.52m²
   Achieved area: 1755.67m²
   Error: 344.1523m²
   Roof volume: 2752.32m³
 [WOMBAT-2] Roof solved: type=hip, height=12.69m, volume=2752.32m³
 [WOMBAT-2] Foundation type: slab-on-grade
 [WOMBAT-2] Attempting reference wall height:
   Target wall height: 5.15 m (1 × 5.15m from g_106)
   Would give volume: 8422.06 m³
     = Wall volume: 5669.74 m³
     + Roof volume: 2752.32 m³
     + Basement volume: 0.00 m³
   USER TARGET (d_105): 8319.50 m³
 [WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit
solveGeometry @ Section19.js:1482
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
(anonymous) @ Section19.js:2149Understand this warningAI
 [WOMBAT-2] → Wall height reduced: 5.15m → 5.06m
solveGeometry @ Section19.js:1483
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
(anonymous) @ Section19.js:2149Understand this warningAI
 [WOMBAT-2] → Storey height: 5.15m → 5.06m
solveGeometry @ Section19.js:1484
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
(anonymous) @ Section19.js:2149Understand this warningAI
 [WOMBAT-2] → To restore: increase Conditioned Volume or reduce Roof Area
solveGeometry @ Section19.js:1485
updateVisualization @ Section19.js:1650
calculateAll @ Section19.js:2559
(anonymous) @ Section19.js:2149Understand this warningAI
 [WOMBAT-2] Final geometry:
Section19.js:1505   Footprint: 1100.92 m² (d_95 - SACRED)
Section19.js:1506   Roof area: 1411.52 m² (d_85 - SACRED)
Section19.js:1507   Roof height: 12.69 m
Section19.js:1508   Wall height: 5.06 m (COMPRESSED)
Section19.js:1509   Storey height: 5.06 m
Section19.js:1513   Wall volume: 5567.18 m³
Section19.js:1514   Roof volume: 2752.32 m³
Section19.js:1515   Basement volume: 0.00 m³
Section19.js:1516   Total volume: 8319.50 m³
Section19.js:1261 [WOMBAT] Hip: 2 ridge nodes, ridge length=3.16m
Section19.js:1554 [WOMBAT-2] Polyhedral roof (hip): 2 ridge node(s)
Section19.js:1555 [WOMBAT-2] Footprint dimensions: width=31.64m, length=34.80m (from aspect ratio)
Section19.js:1655 🎨 [WOMBAT updateVisualization] SVG element found: true
Section19.js:1662 🎨 [WOMBAT] Delegating render to wombatRender.js
wombatRender.js:154 [WombatRender-4] Prismatic render called
wombatRender.js:155   Geometry: {footprint: {…}, ridgeOrientation: 'longitudinal', roofType: 'hip', roofHeight: 12.692417706736306, roofVolume: 2752.323856395481, …}
wombatRender.js:156   Mode: target
wombatRender.js:157   Options: {showBelowGrade: false}
wombatRender.js:339 [WombatRender-4] Rendered successfully
Section19.js:2563 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
Section19.js:204 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
Section19.js:2567 [WOMBAT calculateAll] Complete