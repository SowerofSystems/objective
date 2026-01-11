🔬 Tetrahedron Face Winding Order Test
Testing base tetrahedron and geodesic subdivisions for correct face winding.

═══════════════════════════════════════
Testing: Base Tetrahedron
Total Faces: 4

✅ Correct: 2 (50.0%)

❌ Errors: 2

✅ Face 0: [0, 1, 2]
❌ Face 1: [0, 1, 3] - Face 1 has INWARD-pointing normal (dot=-1.0000)
✅ Face 2: [0, 2, 3]
❌ Face 3: [1, 2, 3] - Face 3 has INWARD-pointing normal (dot=-1.0000)
Face 1: vertices [0, 1, 3] Face 1 has INWARD-pointing normal (dot=-1.0000) Dot product: -1.000000 Face normal: (0.5774, -0.5774, 0.5774) Outward dir: (-0.5774, 0.5774, -0.5774) Face 3: vertices [1, 2, 3] Face 3 has INWARD-pointing normal (dot=-1.0000) Dot product: -1.000000 Face normal: (-0.5774, -0.5774, -0.5774) Outward dir: (0.5774, 0.5774, 0.5774)
❌ FAIL: 2 face(s) need correction

═══════════════════════════════════════
Testing: Dual Tetrahedron
Total Faces: 4

✅ Correct: 2 (50.0%)

❌ Errors: 2

❌ Face 0: [0, 1, 2] - Face 0 has INWARD-pointing normal (dot=-1.0000)
✅ Face 1: [0, 1, 3]
❌ Face 2: [0, 2, 3] - Face 2 has INWARD-pointing normal (dot=-1.0000)
✅ Face 3: [1, 2, 3]
Face 0: vertices [0, 1, 2] Face 0 has INWARD-pointing normal (dot=-1.0000) Dot product: -1.000000 Face normal: (0.5774, 0.5774, 0.5774) Outward dir: (-0.5774, -0.5774, -0.5774) Face 2: vertices [0, 2, 3] Face 2 has INWARD-pointing normal (dot=-1.0000) Dot product: -1.000000 Face normal: (-0.5774, 0.5774, -0.5774) Outward dir: (0.5774, -0.5774, 0.5774)
❌ FAIL: 2 face(s) need correction

═══════════════════════════════════════
Testing: Geodesic Tetrahedron (freq=1)
Total Faces: 4

✅ Correct: 2 (50.0%)

❌ Errors: 2

✅ Face 0: [0, 1, 2]
❌ Face 1: [0, 1, 3] - Face 1 has INWARD-pointing normal (dot=-1.0000)
✅ Face 2: [0, 2, 3]
❌ Face 3: [1, 2, 3] - Face 3 has INWARD-pointing normal (dot=-1.0000)
Face 1: vertices [0, 1, 3] Face 1 has INWARD-pointing normal (dot=-1.0000) Dot product: -1.000000 Face normal: (0.5774, -0.5774, 0.5774) Outward dir: (-0.5774, 0.5774, -0.5774) Face 3: vertices [1, 2, 3] Face 3 has INWARD-pointing normal (dot=-1.0000) Dot product: -1.000000 Face normal: (-0.5774, -0.5774, -0.5774) Outward dir: (0.5774, 0.5774, 0.5774)
❌ FAIL: 2 face(s) need correction

═══════════════════════════════════════
Testing: Geodesic Tetrahedron (freq=2)
Total Faces: 16

✅ Correct: 8 (50.0%)

❌ Errors: 8

