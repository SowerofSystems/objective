# TGS Version 4 — Embodied Carbon & Energy Targets

## Source Clarification

From **Ryan Zizzo** (Mantle Climate), co-author of the TGS4 guidelines with Kelly Alvarez-Doran:

> Kelly and I created that "Figure 1" you are referring to. The City did not adopt those values as is.

The currently implemented `TYPOLOGY_CAPS` in `BuildingInfoNodes.js` are based on that Figure 1 (varying by material type: stick frame 125, mass timber 250/350, concrete 550, steel 650). **These are NOT the adopted TGS4 values.**

The actual adopted values are on the TGSv4 pages:
- Part 3: https://www.toronto.ca/city-government/planning-development/official-plan-guidelines/toronto-green-standard/toronto-green-standard-version-4/mid-to-high-rise-residential-non-residential-version-4/buildings-energy-emissions-resilience/
- Part 9: https://www.toronto.ca/city-government/planning-development/official-plan-guidelines/toronto-green-standard/toronto-green-standard-version-4/low-rise-residential-version-4/buildings-energy-emissions/
- City-Owned: https://www.toronto.ca/city-government/planning-development/official-plan-guidelines/toronto-green-standard/toronto-green-standard-version-4/city-agency-corporation-division-owned-facilities-version-4/buildings-energy-emissions-resilience/

**The caps do NOT vary by material type** (i.e., steel, concrete, wood all have the same cap).

## Terminology (from Ryan Zizzo)

> The industry uses "embodied" to represent emissions out to the atmosphere, and "storage" to represent what is actually stored / sequestered into a material. We need to get folks comfortable with these terms. Introducing additional ones like "embedded" just adds to the confusion.

**Use:**
- **"embodied"** — emissions released to atmosphere (kgCO2e/m²)
- **"storage"** — carbon sequestered in materials

**Do NOT introduce:** "embedded" or other alternative terms.

## Open Question

> Need to consider whether we update TGS4 and provide a second set of expected/guidance values for practitioners that have never done embodied carbon analysis before to understand some guidance boundaries or not.

---

## Adopted TGS4 Values (from City of Toronto pages)

### Part 3: Mid-to-High-Rise Residential & Non-Residential

#### Operational — GHGI (kgCO2e/m²/yr) — GHG 1.1

| Building Type        | Tier 1 (Mandatory) | Tier 2 | Tier 3 | City-Owned |
|----------------------|--------------------:|-------:|-------:|-----------:|
| All Residential      |                  15 |     10 |      5 |          0 |
| Commercial Office    |                  15 |      8 |      4 |          0 |
| Commercial Retail    |                  10 |      5 |      3 |          0 |

Mixed-use buildings use weighted averages.

#### Operational — TEUI & TEDI (kWh/m²/yr) — GHG 1.2

| Building Type                    | Tier 1 TEUI | Tier 1 TEDI | Tier 2 TEUI | Tier 2 TEDI | Tier 3 TEUI | Tier 3 TEDI |
|----------------------------------|------------:|------------:|------------:|------------:|------------:|------------:|
| MURB (>6 storeys)               |         135 |          50 |         100 |          30 |          75 |          15 |
| MURB (≤6 storeys)               |         130 |          40 |         100 |          25 |          70 |          15 |
| Commercial Office                |         130 |          30 |         100 |          22 |          65 |          15 |
| Commercial Retail                |         120 |          40 |          90 |          25 |          70 |          15 |

#### Embodied Carbon — Upfront (A1-A5) — GHG 2.1 / GHG 2.2

| Category               | Tier 2 (GHG 2.1) | Tier 3 (GHG 2.2) |
|------------------------|------------------:|------------------:|
| Residential/Commercial |    ≤350 kgCO2e/m² |    ≤250 kgCO2e/m² |
| Other building types   |    ≤400 kgCO2e/m² |    ≤275 kgCO2e/m² |

Scope: Structure and envelope only. Caps do NOT vary by material type.

### Part 9: Low-Rise Residential

#### Embodied Carbon — GHG 3.1 (Tier 2)

| Category        | Cap               |
|-----------------|------------------:|
| Low-Rise Res.   |    ≤250 kgCO2e/m² |

Scope: Structural, enclosure, major finish materials. LCA stages A1-A3. BEAM or equivalent tool.

### City-Owned Buildings

#### Operational — GHG 1.1

| Metric | Target          |
|--------|----------------:|
| GHGI   | 0 (net-zero)    |
| TEDI   | ≤30 kWh/m²/yr  |
| TEUI   | ≤100 kWh/m²/yr |

Alternative compliance: 50% better than OBC SB-10 Div 3 (2017), Passive House cert, or CaGBC Zero Carbon cert.

#### Embodied Carbon — GHG 2.1 / GHG 2.2

Same as Part 3:
- GHG 2.1: ≤350 / ≤400 kgCO2e/m²
- GHG 2.2: ≤250 / ≤275 kgCO2e/m²

---

## Impact on Current Code

### `BuildingInfoNodes.js` — `TYPOLOGY_CAPS` (line 136)

Current values (from Figure 1 — NOT adopted):
```javascript
const TYPOLOGY_CAPS = {
  "Pt.9 Res. Stick Frame": 125,
  "Pt.9 Small Mass Timber": 250,
  "Pt.3 Mass Timber": 350,
  "Pt.3 Concrete": 550,
  "Pt.3 Steel": 650,
  "Pt.3 Office": 600,
};
```

These vary by material type and do NOT match the adopted TGS4 caps.

### What the adopted TGS4 caps actually are:

| Scope                               | Tier 2 Cap | Tier 3 Cap |
|--------------------------------------|------------|------------|
| Part 9 Low-Rise Residential          | 250        | —          |
| Part 3 Residential/Commercial        | 350        | 250        |
| Part 3 Other                         | 400        | 275        |
| City-Owned Residential/Commercial    | 350        | 250        |
| City-Owned Other                     | 400        | 275        |

No variation by material type (steel = concrete = wood = same cap).

### Decision Needed

1. **Replace `TYPOLOGY_CAPS`** with actual TGS4 adopted values (by building category + tier, NOT by material type)
2. **Keep Figure 1 values** as optional practitioner guidance (Ryan's open question)
3. **Terminology audit** — ensure "embodied" is used consistently, remove any "embedded" references
