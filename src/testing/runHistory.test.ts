import { describe, it, expect } from "vitest";
import { LocalRunRepository } from "../runs/localRunRepository";
import { compareEvidencePacks } from "../runs/compareRuns";

describe("SCIL Level 13 - Run History", () => {
    it("LocalRunRepository enforces max 50 items sorting by date", () => {
        const repo = new LocalRunRepository();
        repo.clear();

        for (let i = 0; i < 55; i++) {
            repo.save({
                id: `H${i}`,
                label: `Run ${i}`,
                createdAtISO: new Date(2023, 1, i).toISOString(),
                scenarioPackId: "S1",
                engineVersion: "v1",
                resultHash: `H${i}`,
                evidencePack: {}
            });
        }

        const list = repo.list();
        expect(list.length).toBe(50);
        // Latest should be H54 (index 54 mapped to day 54 locally in test loop)
        expect(list[0].id).toBe("H54");
    });

    it("compareEvidencePacks computes deltas properly", () => {
        const a = { executiveSnapshot: { collapseProbability: 0.1, var95: 100 } };
        const b = { executiveSnapshot: { collapseProbability: 0.05, var95: 50 } };
        const diff = compareEvidencePacks(a, b);
        expect(diff.collapseProbabilityDelta).toBeCloseTo(0.05);
        expect(diff.var95Delta).toBe(50);
        expect(diff.summary).toContain("↑");
        expect(diff.summary).toContain("colapso");
    });
});