✅ Face 0: [0, 4, 5]
✅ Face 1: [4, 6, 5]
✅ Face 2: [4, 1, 6]
✅ Face 3: [5, 6, 2]
❌ Face 4: [0, 4, 7] - Face 4 has INWARD-pointing normal (dot=-0.9045)
❌ Face 5: [4, 8, 7] - Face 5 has INWARD-pointing normal (dot=-1.0000)
❌ Face 6: [4, 1, 8] - Face 6 has INWARD-pointing normal (dot=-0.9045)
❌ Face 7: [7, 8, 3] - Face 7 has INWARD-pointing normal (dot=-0.9045)
✅ Face 8: [0, 5, 7]
✅ Face 9: [5, 9, 7]
✅ Face 10: [5, 2, 9]
✅ Face 11: [7, 9, 3]
❌ Face 12: [1, 6, 8] - Face 12 has INWARD-pointing normal (dot=-0.9045)
❌ Face 13: [6, 9, 8] - Face 13 has INWARD-pointing normal (dot=-1.0000)
❌ Face 14: [6, 2, 9] - Face 14 has INWARD-pointing normal (dot=-0.9045)
❌ Face 15: [8, 9, 3] - Face 15 has INWARD-pointing normal (dot=-0.9045)
Face 4: vertices [0, 4, 7] Face 4 has INWARD-pointing normal (dot=-0.9045) Dot product: -0.904534 Face normal: (0.6947, -0.1862, 0.6947) Outward dir: (-0.6846, -0.2506, -0.6846) Face 5: vertices [4, 8, 7] Face 5 has INWARD-pointing normal (dot=-1.0000) Dot product: -1.000000 Face normal: (0.5774, -0.5774, 0.5774) Outward dir: (-0.5774, 0.5774, -0.5774) Face 6: vertices [4, 1, 8] Face 6 has INWARD-pointing normal (dot=-0.9045) Dot product: -0.904534 Face normal: (0.1862, -0.6947, 0.6947) Outward dir: (0.2506, 0.6846, -0.6846) Face 7: vertices [7, 8, 3] Face 7 has INWARD-pointing normal (dot=-0.9045) Dot product: -0.904534 Face normal: (0.6947, -0.6947, 0.1862) Outward dir: (-0.6846, 0.6846, 0.2506) Face 12: vertices [1, 6, 8] Face 12 has INWARD-pointing normal (dot=-0.9045) Dot product: -0.904534 Face normal: (-0.6947, -0.6947, -0.1862) Outward dir: (0.6846, 0.6846, -0.2506) Face 13: vertices [6, 9, 8] Face 13 has INWARD-pointing normal (dot=-1.0000) Dot product: -1.000000 Face normal: (-0.5774, -0.5774, -0.5774) Outward dir: (0.5774, 0.5774, 0.5774) Face 14: vertices [6, 2, 9] Face 14 has INWARD-pointing normal (dot=-0.9045) Dot product: -0.904534 Face normal: (-0.6947, -0.1862, -0.6947) Outward dir: (0.6846, -0.2506, 0.6846) Face 15: vertices [8, 9, 3] Face 15 has INWARD-pointing normal (dot=-0.9045) Dot product: -0.904534 Face normal: (-0.1862, -0.6947, -0.6947) Outward dir: (-0.2506, 0.6846, 0.6846)
❌ FAIL: 8 face(s) need correction

═══════════════════════════════════════
Testing: Geodesic Tetrahedron (freq=3)
Total Faces: 36

✅ Correct: 18 (50.0%)

❌ Errors: 18

