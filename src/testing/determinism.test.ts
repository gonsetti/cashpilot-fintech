import { describe, it, expect } from "vitest";
import { stableStringify } from "../utils/stableStringify";
import { stableHash } from "../utils/stableHash";
import { buildSystemSnapshot, ScenarioInput } from "./buildSystemSnapshot";
import { Bank } from "../risk-engine/models/Bank";

function buildFiveStressScenarios(): ScenarioInput[] {
    const banks: Bank[] = [
        { id: "B1", capital: 1000, initialCapital: 1000, exposures: { "B2": 100 } },
        { id: "B2", capital: 500, initialCapital: 500, exposures: { "B3": 50 } },
        { id: "B3", capital: 200, initialCapital: 200, exposures: { "B1": 20 } }
    ];

    const correlationMatrix = [
        [1.0, 0.5, 0.2],
        [0.5, 1.0, 0.4],
        [0.2, 0.4, 1.0]
    ];

    const baseConfig = {
        iterations: 100, // Reduced iterations for fast testing
        horizonMonths: 12,
        confidenceLevel: 0.95,
        studentT_df: 4,
        systemicShockProbability: 0.05,
        systemicShockMagnitude: 0.2,
        defaultThreshold: 0
    };

    return [
        { name: "Base Scenario", config: baseConfig, banks, correlationMatrix },
        { name: "High Shock", config: { ...baseConfig, systemicShockProbability: 0.2 }, banks, correlationMatrix },
        { name: "Fat Tails", config: { ...baseConfig, studentT_df: 2 }, banks, correlationMatrix },
        { name: "Short Horizon", config: { ...baseConfig, horizonMonths: 6 }, banks, correlationMatrix },
        { name: "Extreme Confidence", config: { ...baseConfig, confidenceLevel: 0.99 }, banks, correlationMatrix }
    ];
}

describe("CP Level 7 Determinism Guard", () => {
    it("must preserve executive/regulatory/lab outputs when research enabled", () => {
        const seed = 1337;
        const scenarios = buildFiveStressScenarios();

        process.env.NEXT_PUBLIC_ADVANCED_ANALYTICS = "false";
        const snapshotA = buildSystemSnapshot(seed, scenarios);
        const hashA = stableHash(stableStringify(snapshotA));

        process.env.NEXT_PUBLIC_ADVANCED_ANALYTICS = "true";
        const snapshotB = buildSystemSnapshot(seed, scenarios);
        const hashB = stableHash(stableStringify(snapshotB));

        expect(hashA).toBe(hashB);
    });

    it("should produce different snapshots for different seeds to prove sensitivity", () => {
        const scenarios = buildFiveStressScenarios();

        const snapshotA = buildSystemSnapshot(1337, scenarios);
        const hashA = stableHash(stableStringify(snapshotA));

        const snapshotB = buildSystemSnapshot(9999, scenarios);
        const hashB = stableHash(stableStringify(snapshotB));

        expect(hashA).not.toBe(hashB);
    });
});

import { createScenarioPackId, createResultHash } from "../risk-engine/audit/reportFingerprint";
import { runSimulation } from "../risk-engine/core/monteCarloEngine";

describe("CP Report Fingerprint Audit", () => {
    it("should preserve scenarioPackId properties for same inputs but change for ordering", () => {
        const scenarios = buildFiveStressScenarios();
        const baseMatrix = scenarios[0].correlationMatrix;
        const baseConfig = scenarios[0].config;

        const packA = createScenarioPackId({
            scenarios: scenarios.map(s => ({ name: s.name })),
            config: baseConfig,
            correlationMatrix: baseMatrix
        });

        const packB = createScenarioPackId({
            scenarios: scenarios.map(s => ({ name: s.name })),
            config: baseConfig,
            correlationMatrix: baseMatrix
        });

        expect(packA).toBe(packB);

        // Change order
        const reordered = [scenarios[1], scenarios[0], ...scenarios.slice(2)];
        const packC = createScenarioPackId({
            scenarios: reordered.map(s => ({ name: s.name })),
            config: baseConfig,
            correlationMatrix: baseMatrix
        });

        expect(packC).not.toBe(packA);
    });

    it("should preserve resultHash for same seed, but change for different seed", () => {
        const s = buildFiveStressScenarios()[0];
        const resultA = runSimulation(s.banks, s.correlationMatrix, { ...s.config, seed: 100 });
        const resultB = runSimulation(s.banks, s.correlationMatrix, { ...s.config, seed: 100 });
        const resultC = runSimulation(s.banks, s.correlationMatrix, { ...s.config, seed: 200 });

        const hashA = createResultHash(resultA as any);
        const hashB = createResultHash(resultB as any);
        const hashC = createResultHash(resultC as any);

        expect(hashA).toBe(hashB);
        expect(hashC).not.toBe(hashA);
    });
});
