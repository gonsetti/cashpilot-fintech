export interface SimulationConfig {
    iterations: number;
    horizonMonths: number;
    confidenceLevel: number;
    studentT_df: number;
    systemicShockProbability: number;
    systemicShockMagnitude: number;
    defaultThreshold: number;

    /** Systemic Collapse Liquidity Threshold */
    systemicCollapseThreshold?: number;

    /** Seed for deterministic RNG */
    seed?: number;
}
