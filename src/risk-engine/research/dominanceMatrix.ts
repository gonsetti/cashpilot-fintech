import { ScenarioResult } from './esDecomposition';

export interface DominanceMatrixCell {
    scenarioA: string;
    scenarioB: string;
    dominates: boolean;
}

export interface ScenarioDominanceReport {
    matrix: Record<string, Record<string, number>>; // 1 if row dominates col, 0 otherwise
    frontierScenarios: string[];
    dominatedScenarios: string[];
}

/**
 * B. SCENARIO DOMINANCE MATRIX
 * A dominates B if A is at least as severe as B in all metrics, and strictly more severe in at least one.
 */
export function computeDominanceMatrix(scenarios: ScenarioResult[]): ScenarioDominanceReport {
    const matrix: Record<string, Record<string, number>> = {};
    const frontierScenarios: string[] = [];
    const dominatedScenarios = new Set<string>();

    // Initialize matrix
    for (const a of scenarios) {
        matrix[a.scenarioId] = {};
        for (const b of scenarios) {
            matrix[a.scenarioId][b.scenarioId] = 0;
        }
    }

    for (let i = 0; i < scenarios.length; i++) {
        for (let j = 0; j < scenarios.length; j++) {
            if (i === j) continue;
            const A = scenarios[i];
            const B = scenarios[j];

            const aCollapse = A.systemicCollapseProbability;
            const bCollapse = B.systemicCollapseProbability;

            const aCvar = A.expectedShortfall;
            const bCvar = B.expectedShortfall;

            const aSeverity = A.severityScore;
            const bSeverity = B.severityScore;

            // Condition for A dominating B
            if (aCollapse >= bCollapse && aCvar >= bCvar && aSeverity >= bSeverity) {
                if (aCollapse > bCollapse || aCvar > bCvar || aSeverity > bSeverity) {
                    matrix[A.scenarioId][B.scenarioId] = 1;
                    dominatedScenarios.add(B.scenarioId);
                }
            }
        }
    }

    // Identify frontier: Scenarios that are NOT dominated by any other
    for (const s of scenarios) {
        if (!dominatedScenarios.has(s.scenarioId)) {
            frontierScenarios.push(s.scenarioId);
        }
    }

    return {
        matrix,
        frontierScenarios,
        dominatedScenarios: Array.from(dominatedScenarios)
    };
}
