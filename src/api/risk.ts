import { exportActiveGraph } from './capital';
import { calculateSystemicFragilityIndex } from '../core/fragilityIndex';
import { calculateEntityRisk } from '../core/systemicRisk';
import { GovernanceAudit } from '../core/governance';
import { CapitalGraph } from '../core/capitalGraph';

export interface SystemicRiskReport {
    timestamp: string;
    systemicFragilityIndex: number;
    criticalNodes: Array<{
        entityId: string;
        entityName: string;
        isolatedRisk: number;
        centralityScore: number;
        exposureWeight: number;
    }>;
}

/**
 * GET /risk/systemic
 * Computes and returns the Systemic Fragility Index of the active graph.
 */
export async function getSystemicRisk(): Promise<SystemicRiskReport> {
    let graph = exportActiveGraph();

    // Safety for Vitest RAM-leaks where graph might lose prototype
    if (!(graph instanceof CapitalGraph)) {
        graph = new CapitalGraph(
            Array.from((graph as any).entities?.values() || []),
            (graph as any).edges || []
        );
    }

    // Simulate heavy computation latency
    await new Promise(r => setTimeout(r, 800));

    const fragilityIndex = calculateSystemicFragilityIndex(graph);

    const centralityScores = graph.getEigenvectorCentralities();

    const criticalNodes = [];
    for (const [entityId, entity] of graph.entities) {
        criticalNodes.push({
            entityId,
            entityName: entity.name,
            isolatedRisk: calculateEntityRisk(entity),
            centralityScore: centralityScores.get(entityId) || 0,
            exposureWeight: graph.getExposureWeight(entityId)
        });
    }

    // Sort by combined risk contribution (Centrality * Risk)
    criticalNodes.sort((a, b) => (b.isolatedRisk * b.centralityScore) - (a.isolatedRisk * a.centralityScore));

    const report: SystemicRiskReport = {
        timestamp: new Date().toISOString(),
        systemicFragilityIndex: fragilityIndex,
        criticalNodes: criticalNodes.slice(0, 5) // Top 5 critical
    };

    // Log calculation if fragility is mathematically dangerous (e.g. > 100)
    if (fragilityIndex > 100) {
        await GovernanceAudit.logEvent('RISK_ALERT', {
            fragilityIndex,
            topVulnerability: criticalNodes[0].entityId
        });
    }

    return report;
}
