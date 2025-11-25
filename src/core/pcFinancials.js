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
    const numVal = parseFloat(val);
    return (typeof numVal === 'number' && !isNaN(numVal)) ? numVal : 0;
  };

  /**
   * Financial calculations per axis
   * Each axis has three functions: target(), reference(), savings()
   */
  const calculations = {

    /**
     * SHW% - Service Hot Water Efficiency
     * Cost = Energy (kWh) × Electricity Rate ($/kWh)
     */
    shw_efficiency: {
      target: () => {
        const energy = getValue('j_51');      // Total SHW energy (kWh) - TARGET
        const rate = getValue('l_12');        // Electricity cost ($/kWh) - TARGET
        return energy * rate;                 // Target cost ($)
      },
      reference: () => {
        const energy = getValue('ref_j_51');  // Total SHW energy (kWh) - REFERENCE
        const rate = getValue('ref_l_12');    // Electricity cost ($/kWh) - REFERENCE
        return energy * rate;                 // Reference cost ($)
      },
      savings: function() {
        return this.reference() - this.target(); // Savings ($) - positive when optimized
      }
    },

    /**
     * DWHR% - Drain Water Heat Recovery
     * TODO: Add formula when provided
     */
    dwhr_efficiency: {
      target: () => 0,
      reference: () => 0,
      savings: () => 0
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
