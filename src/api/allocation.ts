import { exportActiveGraph } from './capital';
import { solveOptimalAllocation, OptimalAllocationOutput } from '../core/allocationSolver';
import { GovernanceAudit } from '../core/governance';

export interface OptimalAllocationResponse {
    timestamp: string;
    result: OptimalAllocationOutput;
}

/**
 * GET /allocation/optimal
 * Runs the deterministic liquidity allocation solver to propose structural capital transfers.
 */
export async function getOptimalAllocation(): Promise<OptimalAllocationResponse> {
    const graph = exportActiveGraph();

    // Simulate API calculation latency
    await new Promise(r => setTimeout(r, 900));

    const result = solveOptimalAllocation(graph);

    const response: OptimalAllocationResponse = {
        timestamp: new Date().toISOString(),
        result
    };

    if (result.transfers.length > 0) {
        await GovernanceAudit.logEvent('ALLOCATION_PROPOSED', response);
    }

    return response;
}
