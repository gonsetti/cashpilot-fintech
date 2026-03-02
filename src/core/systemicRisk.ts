import { Entity } from '../models/Entity';

export function calculateEntityRisk(entity: Entity): number {
    const liquidity = Math.max(entity.liquidity, 1e-6);
    const burnPressure = Math.max(0, entity.monthlyBurn / liquidity);

    const equityBase = Math.max(entity.equity, 1e-6);
    const leverageOverhead = Math.max(0, entity.debt / equityBase);

    const rawRisk = (burnPressure + leverageOverhead) * (1 + entity.volatility);

    // Strict mathematical normalization (sigmoid bounding 0 to 1)
    const logisticRisk = 1 / (1 + Math.exp(-0.5 * (rawRisk - 5)));

    const normalizedRisk = Math.max(0.0, Math.min(1.0, logisticRisk));
    const internalScore = (entity.riskScore || 0) / 100.0;

    return (normalizedRisk * 0.7) + (internalScore * 0.3);
}
