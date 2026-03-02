import { Entity } from '../models/Entity';
import { Relationship } from '../models/Relationship';

export class CapitalGraph {
    public entities: Map<string, Entity>;
    public edges: Relationship[];

    constructor(entities: Entity[] = [], edges: Relationship[] = []) {
        this.entities = new Map(entities.map(e => [e.id, { ...e }]));
        this.edges = edges.map(e => ({ ...e }));
    }

    public clone(): CapitalGraph {
        return new CapitalGraph(Array.from(this.entities.values()), this.edges);
    }

    public addEntity(entity: Entity) {
        this.entities.set(entity.id, { ...entity });
    }

    public addEdge(edge: Relationship) {
        this.edges.push({ ...edge });
    }

    public getNetworkLiquidityBuffer(): number {
        let buffer = 0;
        for (const [_, entity] of this.entities) {
            buffer += entity.liquidity;
        }
        return buffer;
    }

    public getExposureWeight(entityId: string): number {
        let outgoingExposure = 0;
        for (const edge of this.edges) {
            if (edge.fromEntity === entityId) {
                outgoingExposure += (edge.value * edge.sensitivity);
            }
        }
        const liquidity = Math.max(this.entities.get(entityId)?.liquidity || 1, 1e-6);
        return Math.min(outgoingExposure / liquidity, 1.0); // Bounded 0-1
    }

    // Power Iteration for Eigenvector Centrality
    public getEigenvectorCentralities(maxIterations = 100, tolerance = 1e-6): Map<string, number> {
        const nodes = Array.from(this.entities.keys());
        const N = nodes.length;
        if (N === 0) return new Map();

        let centralities = new Map<string, number>();
        nodes.forEach(n => centralities.set(n, 1.0 / N));

        for (let iter = 0; iter < maxIterations; iter++) {
            const nextCentralities = new Map<string, number>();
            nodes.forEach(n => nextCentralities.set(n, 0));

            for (const edge of this.edges) {
                const sourceWeight = centralities.get(edge.fromEntity) || 0;
                const currentTargetValue = nextCentralities.get(edge.toEntity) || 0;
                const adjacencyWeight = (edge.value * edge.sensitivity) / (this.getNetworkLiquidityBuffer() || 1);
                nextCentralities.set(edge.toEntity, currentTargetValue + (sourceWeight * adjacencyWeight));
            }

            // Normalize
            let norm = 0;
            for (const val of nextCentralities.values()) {
                norm += (val * val);
            }
            norm = Math.sqrt(norm);
            if (norm === 0) norm = 1e-8;

            let maxDiff = 0;
            for (const node of nodes) {
                const newVal = (nextCentralities.get(node) || 0) / norm;
                const oldVal = centralities.get(node) || 0;
                maxDiff = Math.max(maxDiff, Math.abs(newVal - oldVal));
                centralities.set(node, newVal);
            }

            if (maxDiff < tolerance) break;
        }

        return centralities;
    }

    public simulateCascade(initialShockNodeId: string, shockMagnitude: number): string[] {
        const defaultedNodes = new Set<string>();
        const queue: { nodeId: string, shock: number }[] = [{ nodeId: initialShockNodeId, shock: shockMagnitude }];

        const liquidities = new Map<string, number>();
        for (const [id, entity] of this.entities) {
            liquidities.set(id, entity.liquidity);
        }

        while (queue.length > 0) {
            const { nodeId, shock } = queue.shift()!;

            if (defaultedNodes.has(nodeId)) continue;

            const currentLiquidity = (liquidities.get(nodeId) || 0) - shock;
            liquidities.set(nodeId, currentLiquidity);

            const entity = this.entities.get(nodeId);
            const defaultThreshold = entity ? entity.monthlyBurn * 0.5 : 0;

            if (currentLiquidity <= defaultThreshold) {
                defaultedNodes.add(nodeId);

                for (const edge of this.edges) {
                    if (edge.toEntity === nodeId) {
                        const contagionShock = edge.value * edge.sensitivity;
                        queue.push({ nodeId: edge.fromEntity, shock: contagionShock });
                    }
                }
            }
        }

        return Array.from(defaultedNodes);
    }
}
