/**
 * InternalGainsNodes.test.js - Unit tests for Section 09 lookup tables
 *
 * Tests generated from Parnas tables:
 * - docs/parnas-tables/internal-gains/equipment-density.json
 * - docs/parnas-tables/internal-gains/building-type-lookup.json
 */

// Mock graph for testing
function createMockGraph() {
  const nodes = {};
  const inputs = {};

  return {
    registerInputs: (inputList) => {
      inputList.forEach(input => {
        inputs[input.id] = input;
      });
    },
    registerNode: (node) => {
      nodes[node.id] = node;
    },
    getNode: (id) => nodes[id],
    getInput: (id) => inputs[id],
    nodes,
    inputs
  };
}

// Load the module (assumes browser environment with window)
// For Node.js testing, you'd need to modify the module or use jsdom

describe('InternalGainsNodes', () => {
  let graph;
  let InternalGains;

  beforeAll(() => {
    // In browser: window.TEUI.ComputationNodes.InternalGains
    // This test file assumes the module is loaded
    InternalGains = window.TEUI?.ComputationNodes?.InternalGains;
    if (!InternalGains) {
      throw new Error('InternalGainsNodes module not loaded');
    }
  });

  beforeEach(() => {
    graph = createMockGraph();
    InternalGains.register(graph);
  });

  // ===========================================================================
  // formatBuildingTypeForLookup tests (from building-type-lookup.json)
  // ===========================================================================
  describe('formatBuildingTypeForLookup', () => {
    const format = InternalGains.formatBuildingTypeForLookup;

    test('returns key as-is if already valid', () => {
      expect(format('D-Business')).toBe('D-Business');
      expect(format('C-Residential')).toBe('C-Residential');
      expect(format('A-Assembly')).toBe('A-Assembly');
    });

    test('parses full description with dash', () => {
      expect(format('D - Business and Personal Service')).toBe('D-Business');
      expect(format('A - Assembly')).toBe('A-Assembly');
      expect(format('F - Industrial')).toBe('F-Industrial');
    });

    test('parses full description with en-dash', () => {
      expect(format('C – Residential')).toBe('C-Residential');
    });

    test('parses B categories correctly', () => {
      expect(format('B1 - Detention')).toBe('B1-Detention');
      expect(format('B2 - Care')).toBe('B2-Care');
      expect(format('B3 - Detention Care')).toBe('B3-DetentionCare');
    });

    test('handles first letter fallback', () => {
      expect(format('D')).toBe('D-Business');
      expect(format('C')).toBe('C-Residential');
      expect(format('F')).toBe('F-Industrial');
    });

    test('defaults to A-Assembly for unknown types', () => {
      expect(format('Unknown Type')).toBe('A-Assembly');
      expect(format('')).toBe('A-Assembly');
      expect(format(null)).toBe('A-Assembly');
      expect(format(undefined)).toBe('A-Assembly');
    });

    test('handles B category edge cases', () => {
      expect(format('B')).toBe('B3-DetentionCare'); // Default B
      expect(format('B - Something')).toBe('B3-DetentionCare');
    });
  });

  // ===========================================================================
  // Equipment Density Lookup tests (from equipment-density.json)
  // ===========================================================================
  describe('EQUIPMENT_LOADS_TABLE lookup', () => {
    const table = InternalGains.EQUIPMENT_LOADS_TABLE;

    test('C-Residential, Regular, No Elevators = 5.0', () => {
      expect(table['C-Residential']['Regular']['No Elevators']).toBe(5.0);
    });

    test('C-Residential, Efficient, No Elevators = 3.0', () => {
      expect(table['C-Residential']['Efficient']['No Elevators']).toBe(3.0);
    });

    test('D-Business, Regular, Elevators = 10.0', () => {
      expect(table['D-Business']['Regular']['Elevators']).toBe(10.0);
    });

    test('B2-Care, Regular, Elevators = 25.0 (high load)', () => {
      expect(table['B2-Care']['Regular']['Elevators']).toBe(25.0);
    });

    test('Efficient always <= Regular for same config', () => {
      Object.keys(table).forEach(buildingType => {
        ['Elevators', 'No Elevators'].forEach(elevator => {
          const regular = table[buildingType]['Regular'][elevator];
          const efficient = table[buildingType]['Efficient'][elevator];
          expect(efficient).toBeLessThanOrEqual(regular);
        });
      });
    });

    test('Elevators always >= No Elevators for same config', () => {
      Object.keys(table).forEach(buildingType => {
        ['Regular', 'Efficient'].forEach(efficiency => {
          const withElev = table[buildingType][efficiency]['Elevators'];
          const noElev = table[buildingType][efficiency]['No Elevators'];
          expect(withElev).toBeGreaterThanOrEqual(noElev);
        });
      });
    });
  });

  // ===========================================================================
  // Computed Node tests
  // ===========================================================================
  describe('internal.equipmentDensity computation', () => {
    test('computes correct density for C-Residential, Regular, No Elevators', () => {
      const node = graph.getNode('internal.equipmentDensity');
      const result = node.compute({
        'internal.buildingTypeLookupKey': 'C-Residential',
        'internal.equipmentEfficiency': 'Regular',
        'internal.elevatorStatus': 'No Elevators'
      });
      expect(result).toBe(5.0);
    });

    test('computes correct density for D-Business, Efficient, Elevators', () => {
      const node = graph.getNode('internal.equipmentDensity');
      const result = node.compute({
        'internal.buildingTypeLookupKey': 'D-Business',
        'internal.equipmentEfficiency': 'Efficient',
        'internal.elevatorStatus': 'Elevators'
      });
      expect(result).toBe(7.0);
    });

    test('returns default 5.0 for unknown building type', () => {
      const node = graph.getNode('internal.equipmentDensity');
      const result = node.compute({
        'internal.buildingTypeLookupKey': 'Unknown',
        'internal.equipmentEfficiency': 'Regular',
        'internal.elevatorStatus': 'No Elevators'
      });
      expect(result).toBe(5.0);
    });
  });

  describe('internal.plugLoadDensity computation', () => {
    test('computes correct density for C-Residential', () => {
      const node = graph.getNode('internal.plugLoadDensity');
      const result = node.compute({
        'internal.buildingTypeLookupKey': 'C-Residential',
        'internal.equipmentEfficiency': 'Regular',
        'internal.elevatorStatus': 'No Elevators'
      });
      expect(result).toBe(7.0);
    });
  });

  // ===========================================================================
  // Annual energy calculation tests
  // ===========================================================================
  describe('internal.equipment.annual computation', () => {
    test('calculates annual equipment energy correctly', () => {
      const node = graph.getNode('internal.equipment.annual');
      // (watts × area × hours) / 1000
      // (5 W/m² × 150 m² × 4380 hr) / 1000 = 3285 kWh/yr
      const result = node.compute({
        'internal.equipmentDensity': 5,
        'building.conditionedFloorArea': 150,
        'occupancy.occupiedHours': 4380
      });
      expect(result).toBe(3285);
    });
  });

  describe('energy.plugLoads.subtotal computation', () => {
    test('sums plug, lighting, and equipment annual', () => {
      const node = graph.getNode('energy.plugLoads.subtotal');
      const result = node.compute({
        'internal.plugLoads.annual': 4599,
        'internal.lighting.annual': 986,
        'internal.equipment.annual': 1972
      });
      expect(result).toBe(7557);
    });
  });

  // ===========================================================================
  // Seasonal split tests (from heating-season-gains.json, cooling-season-load.json)
  // ===========================================================================
  describe('internal.heatingGains computation', () => {
    test('calculates heating season fraction correctly', () => {
      const node = graph.getNode('internal.heatingGains');
      // (h_70 + h_64 + d_54) × (365 - m_19) / 365
      // (7500 + 2000 + 500) × (365 - 120) / 365 = 6712.33
      const result = node.compute({
        'energy.plugLoads.subtotal': 7500,
        'internal.occupants.annual': 2000,
        'waterHeating.systemLosses': 500,
        'climate.coolingDays': 120
      });
      expect(result).toBeCloseTo(6712.33, 1);
    });

    test('returns full annual when no cooling days', () => {
      const node = graph.getNode('internal.heatingGains');
      const result = node.compute({
        'energy.plugLoads.subtotal': 7500,
        'internal.occupants.annual': 2000,
        'waterHeating.systemLosses': 500,
        'climate.coolingDays': 0
      });
      expect(result).toBe(10000);
    });
  });

  describe('internal.coolingLoad.occupants computation', () => {
    test('calculates cooling season fraction correctly', () => {
      const node = graph.getNode('internal.coolingLoad.occupants');
      // (h_70 + h_64 + d_54) × m_19 / 365
      // (7500 + 2000 + 500) × 120 / 365 = 3287.67
      const result = node.compute({
        'energy.plugLoads.subtotal': 7500,
        'internal.occupants.annual': 2000,
        'waterHeating.systemLosses': 500,
        'climate.coolingDays': 120
      });
      expect(result).toBeCloseTo(3287.67, 1);
    });

    test('returns zero when no cooling days', () => {
      const node = graph.getNode('internal.coolingLoad.occupants');
      const result = node.compute({
        'energy.plugLoads.subtotal': 7500,
        'internal.occupants.annual': 2000,
        'waterHeating.systemLosses': 500,
        'climate.coolingDays': 0
      });
      expect(result).toBe(0);
    });

    test('heating + cooling = total annual (conservation)', () => {
      const heatingNode = graph.getNode('internal.heatingGains');
      const coolingNode = graph.getNode('internal.coolingLoad.occupants');

      const inputs = {
        'energy.plugLoads.subtotal': 7500,
        'internal.occupants.annual': 2000,
        'waterHeating.systemLosses': 500,
        'climate.coolingDays': 120
      };

      const heating = heatingNode.compute(inputs);
      const cooling = coolingNode.compute(inputs);
      const total = 7500 + 2000 + 500;

      expect(heating + cooling).toBeCloseTo(total, 5);
    });
  });
});

