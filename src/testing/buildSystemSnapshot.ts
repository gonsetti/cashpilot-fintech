import { runSimulation } from "../risk-engine/core/monteCarloEngine";
import { Bank } from "../risk-engine/models/Bank";
import { SimulationConfig } from "../risk-engine/config/simulationConfig";

export interface ScenarioInput {
    name: string;
    config: SimulationConfig;
    banks: Bank[];
    correlationMatrix: number[][];
}

function runSimulationPipeline(seed: number, scenarios: ScenarioInput[]) {
    const executive: any[] = [];
    const regulatory: any[] = [];
    const laboratory: any[] = [];

    for (const s of scenarios) {
        const result = runSimulation(
            s.banks,
            s.correlationMatrix,
            { ...s.config, seed }
        );

        executive.push({
            scenario: s.name,
            VaR: result.VaR,
            systemicCollapseProbability: result.systemicCollapseProbability
        });

        regulatory.push({
            scenario: s.name,
            expectedShortfall: result.expectedShortfall,
            defaultCounts: result.defaultCounts
        });

        laboratory.push({
            scenario: s.name,
            averageTimeToCollapse: result.averageTimeToCollapse,
            collapseFrequency: result.collapseFrequency,
            lossesSummary: result.losses.slice(0, 10)
        });
    }

    return { executive, regulatory, laboratory };
}

export function buildSystemSnapshot(
    seed: number,
    scenarios: ScenarioInput[]
) {
    const results = runSimulationPipeline(seed, scenarios)

    return {
        executive: results.executive,
        regulatory: results.regulatory,
        laboratory: results.laboratory,
    }
}
