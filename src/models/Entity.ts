/**
 * SCIL - Sovereign Capital Intelligence Layer
 * Domain Model: Entity
 * Represents a discrete holding, subsidiary, or financial node in the Capital Graph.
 */

export interface Entity {
    id: string;
    name: string;
    liquidity: number;
    monthlyBurn: number;
    revenue: number;
    debt: number;
    equity: number;
    volatility: number;
    riskScore: number;

    /** Systemic correlation factor (0 to 1) */
    beta: number;
}
