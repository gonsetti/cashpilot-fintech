import { SimulationResult } from "../risk-engine/models/SimulationResult";

export type DecisionRecommendation = {
    title: string;
    rationale: string;
    action: string;
    severity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
};

type GeneratedSeverity = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

function escalateSeverity(base: GeneratedSeverity): GeneratedSeverity {
    if (base === "LOW") return "MODERATE";
    if (base === "MODERATE") return "HIGH";
    if (base === "HIGH") return "CRITICAL";
    return "CRITICAL";
}

export function generateRecommendations(input: {
    scenarios: { name: string; result: SimulationResult }[];
    regulatorySummary?: any;
    researchSummary?: any;
}): DecisionRecommendation[] {
    const defaultRecoms: DecisionRecommendation[] = [
        {
            title: "Revisión Estructural de Balance",
            rationale: "La posición actual requiere una optimización estándar.",
            action: "Auditar apalancamiento a nivel Holding.",
            severity: "LOW"
        },
        {
            title: "Monitoreo de Liquidez Cíclica",
            rationale: "El capital circulante se encuentra en umbrales estándar.",
            action: "Mantener reserva mensual de liquidez activa.",
            severity: "LOW"
        },
        {
            title: "Gobierno de Exposición Cruzada",
            rationale: "Las dependencias cruzadas entre filiales están contenidas.",
            action: "Sostener límites de exposición contraparte definidos.",
            severity: "LOW"
        }
    ];

    if (!input.scenarios || input.scenarios.length === 0) {
        return defaultRecoms;
    }

    const extremeScenario = input.scenarios[input.scenarios.length - 1];
    const resRaw = extremeScenario.result as any;

    let baseCollapseProb = resRaw.systemicCollapseProbability;
    if (baseCollapseProb === undefined) {
        baseCollapseProb = resRaw.survivalProbability !== undefined
            ? Math.max(0, (100 - resRaw.survivalProbability) / 100)
            : 0;
    }

    let baseVar = resRaw.VaR ?? resRaw.valueAtRisk ?? 0;
    let baseEs = resRaw.expectedShortfall ?? (baseVar * 1.25);

    // Threshold calculation
    let baseSeverity: GeneratedSeverity = "LOW";
    if (baseCollapseProb >= 0.35) baseSeverity = "CRITICAL";
    else if (baseCollapseProb >= 0.20) baseSeverity = "HIGH";
    else if (baseCollapseProb >= 0.05) baseSeverity = "MODERATE";

    // Tail severity escalation
    if (baseVar > 0 && (baseEs - baseVar) / baseVar > 0.4) {
        baseSeverity = escalateSeverity(baseSeverity);
    }

    const recs: DecisionRecommendation[] = [];

    // Rule 1: Default Concentration
    const defaultCounts = resRaw.defaultCounts || {};
    let maxDefaultBank = "";
    let maxDefaults = -1;
    for (const [bankId, count] of Object.entries(defaultCounts)) {
        if ((count as number) > maxDefaults) {
            maxDefaults = count as number;
            maxDefaultBank = bankId;
        }
    }

    if (maxDefaults > 0 && maxDefaultBank !== "") {
        recs.push({
            title: `Concentración de Riesgo: ${maxDefaultBank}`,
            rationale: "La trayectoria de estrés concentra la mayor frecuencia de cesación de pagos en este nodo específico.",
            action: `Reducir concentración / exposición a la entidad ${maxDefaultBank}.`,
            severity: baseSeverity
        });
    } else {
        recs.push({
            title: "Optimización de Reservas de Capital",
            rationale: "Bajo trayectorias de estrés multivariado, el margen de liquidez consolidado previene fricciones operativas.",
            action: "Rebalancear la reserva de capital hacia entidades con alta burn-rate estática.",
            severity: baseSeverity
        });
    }

    // Rule 2: Collapse Velocity (avg time) vs Probability
    let avgTime = resRaw.averageTimeToCollapse ?? 12; // fallback
    if (baseCollapseProb > 0.15 && avgTime < 6) {
        recs.push({
            title: "Velocidad de Contagio Sistémico",
            rationale: "La estructura converge hacia insuficiencia severa en horizontes cortos ante shocks moderados.",
            action: "Aumentar buffer de liquidez / capital inyectando flujos primarios inmediatos.",
            severity: escalateSeverity(baseSeverity)
        });
    } else {
        recs.push({
            title: "Holgura de Períodos de Tensión",
            rationale: "El contagio muestra resistencia en la ventana temporal, amortiguando impactos directos de deuda.",
            action: "Implementar coberturas escalonadas para shocks de interés a mediano plazo.",
            severity: baseSeverity
        });
    }

    // Rule 3: Research engine or generic fallback
    if (input.researchSummary && input.researchSummary.sensitivityClass) {
        recs.push({
            title: "Inestabilidad Paramétrica Detectada",
            rationale: `El motor de investigación subyacente determinó un régimen de: ${input.researchSummary.sensitivityClass}.`,
            action: "Revisar supuestos del escenario y endurecer límites de exposición macroeconómica.",
            severity: escalateSeverity(baseSeverity)
        });
    } else {
        recs.push({
            title: "Sensibilidad Estructural Lineal",
            rationale: "No se identificó amplificación no lineal catastrófica oculta fuera del VaR esperado.",
            action: "Aprobar plan de expansión moderada bajo los actuales niveles de apalancamiento.",
            severity: baseSeverity === "CRITICAL" ? "HIGH" : baseSeverity
        });
    }

    return recs.slice(0, 3);
}
