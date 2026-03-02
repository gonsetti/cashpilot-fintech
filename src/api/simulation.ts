import { exportActiveGraph } from './capital';
import { runMonteCarlo, MonteCarloOutput } from '../core/monteCarloEngine';
import { SimulationScenario } from '../models/SimulationScenario';
import { GovernanceAudit } from '../core/governance';
import { createScenarioPackId, getEngineVersion, createReportFingerprint, ReportFingerprint } from '../risk-engine/audit/reportFingerprint';
import { SAFETY_LIMITS } from '../config/safetyLimits';

export interface SimulationRequestPayload {
    scenarioName: string;
    iterations: number;
    revenueShockRange: [number, number];
    costShockRange: [number, number];
    interestRateHikeBase: number;
    blackSwanProbability: number;
    horizonMonths: number;
}

export type ExtendedMonteCarloOutput = MonteCarloOutput & {
    fingerprint: ReportFingerprint;
    scenarioPackId: string;
    engineVersion: string;
    resultHash: string;
    runtimeMs?: number;
};

function runWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeout = new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout under UI safety policy.")), ms);
    });
    return Promise.race([promise, timeout]);
}

/**
 * POST /simulation/run
 * Executes a Monte Carlo stochastic engine loop over the capital graph topology.
 */
export async function executeSimulation(payload: SimulationRequestPayload): Promise<ExtendedMonteCarloOutput> {
    if (payload.iterations > SAFETY_LIMITS.MAX_UI_ITERATIONS) {
        throw new Error(`Safety Limit Triggered: Iterations exceed ${SAFETY_LIMITS.MAX_UI_ITERATIONS}`);
    }
    if (payload.horizonMonths > SAFETY_LIMITS.MAX_UI_HORIZON_MONTHS) {
        throw new Error(`Safety Limit Triggered: Horizon exceeds ${SAFETY_LIMITS.MAX_UI_HORIZON_MONTHS} months`);
    }

    const t0 = performance.now();
    const graph = exportActiveGraph();

    const scenario: SimulationScenario = {
        name: payload.scenarioName,
        iterations: payload.iterations,
        revenueShockRange: payload.revenueShockRange,
        costShockRange: payload.costShockRange,
        interestRateHikeBase: payload.interestRateHikeBase,
        blackSwanProbability: payload.blackSwanProbability,
        horizonMonths: payload.horizonMonths
    };

    const results = await runWithTimeout(
        runMonteCarlo(graph, scenario),
        SAFETY_LIMITS.MAX_RUNTIME_MS
    );

    const runtimeMs = Math.round(performance.now() - t0);

    const scenarioPackId = createScenarioPackId({
        scenarios: [{ name: scenario.name }],
        config: {
            iterations: scenario.iterations,
            horizonMonths: scenario.horizonMonths,
            revenueShockRange: scenario.revenueShockRange,
            costShockRange: scenario.costShockRange,
            interestRateHikeBase: scenario.interestRateHikeBase,
            blackSwanProbability: scenario.blackSwanProbability
        },
        correlationMatrix: []
    });

    const engineVersion = getEngineVersion();

    const fingerprint = createReportFingerprint({
        scenarioPackId,
        engineVersion,
        seed: 99999, // default seed used in runMonteCarlo currently
        result: results as any // Map safely
    });

    const extendedResults: ExtendedMonteCarloOutput = {
        ...results,
        fingerprint,
        scenarioPackId,
        engineVersion,
        resultHash: fingerprint.resultHash,
        runtimeMs
    };

    // Deep log into structural ledger
    await GovernanceAudit.logEvent('SIMULATION_RUN', {
        scenarioParams: scenario,
        yield: {
            survivalProbability: results.survivalProbability,
            valueAtRisk: results.valueAtRisk
        },
        fingerprint,
        scenarioPackId,
        engineVersion,
        resultHash: fingerprint.resultHash,
        runtimeMs
    });

    return extendedResults;
}

