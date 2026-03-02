/**
 * SCIL - Sovereign Capital Intelligence Layer
 * Domain Model: Simulation Scenario
 * Represents boundaries and multipliers for Monte Carlo stress tests.
 */

export interface SimulationScenario {
    /** Label for the scenario (e.g., 'Aggressive Contagion', 'Base Case') */
    name: string;

    /** Number of Monte Carlo iterations to execute */
    iterations: number;

    /** Range multiplier for Revenue (e.g., [0.8, 1.2] means -20% to +20%) */
    revenueShockRange: [number, number];

    /** Range multiplier for ongoing Costs/Burn */
    costShockRange: [number, number];

    /** Simulated global interest rate hike (%) to discount liquidity models */
    interestRateHikeBase: number;

    /** Probability (0.0 to 1.0) of a black swan zero-revenue month for any node */
    blackSwanProbability: number;

    /** Depth in months for the simulation projection */
    horizonMonths: number;
}