Face 9: vertices [0, 4, 11] Face 9 has INWARD-pointing normal (dot=-0.9533) Dot product: -0.953286 Face normal: (0.7011, 0.1305, 0.7011) Outward dir: (-0.6404, -0.4239, -0.6404) Face 10: vertices [4, 12, 11] Face 10 has INWARD-pointing normal (dot=-0.9987) Dot product: -0.998676 Face normal: (0.7065, -0.0413, 0.7065) Outward dir: (-0.7071, -0.0102, -0.7071) Face 11: vertices [4, 5, 12] Face 11 has INWARD-pointing normal (dot=-0.9987) Dot product: -0.998676 Face normal: (0.2630, -0.2630, 0.9282) Outward dir: (-0.2289, 0.2289, -0.9462) Face 12: vertices [5, 13, 12] Face 12 has INWARD-pointing normal (dot=-0.9987) Dot product: -0.998676 Face normal: (0.0413, -0.7065, 0.7065) Outward dir: (0.0102, 0.7071, -0.7071) Face 13: vertices [5, 1, 13] Face 13 has INWARD-pointing normal (dot=-0.9533) Dot product: -0.953286 Face normal: (-0.1305, -0.7011, 0.7011) Outward dir: (0.4239, 0.6404, -0.6404) Face 14: vertices [11, 12, 14] Face 14 has INWARD-pointing normal (dot=-0.9987) Dot product: -0.998676 Face normal: (0.9282, -0.2630, 0.2630) Outward dir: (-0.9462, 0.2289, -0.2289) Face 15: vertices [12, 15, 14] Face 15 has INWARD-pointing normal (dot=-0.9987) Dot product: -0.998676 Face normal: (0.7065, -0.7065, 0.0413) Outward dir: (-0.7071, 0.7071, 0.0102) Face 16: vertices [12, 13, 15] Face 16 has INWARD-pointing normal (dot=-0.9987) Dot product: -0.998676 Face normal: (0.2630, -0.9282, 0.2630) Outward dir: (-0.2289, 0.9462, -0.2289) Face 17: vertices [14, 15, 3] Face 17 has INWARD-pointing normal (dot=-0.9533) Dot product: -0.953286 Face normal: (0.7011, -0.7011, -0.1305) Outward dir: (-0.6404, 0.6404, 0.4239) Face 27: vertices [1, 8, 13] Face 27 has INWARD-pointing normal (dot=-0.9533) Dot product: -0.953286 Face normal: (-0.7011, -0.7011, 0.1305) Outward dir: (0.6404, 0.6404, -0.4239) Face 28: vertices [8, 19, 13] Face 28 has INWARD-pointing normal (dot=-0.9987) Dot product: -0.998676 Face normal: (-0.7065, -0.7065, -0.0413) Outward dir: (0.7071, 0.7071, -0.0102) Face 29: vertices [8, 10, 19] Face 29 has INWARD-pointing normal (dot=-0.9987) Dot product: -0.998676 Face normal: (-0.9282, -0.2630, -0.2630) Outward dir: (0.9462, 0.2289, 0.2289) Face 30: vertices [10, 17, 19] Face 30 has INWARD-pointing normal (dot=-0.9987) Dot product: -0.998676 Face normal: (-0.7065, -0.0413, -0.7065) Outward dir: (0.7071, -0.0102, 0.7071) Face 31: vertices [10, 2, 17] Face 31 has INWARD-pointing normal (dot=-0.9533) Dot product: -0.953286 Face normal: (-0.7011, 0.1305, -0.7011) Outward dir: (0.6404, -0.4239, 0.6404) Face 32: vertices [13, 19, 15] Face 32 has INWARD-pointing normal (dot=-0.9987) Dot product: -0.998676 Face normal: (-0.2630, -0.9282, -0.2630) Outward dir: (0.2289, 0.9462, 0.2289) Face 33: vertices [19, 18, 15] Face 33 has INWARD-pointing normal (dot=-0.9987) Dot product: -0.998676 Face normal: (-0.0413, -0.7065, -0.7065) Outward dir: (-0.0102, 0.7071, 0.7071) Face 34: vertices [19, 17, 18] Face 34 has INWARD-pointing normal (dot=-0.9987) Dot product: -0.998676 Face normal: (-0.2630, -0.2630, -0.9282) Outward dir: (0.2289, 0.2289, 0.9462) Face 35: vertices [15, 18, 3] Face 35 has INWARD-pointing normal (dot=-0.9533) Dot product: -0.953286 Face normal: (0.1305, -0.7011, -0.7011) Outward dir: (-0.4239, 0.6404, 0.6404)
❌ FAIL: 18 face(s) need correction

═══════════════════════════════════════
Test Summary
❌ FAIL Base Tetrahedron (2/4 correct) ❌ FAIL Dual Tetrahedron (2/4 correct) ❌ FAIL Geodesic Tetrahedron (freq=1) (2/4 correct) ❌ FAIL Geodesic Tetrahedron (freq=2) (8/16 correct) ❌ FAIL Geodesic Tetrahedron (freq=3) (18/36 correct)
⚠️ TESTS FAILED: 5/5 need correction