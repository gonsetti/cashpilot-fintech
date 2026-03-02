export type RunDiff = {
    collapseProbabilityDelta?: number;
    var95Delta?: number;
    cvar95Delta?: number;
    expectedShortfallDelta?: number;
    robustnessDelta?: number;
    regimeChange?: { from: string; to: string };
    summary: string;
};

export function compareEvidencePacks(current: any, saved: any): RunDiff {
    const cSnap = current?.executiveSnapshot || {};
    const sSnap = saved?.executiveSnapshot || {};

    const diff: RunDiff = {
        summary: ""
    };

    if (cSnap.collapseProbability !== undefined && sSnap.collapseProbability !== undefined) {
        diff.collapseProbabilityDelta = cSnap.collapseProbability - sSnap.collapseProbability;
    }

    if (cSnap.var95 !== undefined && sSnap.var95 !== undefined) {
        diff.var95Delta = cSnap.var95 - sSnap.var95;
    }

    if (cSnap.cvar95 !== undefined && sSnap.cvar95 !== undefined) {
        diff.cvar95Delta = cSnap.cvar95 - sSnap.cvar95;
    }

    if (cSnap.capitalPressureIndex !== undefined && sSnap.capitalPressureIndex !== undefined) {
        diff.robustnessDelta = cSnap.capitalPressureIndex - sSnap.capitalPressureIndex;
    }

    if (cSnap.systemicRegime && sSnap.systemicRegime && cSnap.systemicRegime !== sSnap.systemicRegime) {
        diff.regimeChange = { from: sSnap.systemicRegime, to: cSnap.systemicRegime };
    }

    const lines: string[] = [];
    lines.push("Comparación de Escenarios:");

    if (diff.collapseProbabilityDelta !== undefined && diff.collapseProbabilityDelta !== 0) {
        const dir = diff.collapseProbabilityDelta > 0 ? "↑" : "↓";
        lines.push(`- Probabilidad de colapso de red ${dir} (${Math.abs(diff.collapseProbabilityDelta).toFixed(2)})`);
    } else if (diff.collapseProbabilityDelta === 0) {
        lines.push(`- Riesgo de colapso de red estable (=)`);
    }

    if (diff.var95Delta !== undefined && diff.var95Delta !== 0) {
        const dir = diff.var95Delta > 0 ? "↑" : "↓";
        lines.push(`- Riesgo de cola (VaR95) transicionado ${dir}`);
    }

    if (diff.regimeChange) {
        lines.push(`- Régimen paramétrico mutó (${diff.regimeChange.from} → ${diff.regimeChange.to})`);
    }

    if (lines.length === 1) {
        diff.summary = "Métricas transversales sin desviaciones sustanciales.";
    } else {
        diff.summary = lines.join(" ");
    }

    return diff;
}
