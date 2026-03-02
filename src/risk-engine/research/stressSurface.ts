import { ScenarioResult } from './esDecomposition';

export interface ParametricSurfacePoint {
    scenarioId: string;
    cvar95: number;
    collapseProbability: number;
    severityScore: number;
    slopeToNext: number; // Δcollapse / ΔCVaR
    surfaceClassification: 'Stable Surface' | 'Nonlinear Amplification' | 'Instability Ridge' | 'Terminal Point';
}

export interface RobustnessMetrics {
    score: number;
    classification: 'Highly Robust' | 'Moderately Robust' | 'Fragile' | 'Structurally Unstable';
    bayesianConfidenceProxy: number;
    confidenceClassification: 'High Statistical Confidence' | 'Acceptable' | 'Sampling Instability Warning';
    cascadeIntensity: number;
    cascadeClassification: 'Localized Risk' | 'Propagating Risk' | 'Systemic Cascade';
}

export interface ScenarioAnalytics extends ParametricSurfacePoint, RobustnessMetrics { }

/**
 * Calculates Advanced Systemic Metrics (Robustness, Confidence, Cascade, and Surface Slopes)
 */
export function analyzeStressSurface(scenarios: ScenarioResult[]): ScenarioAnalytics[] {
    // 3. PARAMETRIC STRESS SURFACE (Order by CVaR ascending)
    const sorted = [...scenarios].sort((a, b) => a.expectedShortfall - b.expectedShortfall);
    const analytics: ScenarioAnalytics[] = [];

    for (let i = 0; i < sorted.length; i++) {
        const current = sorted[i];

        // --- C. PARAMETRIC SURFACE SLOPE ---
        let slope = 0;
        let surfaceClass: ParametricSurfacePoint['surfaceClassification'] = 'Terminal Point';

        if (i < sorted.length - 1) {
            const next = sorted[i + 1];
            const deltaCvar = next.expectedShortfall - current.expectedShortfall;
            const deltaCollapse = next.systemicCollapseProbability - current.systemicCollapseProbability;

            if (deltaCvar > 0) {
                slope = Math.max(0, deltaCollapse / deltaCvar); // Scale arbitrary if CVaR not normalized, assuming abstract CVaR
            }

            if (slope < 0.1) surfaceClass = 'Stable Surface';
            else if (slope <= 0.5) surfaceClass = 'Nonlinear Amplification';
            else surfaceClass = 'Instability Ridge';
        }

        // --- D. ROBUSTNESS SCORE ---
        let varianceLoss = 0;
        const losses = current.losses;
        const totalSim = losses.length;
        if (totalSim > 0) {
            const mean = losses.reduce((sum, val) => sum + val, 0) / totalSim;
            varianceLoss = losses.reduce((sum, val) => sum + Math.pow((val - mean) / mean, 2), 0) / totalSim; // Normalized variance
        }

        const scoreRaw = 1 / (1 + varianceLoss + current.systemicCollapseProbability);
        const robustnessScore = Math.min(1, Math.max(0.0001, scoreRaw));

        let robClass: RobustnessMetrics['classification'] = 'Structurally Unstable';
        if (robustnessScore > 0.8) robClass = 'Highly Robust';
        else if (robustnessScore >= 0.5) robClass = 'Moderately Robust';
        else if (robustnessScore >= 0.2) robClass = 'Fragile';

        // --- E. BAYESIAN REGIME CONFIDENCE ---
        const varIndex = Math.floor(0.95 * totalSim);
        const tailCount = totalSim - varIndex;
        const tailRatio = tailCount / totalSim; // Should be ~0.05

        const confidenceProxy = Math.min(1, Math.max(0, 1 - Math.abs(tailRatio - 0.05) * 10)); // Scaled to penalize hard if >0.1 diff

        let confClass: RobustnessMetrics['confidenceClassification'] = 'Sampling Instability Warning';
        if (confidenceProxy > 0.9) confClass = 'High Statistical Confidence';
        else if (confidenceProxy >= 0.75) confClass = 'Acceptable';

        // --- F. CASCADE PROPAGATION INTENSITY ---
        // abstract "shockAmplificationIndex": we proxy severityScore / ES
        const shockAmp = current.expectedShortfall > 0 ? (current.severityScore * 10) / current.expectedShortfall : 0;
        const normalizedTail = tailRatio / 0.05;
        const cascadeIntensity = current.systemicCollapseProbability * shockAmp * normalizedTail;

        let cascadeClass: RobustnessMetrics['cascadeClassification'] = 'Systemic Cascade';
        if (cascadeIntensity < 0.01) cascadeClass = 'Localized Risk';
        else if (cascadeIntensity <= 0.05) cascadeClass = 'Propagating Risk';

        analytics.push({
            scenarioId: current.scenarioId,
            cvar95: current.expectedShortfall,
            collapseProbability: current.systemicCollapseProbability,
            severityScore: current.severityScore,
            slopeToNext: slope,
            surfaceClassification: surfaceClass,
            score: robustnessScore,
            classification: robClass,
            bayesianConfidenceProxy: confidenceProxy,
            confidenceClassification: confClass,
            cascadeIntensity,
            cascadeClassification: cascadeClass
        });
    }

    return analytics;
}
