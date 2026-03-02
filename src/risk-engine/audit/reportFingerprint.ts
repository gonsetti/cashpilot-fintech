import { stableStringify } from "../../utils/stableStringify";
import { stableHash } from "../../utils/stableHash";
import { SimulationResult } from "../models/SimulationResult";

export type ScenarioBundleInput = {
    name: string;
    result: SimulationResult;
};

export function getEngineVersion(): string {
    if (typeof process !== "undefined" && process.env) {
        if (process.env.VITE_GIT_SHA) return process.env.VITE_GIT_SHA;
        if (process.env.NEXT_PUBLIC_GIT_SHA) return process.env.NEXT_PUBLIC_GIT_SHA;
        if (process.env.GIT_SHA) return process.env.GIT_SHA;
    }
    // Optional fallback for Vite / Meta Env if it exists
    if (typeof import.meta !== "undefined" && (import.meta as any).env) {
        if ((import.meta as any).env.VITE_GIT_SHA) return (import.meta as any).env.VITE_GIT_SHA;
    }
    return "dev";
}

export function createScenarioPackId(input: {
    scenarios: { name: string }[];
    config: unknown;
    correlationMatrix: number[][];
}): string {
    // Validations (defensive)
    const sanitizedInput = {
        scenarios: input.scenarios || [],
        config: input.config || {},
        correlationMatrix: input.correlationMatrix || []
    };

    const str = stableStringify(sanitizedInput);
    if (!str || str === "") {
        return stableHash("{}");
    }
    return stableHash(str);
}

export function createResultHash(result: SimulationResult): string {
    const str = stableStringify(result);
    return stableHash(str || "{}");
}

export type ReportFingerprint = {
    scenarioPackId: string;
    engineVersion: string;
    seed?: number;
    resultHash: string;
    createdAtISO: string;
};

export function createReportFingerprint(input: {
    scenarioPackId: string;
    engineVersion: string;
    seed?: number;
    result: SimulationResult;
}): ReportFingerprint {
    return {
        scenarioPackId: input.scenarioPackId,
        engineVersion: input.engineVersion,
        seed: input.seed,
        resultHash: createResultHash(input.result),
        createdAtISO: new Date().toISOString()
    };
}
