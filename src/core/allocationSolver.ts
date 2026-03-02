import { CapitalGraph } from './capitalGraph';
import { calculateSystemicFragilityIndex } from './fragilityIndex';

export interface AllocationTransfer {
    sourceEntityId: string;
    targetEntityId: string;
    amount: number;
}

export interface OptimalAllocationOutput {
    transfers: AllocationTransfer[];
    initialFragility: number;
    finalFragility: number;
    systemicImprovementPercent: number;
}

/**
 * CP Allocation Solver
 * Uses Simulated Annealing to discover global minima for Systemic Fragility
 * subjected to minimum reserve constraints.
 */
export function solveOptimalAllocation(
    graph: CapitalGraph,
    maxIterations = 1000,
    initialTemperature = 100.0,
    coolingRate = 0.95
): OptimalAllocationOutput {
    let currentGraph = graph.clone();
    let currentSFI = calculateSystemicFragilityIndex(currentGraph);

    let bestGraph = currentGraph;
    let bestSFI = currentSFI;
    const bestTransfers: AllocationTransfer[] = [];

    let temperature = initialTemperature;

    // Minimum Reserve Constraints
    const minReserves = new Map<string, number>();
    for (const [id, entity] of currentGraph.entities) {
        minReserves.set(id, entity.monthlyBurn * 2);
    }

    const nodeIds = Array.from(currentGraph.entities.keys());

    for (let i = 0; i < maxIterations; i++) {
        if (temperature < 1e-3) break;

        // Propose random valid mutation
        const sSource = nodeIds[Math.floor(Math.random() * nodeIds.length)];
        const sTarget = nodeIds[Math.floor(Math.random() * nodeIds.length)];

        if (sSource === sTarget) continue;

        const sourceEntity = currentGraph.entities.get(sSource)!;
        const sourceReserve = minReserves.get(sSource)!;

        // Max transferable is excess above minimum reserve.
        // Cap step size to 10% of excess to prevent chaotic oscillation
        const excess = Math.max(0, sourceEntity.liquidity - sourceReserve);
        if (excess <= 0) continue;

        const transferAmt = excess * Math.random() * 0.1;

        // Apply temporary mutation
        const candidateGraph = currentGraph.clone();
        candidateGraph.entities.get(sSource)!.liquidity -= transferAmt;
        candidateGraph.entities.get(sTarget)!.liquidity += transferAmt;

        const candidateSFI = calculateSystemicFragilityIndex(candidateGraph);

        // Acceptance Probability (Metropolis criteria)
        const diff = currentSFI - candidateSFI;
        // If diff > 0 (candidate is better), exponent is positive => logic > 1, always accepted.
        // If diff < 0 (candidate is worse), prob decays with temperature.
        const exponent = diff / temperature;
        const acceptanceLogicFn = Math.exp(exponent);

        if (candidateSFI < currentSFI || Math.random() < acceptanceLogicFn) {
            currentGraph = candidateGraph;
            currentSFI = candidateSFI;

            if (candidateSFI < bestSFI) {
                bestSFI = candidateSFI;
                bestGraph = currentGraph.clone();
                bestTransfers.push({ sourceEntityId: sSource, targetEntityId: sTarget, amount: transferAmt });
            }
        }

        temperature *= coolingRate;
    }

    // Coalesce continuous annealing traces into net topological transfers
    const netTransfers = new Map<string, number>();
    for (const t of bestTransfers) {
        const key = `${t.sourceEntityId}->${t.targetEntityId}`;
        netTransfers.set(key, (netTransfers.get(key) || 0) + t.amount);
    }

    const finalTransfers = Array.from(netTransfers.entries()).map(([k, v]) => {
        const [source, target] = k.split('->');
        return { sourceEntityId: source, targetEntityId: target, amount: v };
    });

    const initialFragility = calculateSystemicFragilityIndex(graph);

    return {
        transfers: finalTransfers,
        initialFragility,
        finalFragility: bestSFI,
        systemicImprovementPercent: initialFragility > 0 ? ((initialFragility - bestSFI) / initialFragility) * 100 : 0
    };
}
