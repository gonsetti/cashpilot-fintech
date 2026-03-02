import { describe, it, expect } from "vitest";
import { stableStringify } from "../utils/stableStringify";
import { stableHash } from "../utils/stableHash";
import { buildEvidencePack } from "../risk-engine/audit/evidencePack";
import { executeSimulation } from "../api/simulation";
import { SAFETY_LIMITS } from "../config/safetyLimits";

describe("SCIL Level 8 & 9 - Safety & Evidence Export Guard", () => {
    it("must build deterministic evidence packs for the same inputs", () => {
        const dummyResult: any = {
            VaR: 100,
            systemicCollapseProbability: 0.05,
            expectedShortfall: 150,
            losses: [10, 20, 30]
        };

        const packA = buildEvidencePack({
            scenarioPackId: "pack-1",
            engineVersion: "v1.0.0",
            seed: 1337,
            createdAtISO: "2026-03-01T12:00:00.000Z",
            resultHash: "hash-x",
            scenarios: [{ name: "Base", result: dummyResult }],
            regulatorySummary: { test: "data" }
        });

        const packB = buildEvidencePack({
            scenarioPackId: "pack-1",
            engineVersion: "v1.0.0",
            seed: 1337,
            createdAtISO: "2026-03-01T12:00:00.000Z",
            resultHash: "hash-x",
            scenarios: [{ name: "Base", result: dummyResult }],
            regulatorySummary: { test: "data" }
        });

        const hashA = stableHash(stableStringify(packA));
        const hashB = stableHash(stableStringify(packB));

        expect(hashA).toBe(hashB);
    });

    it("must block executions exceeding safety limits via executeSimulation wrapper", async () => {
        const excessIterationsPayload = {
            scenarioName: "Excess Iterations",
            iterations: SAFETY_LIMITS.MAX_UI_ITERATIONS + 1,
            revenueShockRange: [0.6, 1.0] as [number, number],
            costShockRange: [1.0, 1.3] as [number, number],
            interestRateHikeBase: 0.05,
            blackSwanProbability: 0.02,
            horizonMonths: 12
        };

        await expect(executeSimulation(excessIterationsPayload))
            .rejects.toThrow(`Safety Limit Triggered: Iterations exceed ${SAFETY_LIMITS.MAX_UI_ITERATIONS}`);

        const excessHorizonPayload = {
            ...excessIterationsPayload,
            iterations: 100, // Valid iteration
            horizonMonths: SAFETY_LIMITS.MAX_UI_HORIZON_MONTHS + 1
        };

        await expect(executeSimulation(excessHorizonPayload))
            .rejects.toThrow(`Safety Limit Triggered: Horizon exceeds ${SAFETY_LIMITS.MAX_UI_HORIZON_MONTHS} months`);
    });
});
