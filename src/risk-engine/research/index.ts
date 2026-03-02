import { ScenarioResult, decomposeExpectedShortfall, ESContribution } from './esDecomposition';
import { computeDominanceMatrix, ScenarioDominanceReport } from './dominanceMatrix';
import { analyzeStressSurface, ScenarioAnalytics } from './stressSurface';

export interface MetaAnalyticalSummary {
    frontierScenarios: string[];
    mostDominantScenario: string;
    highestESContributorBank: string;
    maximumCascadeIntensity: number;
    lowestRobustnessScore: number;
    sensitivityClass: string;
    accelerationDetected: boolean;
    scenariosAnalytics: Record<string, ScenarioAnalytics>;
    esContributions: Record<string, ESContribution[]>;
    dominanceReport: ScenarioDominanceReport;
}

export function generateMetaAnalyticalSummary(scenarios: ScenarioResult[]): MetaAnalyticalSummary {
    const totalSimulations = scenarios.length > 0 ? scenarios[0].losses.length : 0;

    // Compute ES Contributions per scenario
    const esContributions: Record<string, ESContribution[]> = {};
    let globalHighestContributor = "";
    let globalHighestContribution = -1;

    scenarios.forEach(sc => {
        const decomp = decomposeExpectedShortfall(sc, totalSimulations);
        esContributions[sc.scenarioId] = decomp;
        if (decomp.length > 0 && decomp[0].normalizedContribution > globalHighestContribution) {
            globalHighestContribution = decomp[0].normalizedContribution;
            globalHighestContributor = decomp[0].bankId;
        }
    });

    // Compute Dominance
    const dominanceReport = computeDominanceMatrix(scenarios);

    let mostDominant = "";
    let maxDominanceCount = -1;
    for (const [scenario, targets] of Object.entries(dominanceReport.matrix)) {
        const count = Object.values(targets).reduce((a, b) => a + b, 0);
        if (count > maxDominanceCount) {
            maxDominanceCount = count;
            mostDominant = scenario;
        }
    }

    // Compute Surfact & Robustness Analytics
    const analytics = analyzeStressSurface(scenarios);
    const scenariosAnalytics: Record<string, ScenarioAnalytics> = {};

    let maxCascade = -1;
    let minRobustness = 2; // Valid is 0-1
    let accelerationDetected = false;
    let worstSensitivityClass = "Stable Surface";

    analytics.forEach(an => {
        scenariosAnalytics[an.scenarioId] = an;

        if (an.cascadeIntensity > maxCascade) {
            maxCascade = an.cascadeIntensity;
        }

        if (an.score < minRobustness) {
            minRobustness = an.score;
        }

        // Structural Instability Detector
        if (an.severityScore > 0.3 && an.score < 0.3 && an.slopeToNext > 0.5) {
            accelerationDetected = true;
        }

        if (an.surfaceClassification === 'Instability Ridge') {
            worstSensitivityClass = 'Instability Ridge';
        } else if (an.surfaceClassification === 'Nonlinear Amplification' && worstSensitivityClass === 'Stable Surface') {
            worstSensitivityClass = 'Nonlinear Amplification';
        }
    });

    return {
        frontierScenarios: dominanceReport.frontierScenarios,
        mostDominantScenario: mostDominant,
        highestESContributorBank: globalHighestContributor,
        maximumCascadeIntensity: maxCascade,
        lowestRobustnessScore: minRobustness,
        sensitivityClass: worstSensitivityClass,
        accelerationDetected,
        scenariosAnalytics,
        esContributions,
        dominanceReport
    };
}
