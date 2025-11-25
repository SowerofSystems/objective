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
     * Cost = Value of avoided heating energy (kWh) in dollars
     * Higher nGains% = more avoided heating = more savings
     * No fuel detection needed - whichever fuel is 0 contributes $0
     */
    net_gains: {
      target: () => {
        const internalGains = getValue('i_80');    // Avoided heating (thermal kWh) - TARGET
        const heatingDemand = getValue('d_114');   // Total heating demand (kWh) - TARGET

        if (heatingDemand === 0) return 0; // No heating system

        // Get heating system fuel volume for oil (from Section 13)
        const oilHeatingL = getValue('f_115');     // Oil heating (litres) - TARGET

        // Get fuel rates (same as SHW%)
        const electricRate = getValue('l_12');     // $/kWh
        const gasRate = getValue('l_13');          // $/kWh
        const oilRate = getValue('l_16');          // $/litre

        // Calculate avoided cost based on heating fuel type (same pattern as SHW%)
        // Whichever fuel is 0 contributes $0
        const electricCost = internalGains * electricRate;
        const gasCost = internalGains * gasRate;

        // For oil: convert thermal kWh to litres, then apply rate
        // d_114 thermal kWh requires f_115 litres
        const oilLitresPerKWh = heatingDemand > 0 ? oilHeatingL / heatingDemand : 0;
        const oilLitres = internalGains * oilLitresPerKWh;
        const oilCost = oilLitres * oilRate;

        // Sum all three (only one will be non-zero)
        return electricCost + gasCost + oilCost;
      },
      reference: () => {
        const internalGains = getValue('ref_i_80');
        const heatingDemand = getValue('ref_d_114');

        if (heatingDemand === 0) return 0;

        const oilHeatingL = getValue('ref_f_115');
        const electricRate = getValue('ref_l_12');
        const gasRate = getValue('ref_l_13');
        const oilRate = getValue('ref_l_16');

        const electricCost = internalGains * electricRate;
        const gasCost = internalGains * gasRate;

        const oilLitresPerKWh = heatingDemand > 0 ? oilHeatingL / heatingDemand : 0;
        const oilLitres = internalGains * oilLitresPerKWh;
        const oilCost = oilLitres * oilRate;

        return electricCost + gasCost + oilCost;
      },
      savings: function() {
        // TODO: VERIFY LOGIC WITH ANDY (Nov 24 late evening discovery)
        // nGains% is percentage-based, not absolute
        // Same % but different heating demands = different dollar amounts
        // Example: Both 40% nGains, but Ref (lossy) avoids $31k, Target (efficient) avoids $29k
        // Question: Should savings be Ref - Target (showing cost of lower heating demand)?
        // Or should nGains% not have savings at all?
        // Current implementation: Target - Reference (reversed pattern)
        const delta = this.target() - this.reference();
        return delta > 0 ? delta : 0;
      }
    },

    /**
     * TB% - Thermal Bridging Penalty
     * Cost = Value of heat loss through thermal bridges (kWh) in dollars
     * Lower TB% = less heat loss = better performance
     * Uses same fuel cost calculation as nGains%
     */
    thermal_bridge: {
      target: () => {
        const thermalBridgingLoss = getValue('i_97');    // TB heat loss (thermal kWh) - TARGET
        const heatingDemand = getValue('d_114');         // Total heating demand (kWh) - TARGET

        if (heatingDemand === 0) return 0; // No heating system

        // Get heating system fuel volume for oil (from Section 13)
        const oilHeatingL = getValue('f_115');           // Oil heating (litres) - TARGET

        // Get fuel rates (same as SHW% and nGains%)
        const electricRate = getValue('l_12');           // $/kWh
        const gasRate = getValue('l_13');                // $/kWh
        const oilRate = getValue('l_16');                // $/litre

        // Calculate cost based on heating fuel type (same pattern as nGains%)
        // Whichever fuel is 0 contributes $0
        const electricCost = thermalBridgingLoss * electricRate;
        const gasCost = thermalBridgingLoss * gasRate;

        // For oil: convert thermal kWh to litres, then apply rate
        const oilLitresPerKWh = heatingDemand > 0 ? oilHeatingL / heatingDemand : 0;
        const oilLitres = thermalBridgingLoss * oilLitresPerKWh;
        const oilCost = oilLitres * oilRate;

        // Sum all three (only one will be non-zero)
        return electricCost + gasCost + oilCost;
      },
      reference: () => {
        const thermalBridgingLoss = getValue('ref_i_97');
        const heatingDemand = getValue('ref_d_114');

        if (heatingDemand === 0) return 0;

        const oilHeatingL = getValue('ref_f_115');
        const electricRate = getValue('ref_l_12');
        const gasRate = getValue('ref_l_13');
        const oilRate = getValue('ref_l_16');

        const electricCost = thermalBridgingLoss * electricRate;
        const gasCost = thermalBridgingLoss * gasRate;

        const oilLitresPerKWh = heatingDemand > 0 ? oilHeatingL / heatingDemand : 0;
        const oilLitres = thermalBridgingLoss * oilLitresPerKWh;
        const oilCost = oilLitres * oilRate;

        return electricCost + gasCost + oilCost;
      },
      savings: function() {
        // TB% represents heat LOSS (cost), not benefit
        // Lower TB% = less cost = better, so use standard pattern (like SHW%)
        const delta = this.reference() - this.target();
        return delta > 0 ? delta : 0;
      }
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
