import { DecisionRecommendation } from './decisionEngine';
import { SimulationResult } from '../risk-engine/models/SimulationResult';

export function buildExecutiveOnePager(input: {
    scenarioPackId: string;
    engineVersion: string;
    resultHash: string;
    seed?: number;
    scenarios: { name: string; result: SimulationResult }[];
    regulatorySummary?: any;
    researchSummary?: any;
    recommendations: DecisionRecommendation[];
}): string {
    const packStr = input.scenarioPackId ? input.scenarioPackId.substring(0, 8) : "N/A";
    const engineStr = input.engineVersion === 'dev' ? 'DEV' : (input.engineVersion ? input.engineVersion.substring(0, 8) : "N/A");
    const hashStr = input.resultHash ? input.resultHash.substring(0, 8) : "N/A";
    const seedStr = input.seed !== undefined ? input.seed.toString() : "N/A";

    const extremeScenario = input.scenarios.length > 0 ? input.scenarios[input.scenarios.length - 1] : null;
    const resRaw = extremeScenario ? (extremeScenario.result as any) : null;

    let probStr = "N/A";
    let varStr = "N/A";
    let esStr = "N/A";

    if (resRaw) {
        const p = resRaw.systemicCollapseProbability ?? (resRaw.survivalProbability !== undefined ? Math.max(0, (100 - resRaw.survivalProbability) / 100) : 0);
        probStr = (p * 100).toFixed(2) + "%";

        const v = resRaw.VaR ?? resRaw.valueAtRisk ?? 0;
        varStr = "$" + Math.round(v).toLocaleString();

        const e = resRaw.expectedShortfall ?? (v * 1.25);
        esStr = "$" + Math.round(e).toLocaleString();
    }

    const researchContributor = input.researchSummary?.highestESContributorBank
        ? `\n- Top Contribuidor Sistémico (ES): ${input.researchSummary.highestESContributorBank}`
        : "";

    const lines = [
        "SCIL — Resumen Ejecutivo (Demo Institucional)",
        "--------------------------------------------------",
        `[TRAZABILIDAD] PACK:${packStr} | ENGINE:${engineStr} | HASH:${hashStr} | SEED:${seedStr}`,
        "",
        "METRICAS DE ESTRÉS EXTREMO:",
        `- Escenario Evaluado: ${extremeScenario ? extremeScenario.name : "N/A"}`,
        `- Probabilidad de Colapso Sistémico: ${probStr}`,
        `- Value at Risk (VaR 95%): ${varStr}`,
        `- Expected Shortfall (CVaR): ${esStr}${researchContributor}`,
        "",
        "TOP 3 ACCIONES RECOMENDADAS:"
    ];

    input.recommendations.forEach((rec, idx) => {
        lines.push(`${idx + 1}. ${rec.title.toUpperCase()} [${rec.severity}]`);
        lines.push(`   Acción: ${rec.action}`);
    });

    lines.push("");
    lines.push("--------------------------------------------------");
    lines.push("Este resultado es determinístico bajo el seed indicado y exportable como Evidence Pack.");

    return lines.join("\n");
}
