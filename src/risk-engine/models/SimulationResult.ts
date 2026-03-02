export interface SimulationResult {
    VaR: number;
    systemicCollapseProbability: number;
    losses: number[];

    expectedShortfall: number;
    defaultCounts: Record<string, number>;
    systemicLossDistribution: number[];
    averageTimeToCollapse: number;
    collapseFrequency: number;
}
