import React, { useMemo } from 'react';
import { generateMetaAnalyticalSummary } from '../../risk-engine/research';
import { SimulationResult } from '../../risk-engine/models/SimulationResult';
import { ScenarioResult } from '../../risk-engine/research/esDecomposition';

export interface ResearchModuleProps {
    scenarios: { name: string; result: SimulationResult }[];
}

export default function ResearchModule({ scenarios }: ResearchModuleProps) {
    const report = useMemo(() => {
        if (!scenarios || scenarios.length === 0) return null;

        // Map abstract parameters to generic ScenarioResult required by the engine without mutation
        const mapped: ScenarioResult[] = scenarios.map(s => {
            const meanLoss = s.result.losses.reduce((acc, val) => acc + val, 0) / (s.result.losses.length || 1);
            return {
                ...s.result,
                scenarioId: s.name,
                severityScore: meanLoss > 0 ? s.result.VaR / meanLoss : 0
            };
        });

        return generateMetaAnalyticalSummary(mapped);
    }, [scenarios]);

    if (!report) return null;

    // VALIDACIÓN INTERNA OBLIGATORIA (Contrato Matemático)
    const matrixKeys = Object.keys(report.dominanceReport.matrix);
    const isSquare = matrixKeys.every(k => Object.keys(report.dominanceReport.matrix[k]).length === matrixKeys.length);

    const esValid = Object.values(report.esContributions).every(contributions => {
        if (contributions.length === 0) return true;
        const sum = contributions.reduce((acc, c) => acc + c.normalizedContribution, 0);
        return Math.abs(sum - 1) < 0.05; // tolerencia pequeña (~1)
    });

    const robValid = report.lowestRobustnessScore > 0 && report.lowestRobustnessScore <= 1;
    const cascadeValid = report.maximumCascadeIntensity >= 0;

    const analyticsPoints = Object.values(report.scenariosAnalytics);
    const slopesCount = analyticsPoints.filter(a => a.surfaceClassification !== 'Terminal Point').length;
    const slopesValid = scenarios.length <= 1 ? true : slopesCount === scenarios.length - 1;

    // Si cualquier validación falla, se bloquea el render silenciosamente
    if (!isSquare || !esValid || !robValid || !cascadeValid || !slopesValid) {
        return null;
    }

    return (
        <div className="bg-[#0a0a0a] border border-zinc-900 rounded p-5 mt-6 col-span-12 xl:col-span-8 relative overflow-hidden">
            <div className="text-[0.6rem] text-zinc-500 uppercase tracking-widest mb-4">
                Advanced Research Mode
            </div>

            <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-2">
                <h2 className="text-zinc-100 font-semibold tracking-wider flex items-center gap-2">
                    <span className="material-icons text-zinc-500 text-sm">biotech</span>
                    SYSTEMIC RESEARCH SUMMARY
                </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 bg-zinc-900/40 rounded border border-zinc-800/50">
                    <div className="text-[0.65rem] text-zinc-500 mb-1">FRONTIER SCENARIOS</div>
                    <div className="text-sm font-bold text-zinc-300 truncate" title={report.frontierScenarios.join(', ') || "NONE"}>
                        {report.frontierScenarios.join(', ') || "NONE"}
                    </div>
                </div>
                <div className="p-3 bg-zinc-900/40 rounded border border-zinc-800/50">
                    <div className="text-[0.65rem] text-zinc-500 mb-1">MOST DOMINANT</div>
                    <div className="text-sm font-bold text-zinc-300 truncate" title={report.mostDominantScenario || "NONE"}>
                        {report.mostDominantScenario || "NONE"}
                    </div>
                </div>
                <div className="p-3 bg-zinc-900/40 rounded border border-zinc-800/50">
                    <div className="text-[0.65rem] text-zinc-500 mb-1">ES CONTRIBUTOR (MAX)</div>
                    <div className="text-sm font-bold text-zinc-300 truncate" title={report.highestESContributorBank || "N/A"}>
                        {report.highestESContributorBank || "N/A"}
                    </div>
                </div>
                <div className="p-3 bg-zinc-900/40 rounded border border-zinc-800/50">
                    <div className="text-[0.65rem] text-zinc-500 mb-1">MAX CASCADE INTENSITY</div>
                    <div className="text-sm font-bold text-zinc-300">
                        {report.maximumCascadeIntensity.toFixed(4)}
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-zinc-900/20 rounded border border-zinc-800">
                    <span className="block text-[0.65rem] text-zinc-500 mb-1">ROBUSTNESS SCORE (MIN)</span>
                    <span className="text-sm font-bold text-zinc-400">{report.lowestRobustnessScore.toFixed(4)}</span>
                </div>
                <div className="p-3 bg-zinc-900/20 rounded border border-zinc-800">
                    <span className="block text-[0.65rem] text-zinc-500 mb-1">PARAMETRIC SENSITIVITY</span>
                    <span className="text-sm font-bold text-zinc-400">{report.sensitivityClass}</span>
                </div>
                <div className="p-3 bg-zinc-900/20 rounded border border-zinc-800">
                    <span className="block text-[0.65rem] text-zinc-500 mb-1">ACCELERATION DETECTED</span>
                    <span className={`text-sm font-bold ${report.accelerationDetected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {report.accelerationDetected ? 'YES' : 'NONE'}
                    </span>
                </div>
            </div>

            {report.accelerationDetected && (
                <div className="mt-4 p-3 border border-zinc-800 bg-zinc-900/50 text-zinc-400 text-xs text-center rounded">
                    Nonlinear systemic instability detected under stress escalation.
                </div>
            )}
        </div>
    );
}
