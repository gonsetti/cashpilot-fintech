import { CapitalGraph } from './capitalGraph';
import { SimulationScenario } from '../models/SimulationScenario';
import { calculateSystemicFragilityIndex } from './fragilityIndex';

export interface MonteCarloOutput {
    survivalProbability: number;
    valueAtRisk: number;
    expectedShortfall: number;
    worstCaseLiquidity: number;
    skewness: number;
    kurtosis: number;
    averageFragility: number;
}

// PRNG: Mulberry32 for deterministic seeding reproducibility
function mulberry32(a: number) {
    return function () {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// Box-Muller Transform for exact Normal Distribution
function generateNormal(rng: () => number, mean: number = 0, stdDev: number = 1): number {
    let u1 = rng();
    let u2 = rng();
    if (u1 <= 1e-8) u1 = 1e-8;
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
}

/**
 * CP Monte Carlo Engine - Quant Rewrite
 * 50,000+ Iterations using One-Factor Correlated Macro Model.
 */
export async function runMonteCarlo(
    initialGraph: CapitalGraph,
    scenario: SimulationScenario,
    seed: number = 99999
): Promise<MonteCarloOutput> {
    const ITERATIONS = Math.max(scenario.iterations || 50000, 50000);
    const rng = mulberry32(seed);

    let survivedRuns = 0;
    let totalFragility = 0;
    const endLiquidities = new Float64Array(ITERATIONS);

    const initialNetworkLiquidity = initialGraph.getNetworkLiquidityBuffer();

    for (let i = 0; i < ITERATIONS; i++) {
        // Deep clone graph for true structural simulation
        const currentGraph = initialGraph.clone();

        // Systemic Macro Factor ~ N(0, 1)
        const macroFactor = generateNormal(rng, 0, 1);
        let networkLiquidity = 0;

        for (const [entityId, entity] of currentGraph.entities) {
            // Beta correlation. Default 0.5 if unassigned.
            const beta = entity.beta ?? 0.5;

            // Idiosyncratic Shock ~ N(0, 1)
            const idiosyncraticShock = generateNormal(rng, 0, 1);

            // One-Factor Copula equation
            const entityShock = (beta * macroFactor) + (Math.sqrt(1 - Math.pow(beta, 2)) * idiosyncraticShock);
            const blackSwan = rng() < scenario.blackSwanProbability;

            // Apply strict shock bounded by standard deviations
            const revStdDev = (scenario.revenueShockRange[1] - scenario.revenueShockRange[0]) / 4;
            const revMultiplier = Math.max(0, 1 + (entityShock * revStdDev));

            const costStdDev = (scenario.costShockRange[1] - scenario.costShockRange[0]) / 4;
            const costMultiplier = Math.max(0, 1 + (Math.abs(entityShock) * costStdDev));

            const rev = blackSwan ? 0 : entity.revenue * revMultiplier;
            const cost = entity.monthlyBurn * costMultiplier * (1 + scenario.interestRateHikeBase);

            const endingLiquidity = entity.liquidity + ((rev - cost) * scenario.horizonMonths);

            entity.liquidity = endingLiquidity;
            networkLiquidity += endingLiquidity;
        }

        endLiquidities[i] = networkLiquidity;

        if (networkLiquidity > 0) {
            survivedRuns++;
        }

        // Exact recalculation of systemic fragility post-shock
        totalFragility += calculateSystemicFragilityIndex(currentGraph);
    }

    // Sort outputs for VaR and ES
    endLiquidities.sort();

    // Distribution moments
    let sum = 0;
    for (let i = 0; i < ITERATIONS; i++) sum += endLiquidities[i];
    const mean = sum / ITERATIONS;

    let variance = 0, skewnessNum = 0, kurtosisNum = 0;
    for (let i = 0; i < ITERATIONS; i++) {
        const diff = endLiquidities[i] - mean;
        variance += Math.pow(diff, 2);
        skewnessNum += Math.pow(diff, 3);
        kurtosisNum += Math.pow(diff, 4);
    }
    variance /= ITERATIONS;
    const stdDev = Math.sqrt(variance);
    const skewness = stdDev === 0 ? 0 : (skewnessNum / ITERATIONS) / Math.pow(stdDev, 3);
    const kurtosis = stdDev === 0 ? 0 : (kurtosisNum / ITERATIONS) / Math.pow(stdDev, 4);

    // VaR 95%
    const varIndex = Math.floor(ITERATIONS * 0.05);
    const valueAtRisk = initialNetworkLiquidity - endLiquidities[varIndex];

    // Expected Shortfall 95%
    let esSum = 0;
    for (let i = 0; i <= varIndex; i++) {
        esSum += (initialNetworkLiquidity - endLiquidities[i]);
    }
    const expectedShortfall = esSum / (varIndex + 1);

    return {
        survivalProbability: (survivedRuns / ITERATIONS) * 100,
        valueAtRisk: Math.max(0, valueAtRisk),
        expectedShortfall: Math.max(0, expectedShortfall),
        worstCaseLiquidity: endLiquidities[0],
        skewness,
        kurtosis,
        averageFragility: totalFragility / ITERATIONS
    };
}
