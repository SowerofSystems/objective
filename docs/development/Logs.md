Clock.js:163 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
FieldManager.js:210 [FieldManager] Routed d_154=-1 through sect19 ModeManager
Section19.js:2697 [WOMBAT calculateAll] Called - Current mode: target, isActivated: true
Section19.js:1347 [WOMBAT-2] Prismatic solver (Target mode)
Section19.js:1380 [WOMBAT-2 DEBUG] d_154_raw from state: -1 (type: string)
Section19.js:1392 [WOMBAT-2 DEBUG] aspectRatio calculated: 0.5
Section19.js:1393 [WOMBAT-2 DEBUG] footprintArea: 158.82
Section19.js:1399 [WOMBAT-2 DEBUG] width: 17.822457742971366, length: 8.911228871485683
Section19.js:1400 [WOMBAT-2] Aspect ratio: -1.0 → 0.50:1 (L:W)
 [WOMBAT-2] Footprint: 17.82m × 8.91m = 158.82m²
 [WOMBAT-2] Inputs: footprint=158.82m², volume=1475.77m³, roof=biplanar (requested: biplanar)
 [WOMBAT-2] Footprint: 8.91m (short) × 17.82m (long)
 [WOMBAT-2] Ridge orientation: transverse
 [WOMBAT] Gable roof solved from area constraint:
   Roof area: 215.94 m²
   Ridge length: 17.82 m (LONG dimension)
   Triangle base: 8.91 m (SHORT dimension)
   Slope length: 6.06 m
   Roof height: 4.10 m
   Roof pitch: 11.1:12 (rise:run ratio)
   Roof volume: 325.95 m³
   Gable end area (both): 36.58 m²
 [WOMBAT-2] Roof solved: type=gable, height=4.10m, volume=325.95m³
 [WOMBAT-2] Basement geometry:
   Basement wall area (d_94): 152.97 m²
   Basement depth: 2.86 m
   Basement volume: 454.38 m³ (part of conditioned space)
 [WOMBAT-2] Foundation type: full-basement
 [WOMBAT-2] Attempting reference wall height:
   Target wall height: 10.30 m (2 × 5.15m from g_106)
   Would give volume: 2416.18 m³
     = Wall volume: 1635.85 m³
     + Roof volume: 325.95 m³
     + Basement volume: 454.38 m³
   USER TARGET (d_105): 1475.77 m³
 [WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit
solveGeometry @ Section19.js:1590
calculateTargetModel @ Section19.js:2641
calculateAll @ Section19.js:2702
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] → Wall height reduced: 10.30m → 4.38m
solveGeometry @ Section19.js:1593
calculateTargetModel @ Section19.js:2641
calculateAll @ Section19.js:2702
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] → Storey height: 5.15m → 2.19m
solveGeometry @ Section19.js:1596
calculateTargetModel @ Section19.js:2641
calculateAll @ Section19.js:2702
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] → To restore: increase Conditioned Volume or reduce Roof Area
solveGeometry @ Section19.js:1599
calculateTargetModel @ Section19.js:2641
calculateAll @ Section19.js:2702
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] Final geometry:
   Footprint: 158.82 m² (d_95 - SACRED)
   Roof area: 215.94 m² (d_85 - SACRED)
   Roof height: 4.10 m
   Wall height: 4.38 m (COMPRESSED)
   Storey height: 2.19 m
   Basement depth: 2.86 m
   Wall volume: 695.44 m³
   Roof volume: 325.95 m³
   Basement volume: 454.38 m³
   Total volume: 1475.77 m³
 [WOMBAT-2] Prismatic roof: profile=gable, extrusion=17.82m
 [WOMBAT-2] Footprint dimensions: width=17.82m, length=8.91m (from aspect ratio)
 [WOMBAT Windows] Facade "north": edge center (0.00, 8.91)
 [WOMBAT Windows] Facade "east": edge center (4.46, 0.00)
 [WOMBAT Windows] Facade "south": edge center (0.00, -8.91)
 [WOMBAT Windows] Facade "west": edge center (-4.46, 0.00)
 [WOMBAT Windows] Generated 4 window(s)
 [WOMBAT-2] Prismatic solver (Reference mode)
 [WOMBAT-2 DEBUG] d_154_raw from state: 0.0 (type: string)
 [WOMBAT-2 DEBUG] aspectRatio calculated: 1
 [WOMBAT-2 DEBUG] footprintArea: 158.82
 [WOMBAT-2 DEBUG] width: 12.602380727465743, length: 12.602380727465743
 [WOMBAT-2] Aspect ratio: 0.0 → 1.00:1 (L:W)
 [WOMBAT-2] Footprint: 12.60m × 12.60m = 158.82m²
 [WOMBAT-2] Inputs: footprint=158.82m², volume=1475.77m³, roof=flat (requested: flat)
 [WOMBAT-2] Footprint: 12.60m (short) × 12.60m (long)
 [WOMBAT-2] Ridge orientation: longitudinal
 [WOMBAT-2] Roof solved: type=flat, height=0.00m, volume=0.00m³
 [WOMBAT-2] Basement geometry:
   Basement wall area (d_94): 152.97 m²
   Basement depth: 3.03 m
   Basement volume: 481.95 m³ (part of conditioned space)
 [WOMBAT-2] Foundation type: full-basement
 [WOMBAT-2] Attempting reference wall height:
   Target wall height: 10.30 m (2 × 5.15m from g_106)
   Would give volume: 2117.79 m³
     = Wall volume: 1635.85 m³
     + Roof volume: 0.00 m³
     + Basement volume: 481.95 m³
   USER TARGET (d_105): 1475.77 m³
 [WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit
solveGeometry @ Section19.js:1590
calculateReferenceModel @ Section19.js:2669
calculateAll @ Section19.js:2703
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] → Wall height reduced: 10.30m → 6.26m
solveGeometry @ Section19.js:1593
calculateReferenceModel @ Section19.js:2669
calculateAll @ Section19.js:2703
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] → Storey height: 5.15m → 3.13m
solveGeometry @ Section19.js:1596
calculateReferenceModel @ Section19.js:2669
calculateAll @ Section19.js:2703
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] → To restore: increase Conditioned Volume or reduce Roof Area
solveGeometry @ Section19.js:1599
calculateReferenceModel @ Section19.js:2669
calculateAll @ Section19.js:2703
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] Final geometry:
   Footprint: 158.82 m² (d_95 - SACRED)
   Roof area: 215.94 m² (d_85 - SACRED)
   Roof height: 0.00 m
   Wall height: 6.26 m (COMPRESSED)
   Storey height: 3.13 m
   Basement depth: 3.03 m
   Wall volume: 993.82 m³
   Roof volume: 0.00 m³
   Basement volume: 481.95 m³
   Total volume: 1475.77 m³
 [WOMBAT-2] Prismatic roof: profile=flat, extrusion=12.60m
 [WOMBAT-2] Footprint dimensions: width=12.60m, length=12.60m (from aspect ratio)
 [WOMBAT Windows] Facade "north": edge center (0.00, 6.30)
 [WOMBAT Windows] Facade "east": edge center (6.30, 0.00)
 [WOMBAT Windows] Facade "south": edge center (0.00, -6.30)
 [WOMBAT Windows] Facade "west": edge center (-6.30, 0.00)
 [WOMBAT Windows] Generated 4 window(s)
 [WOMBAT calculateAll] Updating visualization for mode: target
 🎨 [WOMBAT updateVisualization] Called with mode="target"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = false
 [WOMBAT-2] Prismatic solver (Target mode)
 [WOMBAT-2 DEBUG] d_154_raw from state: -1 (type: string)
 [WOMBAT-2 DEBUG] aspectRatio calculated: 0.5
 [WOMBAT-2 DEBUG] footprintArea: 158.82
 [WOMBAT-2 DEBUG] width: 17.822457742971366, length: 8.911228871485683
 [WOMBAT-2] Aspect ratio: -1.0 → 0.50:1 (L:W)
 [WOMBAT-2] Footprint: 17.82m × 8.91m = 158.82m²
 [WOMBAT-2] Inputs: footprint=158.82m², volume=1475.77m³, roof=biplanar (requested: biplanar)
 [WOMBAT-2] Footprint: 8.91m (short) × 17.82m (long)
 [WOMBAT-2] Ridge orientation: transverse
 [WOMBAT] Gable roof solved from area constraint:
   Roof area: 215.94 m²
   Ridge length: 17.82 m (LONG dimension)
   Triangle base: 8.91 m (SHORT dimension)
   Slope length: 6.06 m
   Roof height: 4.10 m
   Roof pitch: 11.1:12 (rise:run ratio)
   Roof volume: 325.95 m³
   Gable end area (both): 36.58 m²
 [WOMBAT-2] Roof solved: type=gable, height=4.10m, volume=325.95m³
 [WOMBAT-2] Basement geometry:
   Basement wall area (d_94): 152.97 m²
   Basement depth: 2.86 m
   Basement volume: 454.38 m³ (part of conditioned space)
 [WOMBAT-2] Foundation type: full-basement
 [WOMBAT-2] Attempting reference wall height:
   Target wall height: 10.30 m (2 × 5.15m from g_106)
   Would give volume: 2416.18 m³
     = Wall volume: 1635.85 m³
     + Roof volume: 325.95 m³
     + Basement volume: 454.38 m³
   USER TARGET (d_105): 1475.77 m³
 [WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit
solveGeometry @ Section19.js:1590
updateVisualization @ Section19.js:1803
calculateAll @ Section19.js:2712
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] → Wall height reduced: 10.30m → 4.38m
solveGeometry @ Section19.js:1593
updateVisualization @ Section19.js:1803
calculateAll @ Section19.js:2712
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] → Storey height: 5.15m → 2.19m
solveGeometry @ Section19.js:1596
updateVisualization @ Section19.js:1803
calculateAll @ Section19.js:2712
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] → To restore: increase Conditioned Volume or reduce Roof Area
solveGeometry @ Section19.js:1599
updateVisualization @ Section19.js:1803
calculateAll @ Section19.js:2712
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1017Understand this warningAI
 [WOMBAT-2] Final geometry:
   Footprint: 158.82 m² (d_95 - SACRED)
   Roof area: 215.94 m² (d_85 - SACRED)
   Roof height: 4.10 m
   Wall height: 4.38 m (COMPRESSED)
   Storey height: 2.19 m
   Basement depth: 2.86 m
   Wall volume: 695.44 m³
   Roof volume: 325.95 m³
   Basement volume: 454.38 m³
   Total volume: 1475.77 m³
 [WOMBAT-2] Prismatic roof: profile=gable, extrusion=17.82m
 [WOMBAT-2] Footprint dimensions: width=17.82m, length=8.91m (from aspect ratio)
 [WOMBAT Windows] Facade "north": edge center (0.00, 8.91)
 [WOMBAT Windows] Facade "east": edge center (4.46, 0.00)
 [WOMBAT Windows] Facade "south": edge center (0.00, -8.91)
 [WOMBAT Windows] Facade "west": edge center (-4.46, 0.00)
 [WOMBAT Windows] Generated 4 window(s)
 🎨 [WOMBAT updateVisualization] SVG element found: true
 🎨 [WOMBAT] Delegating render to wombatRender.js
 [WombatRender-4] Prismatic render called
   Geometry: {footprint: {…}, width: 17.822457742971366, length: 8.911228871485683, wallHeight: 4.378783776416554, ridgeOrientation: 'transverse', …}
   Mode: target
   Options: {showBelowGrade: false}
 [WombatRender] Rendering 4 window(s)
 [WombatRender-4] Rendered successfully
 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
 [WOMBAT calculateAll] Complete
 [FieldManager] Called sect19.calculateAll() after d_154 change
 [WOMBAT] Aspect ratio slider changed: d_154 = -1
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [WOMBAT calculateAll] Called - Current mode: target, isActivated: true
 [WOMBAT-2] Prismatic solver (Target mode)
 [WOMBAT-2 DEBUG] d_154_raw from state: -1 (type: string)
 [WOMBAT-2 DEBUG] aspectRatio calculated: 0.5
 [WOMBAT-2 DEBUG] footprintArea: 158.82
 [WOMBAT-2 DEBUG] width: 17.822457742971366, length: 8.911228871485683
 [WOMBAT-2] Aspect ratio: -1.0 → 0.50:1 (L:W)
 [WOMBAT-2] Footprint: 17.82m × 8.91m = 158.82m²
 [WOMBAT-2] Inputs: footprint=158.82m², volume=1475.77m³, roof=biplanar (requested: biplanar)
 [WOMBAT-2] Footprint: 8.91m (short) × 17.82m (long)
 [WOMBAT-2] Ridge orientation: transverse
 [WOMBAT] Gable roof solved from area constraint:
   Roof area: 215.94 m²
   Ridge length: 17.82 m (LONG dimension)
   Triangle base: 8.91 m (SHORT dimension)
   Slope length: 6.06 m
   Roof height: 4.10 m
   Roof pitch: 11.1:12 (rise:run ratio)
   Roof volume: 325.95 m³
   Gable end area (both): 36.58 m²
 [WOMBAT-2] Roof solved: type=gable, height=4.10m, volume=325.95m³
 [WOMBAT-2] Basement geometry:
   Basement wall area (d_94): 152.97 m²
   Basement depth: 2.86 m
   Basement volume: 454.38 m³ (part of conditioned space)
 [WOMBAT-2] Foundation type: full-basement
 [WOMBAT-2] Attempting reference wall height:
   Target wall height: 10.30 m (2 × 5.15m from g_106)
   Would give volume: 2416.18 m³
     = Wall volume: 1635.85 m³
     + Roof volume: 325.95 m³
     + Basement volume: 454.38 m³
   USER TARGET (d_105): 1475.77 m³
 [WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit
solveGeometry @ Section19.js:1590
calculateTargetModel @ Section19.js:2641
calculateAll @ Section19.js:2702
(anonymous) @ Section19.js:2302Understand this warningAI
 [WOMBAT-2] → Wall height reduced: 10.30m → 4.38m
solveGeometry @ Section19.js:1593
calculateTargetModel @ Section19.js:2641
calculateAll @ Section19.js:2702
(anonymous) @ Section19.js:2302Understand this warningAI
 [WOMBAT-2] → Storey height: 5.15m → 2.19m
solveGeometry @ Section19.js:1596
calculateTargetModel @ Section19.js:2641
calculateAll @ Section19.js:2702
(anonymous) @ Section19.js:2302Understand this warningAI
 [WOMBAT-2] → To restore: increase Conditioned Volume or reduce Roof Area
solveGeometry @ Section19.js:1599
calculateTargetModel @ Section19.js:2641
calculateAll @ Section19.js:2702
(anonymous) @ Section19.js:2302Understand this warningAI
 [WOMBAT-2] Final geometry:
   Footprint: 158.82 m² (d_95 - SACRED)
   Roof area: 215.94 m² (d_85 - SACRED)
   Roof height: 4.10 m
   Wall height: 4.38 m (COMPRESSED)
   Storey height: 2.19 m
   Basement depth: 2.86 m
   Wall volume: 695.44 m³
   Roof volume: 325.95 m³
   Basement volume: 454.38 m³
   Total volume: 1475.77 m³
 [WOMBAT-2] Prismatic roof: profile=gable, extrusion=17.82m
 [WOMBAT-2] Footprint dimensions: width=17.82m, length=8.91m (from aspect ratio)
 [WOMBAT Windows] Facade "north": edge center (0.00, 8.91)
 [WOMBAT Windows] Facade "east": edge center (4.46, 0.00)
 [WOMBAT Windows] Facade "south": edge center (0.00, -8.91)
 [WOMBAT Windows] Facade "west": edge center (-4.46, 0.00)
 [WOMBAT Windows] Generated 4 window(s)
 [WOMBAT-2] Prismatic solver (Reference mode)
 [WOMBAT-2 DEBUG] d_154_raw from state: 0.0 (type: string)
 [WOMBAT-2 DEBUG] aspectRatio calculated: 1
 [WOMBAT-2 DEBUG] footprintArea: 158.82
 [WOMBAT-2 DEBUG] width: 12.602380727465743, length: 12.602380727465743
 [WOMBAT-2] Aspect ratio: 0.0 → 1.00:1 (L:W)
 [WOMBAT-2] Footprint: 12.60m × 12.60m = 158.82m²
 [WOMBAT-2] Inputs: footprint=158.82m², volume=1475.77m³, roof=flat (requested: flat)
 [WOMBAT-2] Footprint: 12.60m (short) × 12.60m (long)
 [WOMBAT-2] Ridge orientation: longitudinal
 [WOMBAT-2] Roof solved: type=flat, height=0.00m, volume=0.00m³
 [WOMBAT-2] Basement geometry:
   Basement wall area (d_94): 152.97 m²
   Basement depth: 3.03 m
   Basement volume: 481.95 m³ (part of conditioned space)
 [WOMBAT-2] Foundation type: full-basement
 [WOMBAT-2] Attempting reference wall height:
   Target wall height: 10.30 m (2 × 5.15m from g_106)
   Would give volume: 2117.79 m³
     = Wall volume: 1635.85 m³
     + Roof volume: 0.00 m³
     + Basement volume: 481.95 m³
   USER TARGET (d_105): 1475.77 m³
 [WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit
solveGeometry @ Section19.js:1590
calculateReferenceModel @ Section19.js:2669
calculateAll @ Section19.js:2703
(anonymous) @ Section19.js:2302Understand this warningAI
 [WOMBAT-2] → Wall height reduced: 10.30m → 6.26m
solveGeometry @ Section19.js:1593
calculateReferenceModel @ Section19.js:2669
calculateAll @ Section19.js:2703
(anonymous) @ Section19.js:2302Understand this warningAI
 [WOMBAT-2] → Storey height: 5.15m → 3.13m
solveGeometry @ Section19.js:1596
calculateReferenceModel @ Section19.js:2669
calculateAll @ Section19.js:2703
(anonymous) @ Section19.js:2302Understand this warningAI
 [WOMBAT-2] → To restore: increase Conditioned Volume or reduce Roof Area
solveGeometry @ Section19.js:1599
calculateReferenceModel @ Section19.js:2669
calculateAll @ Section19.js:2703
(anonymous) @ Section19.js:2302Understand this warningAI
 [WOMBAT-2] Final geometry:
   Footprint: 158.82 m² (d_95 - SACRED)
   Roof area: 215.94 m² (d_85 - SACRED)
   Roof height: 0.00 m
   Wall height: 6.26 m (COMPRESSED)
   Storey height: 3.13 m
   Basement depth: 3.03 m
   Wall volume: 993.82 m³
   Roof volume: 0.00 m³
   Basement volume: 481.95 m³
   Total volume: 1475.77 m³
 [WOMBAT-2] Prismatic roof: profile=flat, extrusion=12.60m
 [WOMBAT-2] Footprint dimensions: width=12.60m, length=12.60m (from aspect ratio)
 [WOMBAT Windows] Facade "north": edge center (0.00, 6.30)
 [WOMBAT Windows] Facade "east": edge center (6.30, 0.00)
 [WOMBAT Windows] Facade "south": edge center (0.00, -6.30)
 [WOMBAT Windows] Facade "west": edge center (-6.30, 0.00)
 [WOMBAT Windows] Generated 4 window(s)
 [WOMBAT calculateAll] Updating visualization for mode: target
 🎨 [WOMBAT updateVisualization] Called with mode="target"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = false
 [WOMBAT-2] Prismatic solver (Target mode)
 [WOMBAT-2 DEBUG] d_154_raw from state: -1 (type: string)
 [WOMBAT-2 DEBUG] aspectRatio calculated: 0.5
 [WOMBAT-2 DEBUG] footprintArea: 158.82
 [WOMBAT-2 DEBUG] width: 17.822457742971366, length: 8.911228871485683
 [WOMBAT-2] Aspect ratio: -1.0 → 0.50:1 (L:W)
 [WOMBAT-2] Footprint: 17.82m × 8.91m = 158.82m²
 [WOMBAT-2] Inputs: footprint=158.82m², volume=1475.77m³, roof=biplanar (requested: biplanar)
 [WOMBAT-2] Footprint: 8.91m (short) × 17.82m (long)
 [WOMBAT-2] Ridge orientation: transverse
 [WOMBAT] Gable roof solved from area constraint:
   Roof area: 215.94 m²
   Ridge length: 17.82 m (LONG dimension)
   Triangle base: 8.91 m (SHORT dimension)
   Slope length: 6.06 m
   Roof height: 4.10 m
   Roof pitch: 11.1:12 (rise:run ratio)
   Roof volume: 325.95 m³
   Gable end area (both): 36.58 m²
 [WOMBAT-2] Roof solved: type=gable, height=4.10m, volume=325.95m³
 [WOMBAT-2] Basement geometry:
   Basement wall area (d_94): 152.97 m²
   Basement depth: 2.86 m
   Basement volume: 454.38 m³ (part of conditioned space)
 [WOMBAT-2] Foundation type: full-basement
 [WOMBAT-2] Attempting reference wall height:
   Target wall height: 10.30 m (2 × 5.15m from g_106)
   Would give volume: 2416.18 m³
     = Wall volume: 1635.85 m³
     + Roof volume: 325.95 m³
     + Basement volume: 454.38 m³
   USER TARGET (d_105): 1475.77 m³
 [WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit
solveGeometry @ Section19.js:1590
updateVisualization @ Section19.js:1803
calculateAll @ Section19.js:2712
(anonymous) @ Section19.js:2302Understand this warningAI
 [WOMBAT-2] → Wall height reduced: 10.30m → 4.38m
solveGeometry @ Section19.js:1593
updateVisualization @ Section19.js:1803
calculateAll @ Section19.js:2712
(anonymous) @ Section19.js:2302Understand this warningAI
 [WOMBAT-2] → Storey height: 5.15m → 2.19m
solveGeometry @ Section19.js:1596
updateVisualization @ Section19.js:1803
calculateAll @ Section19.js:2712
(anonymous) @ Section19.js:2302Understand this warningAI
 [WOMBAT-2] → To restore: increase Conditioned Volume or reduce Roof Area
solveGeometry @ Section19.js:1599
updateVisualization @ Section19.js:1803
calculateAll @ Section19.js:2712
(anonymous) @ Section19.js:2302Understand this warningAI
 [WOMBAT-2] Final geometry:
   Footprint: 158.82 m² (d_95 - SACRED)
   Roof area: 215.94 m² (d_85 - SACRED)
   Roof height: 4.10 m
   Wall height: 4.38 m (COMPRESSED)
   Storey height: 2.19 m
   Basement depth: 2.86 m
Section19.js:1636   Wall volume: 695.44 m³
Section19.js:1637   Roof volume: 325.95 m³
Section19.js:1638   Basement volume: 454.38 m³
Section19.js:1639   Total volume: 1475.77 m³
Section19.js:1698 [WOMBAT-2] Prismatic roof: profile=gable, extrusion=17.82m
Section19.js:1701 [WOMBAT-2] Footprint dimensions: width=17.82m, length=8.91m (from aspect ratio)
wombatWindows.js:234 [WOMBAT Windows] Facade "north": edge center (0.00, 8.91)
wombatWindows.js:234 [WOMBAT Windows] Facade "east": edge center (4.46, 0.00)
wombatWindows.js:234 [WOMBAT Windows] Facade "south": edge center (0.00, -8.91)
wombatWindows.js:234 [WOMBAT Windows] Facade "west": edge center (-4.46, 0.00)
wombatWindows.js:434 [WOMBAT Windows] Generated 4 window(s)
Section19.js:1808 🎨 [WOMBAT updateVisualization] SVG element found: true
Section19.js:1815 🎨 [WOMBAT] Delegating render to wombatRender.js
wombatRender.js:160 [WombatRender-4] Prismatic render called
wombatRender.js:161   Geometry: {footprint: {…}, width: 17.822457742971366, length: 8.911228871485683, wallHeight: 4.378783776416554, ridgeOrientation: 'transverse', …}
wombatRender.js:162   Mode: target
wombatRender.js:163   Options: {showBelowGrade: false}
wombatRender.js:788 [WombatRender] Rendering 4 window(s)
wombatRender.js:356 [WombatRender-4] Rendered successfully
Section19.js:2716 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
Section19.js:204 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
Section19.js:2720 [WOMBAT calculateAll] Complete
StateManager.js:714 [StateManager] Saved 251 imported fields to localStorage