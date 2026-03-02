import { SimulationResult } from "../models/SimulationResult";
import { stableHash } from "../../utils/stableHash";
import { TransparencyParams, ModelAssumption, ModelLimit } from "../../trust/modelTransparency";

export type EvidencePack = {
    meta: {
        scenarioPackId: string;
        engineVersion: string;
        seed?: number;
        createdAtISO: string;
        resultHash: string;
    };
    executiveSnapshot: {
        systemicRegime?: string;
        stressLevel?: string;
        collapseProbability?: number;
        var95?: number;
        cvar95?: number;
        capitalPressureIndex?: number;
        totalSimulations?: number;
    };
    scenarios: {
        name: string;
        result: SimulationResult;
    }[];
    research?: unknown;
    recommendations?: unknown;
    executiveOnePager?: string;
    trust?: {
        trustStatement: string;
        excelComparison: string;
        params: TransparencyParams;
        assumptions: ModelAssumption[];
        limits: ModelLimit[];
    };
    fingerprints: {
        scenarioPackId: string;
        resultHash: string;
    };
};

export function buildExecutiveSnapshot(input: {
    scenarios: { name: string; result: SimulationResult }[];
    regulatorySummary?: any;
    researchSummary?: any;
}): EvidencePack["executiveSnapshot"] {
    // Extract simple aggregate if multiple scenarios existed, else take the first
    const firstScenario = input.scenarios.length > 0 ? input.scenarios[0].result : undefined;

    return {
        systemicRegime: input.researchSummary?.sensitivityClass || "Unknown",
        stressLevel: input.scenarios.length > 1 ? "Multi-Scenario Stress" : "Single Scenario",
        collapseProbability: firstScenario?.systemicCollapseProbability,
        var95: firstScenario?.VaR,
        cvar95: firstScenario?.expectedShortfall,
        capitalPressureIndex: input.researchSummary?.lowestRobustnessScore
            ? 1 / (input.researchSummary.lowestRobustnessScore + 0.0001)
            : undefined,
        totalSimulations: firstScenario ? firstScenario.losses.length * input.scenarios.length : 0
    };
}

export function buildEvidencePack(input: {
    scenarioPackId: string;
    engineVersion: string;
    seed?: number;
    createdAtISO: string;
    resultHash: string;
    scenarios: { name: string; result: SimulationResult }[];
    regulatorySummary?: any;
    researchSummary?: any;
    recommendations?: any;
    executiveOnePager?: string;
    trust?: EvidencePack["trust"];
}): EvidencePack {
    return {
        meta: {
            scenarioPackId: input.scenarioPackId,
            engineVersion: input.engineVersion,
            seed: input.seed,
            createdAtISO: input.createdAtISO,
            resultHash: input.resultHash
        },
        executiveSnapshot: buildExecutiveSnapshot(input),
        scenarios: input.scenarios, // Direct reference, read-only
        research: input.researchSummary,
        recommendations: input.recommendations,
        executiveOnePager: input.executiveOnePager,
        trust: input.trust,
        fingerprints: {
            scenarioPackId: input.scenarioPackId,
            resultHash: input.resultHash
        }
    };
}
