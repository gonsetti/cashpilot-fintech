import { exportActiveGraph } from './capital';
import { solveOptimalAllocation, AllocationProposal } from '../core/allocationSolver';
import { GovernanceAudit } from '../core/governance';

export interface OptimalAllocationResponse {
    timestamp: string;
    proposals: AllocationProposal[];
    totalExpectedFragilityDrop: number;
}

/**
 * GET /allocation/optimal
 * Runs the deterministic liquidity allocation solver to propose structural capital transfers.
 */
export async function getOptimalAllocation(): Promise<OptimalAllocationResponse> {
    const graph = exportActiveGraph();

    // Simulate API calculation latency
    await new Promise(r => setTimeout(r, 900));

    const proposals = solveOptimalAllocation(graph);

    const totalDrop = proposals.reduce((acc, curr) => acc + curr.expectedFragilityDrop, 0);

    const response: OptimalAllocationResponse = {
        timestamp: new Date().toISOString(),
        proposals,
        totalExpectedFragilityDrop: totalDrop
    };

    if (proposals.length > 0) {
        await GovernanceAudit.logEvent('ALLOCATION_PROPOSED', response);
    }

    return response;
}
