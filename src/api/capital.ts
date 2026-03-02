import { CapitalGraph } from '../core/capitalGraph';
import { Entity } from '../models/Entity';
import { Relationship } from '../models/Relationship';

/**
 * MOCK DATA: Seed a complex multi-entity holding graph for demonstration.
 */
function seedGraph(): CapitalGraph {
    const g = new CapitalGraph();

    // Create generic entities
    const hq: Entity = { id: 'HQ', name: 'Alpha Holdings Group', liquidity: 5000000, monthlyBurn: 150000, revenue: 0, debt: 10000000, equity: 25000000, volatility: 0.05, riskScore: 12, beta: 0.3 };
    const subAlpha: Entity = { id: 'SUB_A', name: 'Alpha Logistics Tech', liquidity: 800000, monthlyBurn: 600000, revenue: 450000, debt: 2000000, equity: 500000, volatility: 0.25, riskScore: 40, beta: 0.6 };
    const subBeta: Entity = { id: 'SUB_B', name: 'Alpha FinServices', liquidity: 2000000, monthlyBurn: 300000, revenue: 800000, debt: 500000, equity: 6000000, volatility: 0.15, riskScore: 25, beta: 0.4 };
    const subGamma: Entity = { id: 'SUB_C', name: 'Gamma Experimental Ventures', liquidity: 150000, monthlyBurn: 120000, revenue: 10000, debt: 400000, equity: -100000, volatility: 0.60, riskScore: 85, beta: 0.9 };

    g.addEntity(hq);
    g.addEntity(subAlpha);
    g.addEntity(subBeta);
    g.addEntity(subGamma);

    // Create exposures / relationships
    g.addEdge({ fromEntity: 'HQ', toEntity: 'SUB_A', type: 'guarantee', value: 2000000, sensitivity: 0.8 });
    g.addEdge({ fromEntity: 'HQ', toEntity: 'SUB_B', type: 'exposure', value: 5000000, sensitivity: 0.2 });
    g.addEdge({ fromEntity: 'HQ', toEntity: 'SUB_C', type: 'transfer', value: 150000, sensitivity: 1.0 });
    g.addEdge({ fromEntity: 'SUB_B', toEntity: 'SUB_A', type: 'dependency', value: 300000, sensitivity: 0.5 }); // B depends on A's tech

    return g;
}

// Global scoped memory graph for the "API" module
let activeGraph = seedGraph();

/**
 * GET /capital/state
 * Returns the current topology of the Capital Graph in JSON format.
 */
export async function getCapitalState(): Promise<{
    entities: Entity[];
    relationships: Relationship[];
    totalLiquidity: number;
    globalBurn: number;
}> {
    // Simulate network latency for realism
    await new Promise(r => setTimeout(r, 600));

    let totalLiquidity = 0;
    let globalBurn = 0;

    for (const [_, entity] of activeGraph.entities) {
        totalLiquidity += entity.liquidity;
        globalBurn += entity.monthlyBurn;
    }

    return {
        entities: Array.from(activeGraph.entities.values()),
        relationships: activeGraph.edges,
        totalLiquidity,
        globalBurn
    };
}

export function exportActiveGraph(): CapitalGraph {
    return activeGraph;
}