// ===========================================================================
// Case Study Validation Tests
// ===========================================================================
describe('Case Study Validation', () => {
  // These test cases should be populated from actual case study data
  // to validate the lookup tables produce correct results

  const caseStudies = [
    {
      name: 'Residential Single Family',
      inputs: {
        buildingType: 'C-Residential',
        efficiency: 'Regular',
        elevators: 'No Elevators',
        area: 150,
        occupiedHours: 4380
      },
      expected: {
        equipmentDensity: 5.0,
        plugDensity: 7.0,
        // Add expected h_67, h_65 values from case study
      }
    },
    {
      name: 'Office Building with Elevators',
      inputs: {
        buildingType: 'D-Business',
        efficiency: 'Efficient',
        elevators: 'Elevators',
        area: 5000,
        occupiedHours: 2920
      },
      expected: {
        equipmentDensity: 7.0,
        plugDensity: 6.0,
      }
    },
    {
      name: 'Care Facility',
      inputs: {
        buildingType: 'B2-Care',
        efficiency: 'Regular',
        elevators: 'Elevators',
        area: 2000,
        occupiedHours: 8760
      },
      expected: {
        equipmentDensity: 25.0,
        plugDensity: 12.0,
      }
    }
  ];

  caseStudies.forEach(cs => {
    test(`${cs.name}: equipment density = ${cs.expected.equipmentDensity}`, () => {
      const table = window.TEUI?.ComputationNodes?.InternalGains?.EQUIPMENT_LOADS_TABLE;
      if (!table) return; // Skip if module not loaded

      const result = table[cs.inputs.buildingType]?.[cs.inputs.efficiency]?.[cs.inputs.elevators];
      expect(result).toBe(cs.expected.equipmentDensity);
    });
  });
});
