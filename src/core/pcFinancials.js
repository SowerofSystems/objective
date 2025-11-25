/**
 * pcFinancials.js
 * Financial calculations for Parallel Coordinates (Section 18)
 *
 * PRO VERSION ONLY - This file should be excluded from Base version
 *
 * Calculates cost impact (CAD$) for each optimization axis
 * Architecture: Separate module that ParallelCoordinates.js conditionally uses
 *
 * TEUI Calculator 4.012
 */

window.TEUI = window.TEUI || {};

window.TEUI.pcFinancials = (function () {
  'use strict';

  const StateManager = window.TEUI.StateManager;

  /**
   * Helper function to get value from StateManager
   * @param {string} key - Field ID (e.g., 'j_51', 'ref_j_51')
   * @returns {number} Parsed float value or 0 if invalid
   */
  const getValue = (key) => {
    if (!StateManager) {
      console.warn('pcFinancials: StateManager not available');
      return 0;
    }
    const val = StateManager.getValue(key);

    // Strip currency formatting ($, commas) before parsing
    // Handles: "$0.1300", "$1,234.56", "12828.144"
    const cleanVal = typeof val === 'string' ? val.replace(/[$,]/g, '') : val;

    const numVal = parseFloat(cleanVal);
    return (typeof numVal === 'number' && !isNaN(numVal)) ? numVal : 0;
  };

  /**
   * Financial calculations per axis
   * Each axis has three functions: target(), reference(), savings()
   */
  const calculations = {

    /**
     * SHW% - Service Hot Water Efficiency
     * Cost = (Electric × Rate) + (Gas × Rate) + (Oil × Rate)
     * Handles all three fuel types - whichever is 0 contributes $0
     */
    shw_efficiency: {
      target: () => {
        const electricEnergy = getValue('k_51');    // Net SHW electric demand (kWh) - TARGET
        const electricRate = getValue('l_12');      // Electricity cost ($/kWh) - TARGET
        const gasEnergy = getValue('e_51');         // SHW gas energy (kWh) - TARGET
        const gasRate = getValue('l_13');           // Gas cost ($/kWh) - TARGET
        const oilVolume = getValue('k_54');         // SHW oil volume (litres) - TARGET
        const oilRate = getValue('l_16');           // Oil cost ($/litre) - TARGET

        return (electricEnergy * electricRate) + (gasEnergy * gasRate) + (oilVolume * oilRate);
      },
      reference: () => {
        const electricEnergy = getValue('ref_k_51'); // Net SHW electric demand (kWh) - REFERENCE
        const electricRate = getValue('ref_l_12');   // Electricity cost ($/kWh) - REFERENCE
        const gasEnergy = getValue('ref_e_51');      // SHW gas energy (kWh) - REFERENCE
        const gasRate = getValue('ref_l_13');        // Gas cost ($/kWh) - REFERENCE
        const oilVolume = getValue('ref_k_54');      // SHW oil volume (litres) - REFERENCE
        const oilRate = getValue('ref_l_16');        // Oil cost ($/litre) - REFERENCE

        return (electricEnergy * electricRate) + (gasEnergy * gasRate) + (oilVolume * oilRate);
      },
      savings: function() {
        const delta = this.reference() - this.target();
        return delta > 0 ? delta : 0; // Only show positive savings, $0 if cost increases
      }
    },

    /**
     * DWHR% - Drain Water Heat Recovery
     * Cost = SHW Cost × (DWHR% / 100)
     * Shows dollar value of energy RECOVERED by DWHR
     * If DWHR = 0%, recovery = $0 (no benefit)
     * If DWHR = 50%, recovery = 50% of SHW cost saved
     */
    dwhr_efficiency: {
      target: () => {
        // Get SHW cost (same calculation as shw_efficiency.target)
        const shwCost = calculations.shw_efficiency.target();

        // Get DWHR efficiency (stored as percentage: 0-100)
        const dwhrPercent = getValue('d_53'); // DWHR% - TARGET

        // Calculate recovery value: cost = SHW cost × (DWHR%/100)
        return shwCost * (dwhrPercent / 100);
      },
      reference: () => {
        // Get SHW cost (same calculation as shw_efficiency.reference)
        const shwCost = calculations.shw_efficiency.reference();

        // Get DWHR efficiency (stored as percentage: 0-100)
        const dwhrPercent = getValue('ref_d_53'); // DWHR% - REFERENCE

        // Calculate recovery value: cost = SHW cost × (DWHR%/100)
        return shwCost * (dwhrPercent / 100);
      },
      savings: function() {
        // For DWHR%, savings = additional recovery value in Target vs Reference
        // Higher DWHR% = more recovery = lower energy cost
        const targetRecovery = this.target();
        const refRecovery = this.reference();

        // If Target recovers more energy than Reference, show the additional savings
        const delta = targetRecovery - refRecovery;
        return delta > 0 ? delta : 0;
      }
    },

    /**
     * nGains% - Net Useable Internal Gains
     * TODO: Add formula when provided
     */
    net_gains: {
      target: () => 0,
      reference: () => 0,
      savings: () => 0
    },

    /**
     * TB% - Thermal Bridging Penalty
     * TODO: Add formula when provided
     */
    thermal_bridge: {
      target: () => 0,
      reference: () => 0,
      savings: () => 0
    },

    /**
     * Ag - Aggregate Ground U-value
     * TODO: Add formula when provided
     */
    aggregate_ground_uvalue: {
      target: () => 0,
      reference: () => 0,
      savings: () => 0
    },

    /**
     * Ae - Aggregate Air U-value
     * TODO: Add formula when provided
     */
    aggregate_air_uvalue: {
      target: () => 0,
      reference: () => 0,
      savings: () => 0
    },

    /**
     * NRL50 - Normalized Airtightness
     * TODO: Add formula when provided
     */
    normalized_airtightness: {
      target: () => 0,
      reference: () => 0,
      savings: () => 0
    },

    /**
     * WWR - Window-to-Wall Ratio
     * TODO: Add formula when provided
     */
    window_wall_ratio: {
      target: () => 0,
      reference: () => 0,
      savings: () => 0
    },

    /**
     * HEAT% - Heating System Efficiency
     * TODO: Add formula when provided
     */
    heating_efficiency: {
      target: () => 0,
      reference: () => 0,
      savings: () => 0
    },

    /**
     * MVHR% - Mechanical Ventilation Heat Recovery
     * TODO: Add formula when provided
     */
    mvhr_efficiency: {
      target: () => 0,
      reference: () => 0,
      savings: () => 0
    },

    /**
     * TEDI - Thermal Energy Demand Intensity
     * TODO: Add formula when provided
     */
    tedi: {
      target: () => 0,
      reference: () => 0,
      savings: () => 0
    },

    /**
     * TELI - Thermal Envelope Loss Intensity
     * TODO: Add formula when provided
     */
    teli: {
      target: () => 0,
      reference: () => 0,
      savings: () => 0
    },

    /**
     * GHGI - Greenhouse Gas Intensity
     * TODO: Add formula when provided
     */
    ghgi: {
      target: () => 0,
      reference: () => 0,
      savings: () => 0
    },

    /**
     * TEUI - Total Energy Use Intensity
     * TODO: Add formula when provided
     */
    teui: {
      target: () => 0,
      reference: () => 0,
      savings: () => 0
    }

  };

  /**
   * Public API: Calculate financial cost for a specific axis and mode
   * @param {string} axisId - Axis identifier (e.g., 'shw_efficiency')
   * @param {string} mode - Calculation mode: 'target', 'reference', or 'savings'
   * @returns {object} { cost: number } - Cost in CAD$
   */
  function calculateFinancials(axisId, mode = 'target') {
    const calc = calculations[axisId];

    if (!calc) {
      console.warn(`pcFinancials: No calculation defined for axis "${axisId}"`);
      return { cost: 0 };
    }

    try {
      if (mode === 'target') {
        return { cost: calc.target() };
      } else if (mode === 'reference') {
        return { cost: calc.reference() };
      } else if (mode === 'savings') {
        return { cost: calc.savings() };
      } else {
        console.warn(`pcFinancials: Invalid mode "${mode}". Use 'target', 'reference', or 'savings'.`);
        return { cost: 0 };
      }
    } catch (error) {
      console.error(`pcFinancials: Error calculating ${axisId} (${mode}):`, error);
      return { cost: 0 };
    }
  }

  // Public API
  return {
    calculateFinancials,
  };

})();
