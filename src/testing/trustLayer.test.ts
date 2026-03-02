import { describe, it, expect } from "vitest";
import {
    buildTransparencyParams,
    MODEL_ASSUMPTIONS_ES,
    MODEL_LIMITS_ES,
    TRUST_STATEMENT_ES,
    EXCEL_COMPARISON_ES
} from "../trust/modelTransparency";
import { buildEvidencePack } from "../risk-engine/audit/evidencePack";

describe("CP Level 12 - Trust Multiplier Layer", () => {

    it("Constants hold valid institutional text arrays", () => {
        expect(TRUST_STATEMENT_ES.length).toBeGreaterThan(20);
        expect(EXCEL_COMPARISON_ES.length).toBeGreaterThan(20);

        // Between 6 and 10 assumptions & limits as requested
        expect(MODEL_ASSUMPTIONS_ES.length).toBeGreaterThanOrEqual(6);
        expect(MODEL_ASSUMPTIONS_ES.length).toBeLessThanOrEqual(10);

        expect(MODEL_LIMITS_ES.length).toBeGreaterThanOrEqual(6);
        expect(MODEL_LIMITS_ES.length).toBeLessThanOrEqual(10);

        // Spot check severity enum valid value
        expect(MODEL_LIMITS_ES[0].severity).toMatch(/INFO|IMPORTANT/);
    });

    it("buildTransparencyParams filters undefined keys strictly", () => {
        // Feed partial data
        const inputStr = {
            config: {
                iterations: 10000,
                // horizonMonths is implicitly undefined here
            },
            seed: undefined,
            correlationMatrix: undefined
        };

        const params = buildTransparencyParams(inputStr);

        expect(params.iterations).toBe(10000);
        expect(params.seed).toBeUndefined(); // TS expects optional keys to return undefined when read, but object.keys should NOT include it if strictly assigned

        const keys = Object.keys(params);
        expect(keys.includes("iterations")).toBe(true);
        expect(keys.includes("seed")).toBe(false);
        expect(keys.includes("horizonMonths")).toBe(false);
    });

    it("buildTransparencyParams correctly identifies correlation active state", () => {
        const params = buildTransparencyParams({
            correlationMatrix: [[1, 0.5], [0.5, 1]]
        });

        expect(params.correlationEnabled).toBe(true);
    });

    it("EvidencePack builder accepts and embeds the trust layer", () => {
        const dummyTrust = {
            trustStatement: "Mock Statement",
            excelComparison: "Mock Excel",
            params: { iterations: 50 },
            assumptions: [],
            limits: []
        };

        const pack = buildEvidencePack({
            scenarioPackId: "PACK123",
            engineVersion: "v1.0.0",
            resultHash: "HASH123",
            createdAtISO: new Date().toISOString(),
            scenarios: [],
            trust: dummyTrust
        });

        expect(pack.trust).toBeDefined();
        expect(pack.trust?.trustStatement).toBe("Mock Statement");
        expect(pack.trust?.params.iterations).toBe(50);
    });

});
