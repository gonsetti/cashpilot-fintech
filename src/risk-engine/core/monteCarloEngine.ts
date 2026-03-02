import { Bank } from "../models/Bank";
import { SimulationResult } from "../models/SimulationResult";
import { SimulationConfig } from "../config/simulationConfig";
import { studentTShock } from "./shockGenerator";
import { generateCorrelatedShocks } from "./correlation";
import { runContagion } from "./contagionEngine";
import { SeededRNG } from "./seededRNG";

export function runSimulation(
    initialBanks: Bank[],
    correlationMatrix: number[][],
    config: SimulationConfig
): SimulationResult {

    const losses: number[] = [];
    let systemicCollapses = 0;

    let totalTimeToCollapse = 0;
    const defaultCounts: Record<string, number> = {};
    initialBanks.forEach(b => defaultCounts[b.id] = 0);

    const rng = config.seed !== undefined ? new SeededRNG(config.seed) : null;
    const random = () => rng ? rng.next() : Math.random();

    for (let i = 0; i < config.iterations; i++) {

        const banks: Bank[] = structuredClone(initialBanks);
        let collapsedMonth = -1;

        for (let month = 0; month < config.horizonMonths; month++) {

            const shocks = banks.map(() =>
                studentTShock(config.studentT_df, random)
            );

            const correlated = generateCorrelatedShocks(
                correlationMatrix,
                shocks
            );

            banks.forEach((bank, idx) => {
                bank.capital += bank.capital * correlated[idx];
            });

            if (random() < config.systemicShockProbability) {
                banks.forEach(bank => {
                    bank.capital *= (1 - config.systemicShockMagnitude);
                });
            }

            runContagion(banks, config.defaultThreshold);

            const totalCapital = banks.reduce((sum, b) => sum + Math.max(0, b.capital), 0);
            const threshold = config.systemicCollapseThreshold ?? 0;

            if (totalCapital <= threshold && collapsedMonth === -1) {
                collapsedMonth = month + 1;
            }

            const alive = banks.filter(b => b.capital > 0).length;

            if (alive === 0) {
                if (collapsedMonth === -1) collapsedMonth = month + 1;
                break; // Early exit on total failure
            }
        }

        // Tracking defaults at end of iteration path
        banks.forEach(b => {
            if (b.capital <= 0) {
                defaultCounts[b.id]++;
            }
        });

        if (collapsedMonth !== -1) {
            systemicCollapses++;
            totalTimeToCollapse += collapsedMonth;
        }

        const totalInitial = initialBanks.reduce(
            (sum, b) => sum + b.initialCapital,
            0
        );

        const totalFinal = banks.reduce(
            (sum, b) => sum + Math.max(0, b.capital),
            0
        );

        losses.push(totalInitial - totalFinal);
    }

    // Distribution
    const systemicLossDistribution = [...losses];

    losses.sort((a, b) => a - b);

    const varIndex = Math.floor(
        (1 - config.confidenceLevel) * losses.length
    );
    const VaR = losses[varIndex];

    // Calculate CVaR (Expected Shortfall)
    let tailLossesSum = 0;
    const tailCount = losses.length - varIndex;
    for (let i = varIndex; i < losses.length; i++) {
        tailLossesSum += losses[i];
    }
    const expectedShortfall = tailCount > 0 ? tailLossesSum / tailCount : 0;

    // Normalize defaults
    const normalizedDefaultCounts: Record<string, number> = {};
    for (const id in defaultCounts) {
        normalizedDefaultCounts[id] = defaultCounts[id] / config.iterations;
    }

    return {
        VaR,
        systemicCollapseProbability: systemicCollapses / config.iterations,
        losses,
        expectedShortfall,
        defaultCounts: normalizedDefaultCounts,
        systemicLossDistribution,
        averageTimeToCollapse: systemicCollapses > 0 ? totalTimeToCollapse / systemicCollapses : 0,
        collapseFrequency: systemicCollapses / config.iterations
    };
}
