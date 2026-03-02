import { describe, it, expect, beforeAll } from "vitest";
import {
    INSTITUTIONAL_SCENARIOS,
    INSTITUTIONAL_DEMO_SEED
} from "../demo/institutionalScenarios";
import { runInstitutionalDemo } from "../demo/runInstitutionalDemo";
import { getCapitalState } from "../api/capital";

describe("SCIL Level 10 - Institutional Demo Guard", () => {

    beforeAll(async () => {
        // Force evaluation of the capital module so the activeGraph is seeded
        // before the risk/simulation APIs are hit which assume a non-empty graph map.
        await getCapitalState();
    });

    it("must define exactly 5 progressive scenarios in library", () => {
        expect(INSTITUTIONAL_SCENARIOS.length).toBe(5);
        expect(INSTITUTIONAL_SCENARIOS[0].name).toContain("Baseline");
        expect(INSTITUTIONAL_SCENARIOS[4].name).toContain("Extreme");
    });

    it("must run deterministic demo generating 5 output results and a valid Evidence pack", async () => {
        // Ejecución en RAM Mock del Graph Local (usado por `executeSimulation`)
        const demoRunA = await runInstitutionalDemo();

        expect(demoRunA.scenarios.length).toBe(5);
        expect(demoRunA.scenarioPackId.length).toBeGreaterThan(0);
        expect(demoRunA.resultHash.length).toBeGreaterThan(0);

        // Determinismo: Ejecutar de nuevo debe dar el mismo hash (el grafo base es inmutable por default en tests)
        const demoRunB = await runInstitutionalDemo();

        expect(demoRunA.scenarioPackId).toBe(demoRunB.scenarioPackId);
        expect(demoRunA.resultHash).toBe(demoRunB.resultHash);

        // Validar escalada de stress (Monotónica o al menos baseline < extreme)
        const mildResult = demoRunA.scenarios[0].result;
        const extremeResult = demoRunA.scenarios[4].result;

        // Severe condition assertions
        // VaR debe aumentar (mayores pérdidas)
        expect(extremeResult.valueAtRisk).toBeGreaterThanOrEqual(mildResult.valueAtRisk);

        // Probability of survival debe bajar en un escenario extremo
        expect(extremeResult.survivalProbability).toBeLessThanOrEqual(mildResult.survivalProbability);
    });
});
