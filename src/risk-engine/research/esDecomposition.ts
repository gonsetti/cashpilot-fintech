import { SimulationResult } from '../models/SimulationResult';
import { Bank } from '../models/Bank';

export interface ESContribution {
    bankId: string;
    conditionalDefaultFrequency: number;
    contributionIndex: number;
    normalizedContribution: number;
}

export interface ScenarioResult extends SimulationResult {
    scenarioId: string;
    severityScore: number;
}

/**
 * A. EXPECTED SHORTFALL CONTRIBUTION DECOMPOSITION
 */
export function decomposeExpectedShortfall(
    scenario: ScenarioResult,
    totalSimulations: number
): ESContribution[] {
    const alphaThreshold = scenario.VaR;

    // In our specific tracking, we couldn't track individual bank defaults per simulation run
    // in v2 memory efficiently. Since we are restricted to NOT modify the backend/engine, 
    // we must estimate conditional default frequency using global default probability
    // scaled by systemic collapse probability as an analytical proxy requested by the constraint.

    // P(Default | Loss > VaR) ≈ P(Default) * (CollapseProb / 0.05)
    // This is mathematically bounded since 0.05 is the tail size for VaR 95.
    const tailRatio = Math.max(0.001, 0.05);
    const systemicMultiplier = scenario.systemicCollapseProbability / tailRatio;

    let totalContribution = 0;
    const contributions: ESContribution[] = [];

    for (const [bankId, defaultNormalized] of Object.entries(scenario.defaultCounts)) {
        // Analytical proxy for Conditional Default Frequency
        const cdf = Math.min(1.0, defaultNormalized * systemicMultiplier);

        const contributionIndex = cdf * defaultNormalized;
        totalContribution += contributionIndex;

        contributions.push({
            bankId,
            conditionalDefaultFrequency: cdf,
            contributionIndex,
            normalizedContribution: 0 // Will assign next
        });
    }

    // Normalize
    if (totalContribution > 0) {
        contributions.forEach(c => c.normalizedContribution = c.contributionIndex / totalContribution);
    }

    return contributions.sort((a, b) => b.normalizedContribution - a.normalizedContribution);
}
