import { CapitalGraph } from './capitalGraph';
import { calculateEntityRisk } from './systemicRisk';

/**
 * Rigorous Systemic Fragility Index calculation.
 * Formula: 
 * Fragility = Σ (NodeRisk × EigenCentrality × ExposureWeight) × NetworkStressMultiplier ÷ (TotalLiquidity + VarianceAdjustment)
 * 
 * Bounded strictly [0, 1].
 */
export function calculateSystemicFragilityIndex(graph: CapitalGraph): number {
    const totalLiquidity = graph.getNetworkLiquidityBuffer();
    if (totalLiquidity <= 0) return 1.0;

    const centralities = graph.getEigenvectorCentralities(100, 1e-6);
    let fragilitySum = 0;
    let liquidityVarianceSum = 0;

    const size = Math.max(graph.entities.size, 1);
    const meanLiquidity = totalLiquidity / size;

    for (const [entityId, entity] of graph.entities) {
        const risk = calculateEntityRisk(entity); // [0, 1]
        const centrality = centralities.get(entityId) || 0; // [0, 1]
        const exposureWeight = graph.getExposureWeight(entityId); // [0, 1]

        fragilitySum += (risk * centrality * exposureWeight);
        liquidityVarianceSum += Math.pow(entity.liquidity - meanLiquidity, 2);
    }

    const varianceAdjustment = Math.sqrt(liquidityVarianceSum / size);

    // Concentration penalty ensures that a single overly dominant node scales the systemic fragility
    const concentrationPenalty = 1 + (varianceAdjustment / totalLiquidity);

    const sfiRaw = (fragilitySum * concentrationPenalty) / size;

    // Sigmoid function to strict-bound the SFI to [0, 1] interval
    const sfi = 1 / (1 + Math.exp(-5 * (sfiRaw - 0.5)));
    return Math.min(1.0, Math.max(0.0, sfi));
}
