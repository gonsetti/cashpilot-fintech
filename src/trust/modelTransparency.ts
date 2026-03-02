export type ModelAssumption = {
    id: string;
    title: string;
    description: string;
};

export type ModelLimit = {
    id: string;
    title: string;
    description: string;
    severity: "INFO" | "IMPORTANT";
};

export type TransparencyParams = {
    iterations?: number;
    horizonMonths?: number;
    confidenceLevel?: number;
    distribution?: string;
    seed?: number;
    systemicShockProbability?: number;
    systemicShockMagnitude?: number;
    defaultThreshold?: number;
    correlationEnabled?: boolean;
};

export const TRUST_STATEMENT_ES: string =
    "Este modelo no predice el futuro. Evalúa resiliencia estructural bajo estrés paramétrico y escenarios plausibles.";

export const EXCEL_COMPARISON_ES: string =
    "Excel es estático y determinístico. SCIL simula distribución de resultados, colas de riesgo y contagio sistémico bajo incertidumbre.";

export const MODEL_ASSUMPTIONS_ES: ModelAssumption[] = [
    { id: "A1", title: "Ejecución Estocástica", description: "Monte Carlo sobre iteraciones configuradas para aproximar distribuciones de pérdida conjunta." },
    { id: "A2", title: "Colas Pesadas", description: "Inyección de anomalías no-normales mediante Systemic Shocks para simular eventos de estrés extremo." },
    { id: "A3", title: "Dependencia Sistémica", description: "Correlación aplicada a nivel red si la matriz y el motor correlacionado se encuentran parametrizados." },
    { id: "A4", title: "Contagio en Cascada", description: "Propagación de pérdidas calculada estrictamente según las exposiciones y sensibilidades matemáticas del Centrality Graph." },
    { id: "A5", title: "Parametrización Condicional", description: "Todos los inputs representan un escenario de estrés hipotético, no una certeza macroeconómica empírica." },
    { id: "A6", title: "Entorno Determinístico", description: "El uso de la semilla estática (Seed) asegura la reproducibilidad paramétrica exacta y facilita auditorías de Gobernanza." }
];

export const MODEL_LIMITS_ES: ModelLimit[] = [
    { id: "L1", title: "Intervención Endógena", description: "No incorpora intervención exógena (rescate estatal, inyecciones de QE, políticas expansivas rápidas) salvo parametrización explícita previa.", severity: "IMPORTANT" },
    { id: "L2", title: "Cumplimiento Regulatorio", description: "No estima requerimientos de capital real ni sustituye formalismos regulatorios (Basilea, CCAR) por sí solo sin calibración.", severity: "IMPORTANT" },
    { id: "L3", title: "Sensibilidad de Red", description: "Altamente sensible a la calidad y granulometría de las dependencias cruzadas y matrices de exposición subyacentes.", severity: "INFO" },
    { id: "L4", title: "Inflexibilidad de Régimen", description: "No modela reajustes dinámicos de las entidades ante crisis endógenas (fire-sales de activos, cierres preventivos) durante la ventana.", severity: "INFO" },
    { id: "L5", title: "Liquidez Macro", description: "No simula asimetría de liquidez cruzada de mercado ante un pánico generalizado.", severity: "IMPORTANT" },
    { id: "L6", title: "Priors Computacionales", description: "Los resultados son estrictamente vectoriales y derivados de la asunción de distribución asignada en el generador de choques.", severity: "INFO" }
];

export function buildTransparencyParams(input: {
    config?: any;
    correlationMatrix?: number[][] | undefined;
    seed?: number | undefined;
}): TransparencyParams {
    const params: TransparencyParams = {};

    if (input.config) {
        if (input.config.iterations !== undefined) params.iterations = input.config.iterations;
        if (input.config.horizonMonths !== undefined) params.horizonMonths = input.config.horizonMonths;
        if (input.config.confidenceLevel !== undefined) params.confidenceLevel = input.config.confidenceLevel;
        if (input.config.distribution) params.distribution = input.config.distribution;
        if (input.config.blackSwanProbability !== undefined) params.systemicShockProbability = input.config.blackSwanProbability;
        if (input.config.interestRateHikeBase !== undefined) params.systemicShockMagnitude = input.config.interestRateHikeBase;
    }

    if (input.seed !== undefined) {
        params.seed = input.seed;
    }

    if (input.correlationMatrix !== undefined && input.correlationMatrix !== null) {
        params.correlationEnabled = true;
    }

    return params;
}
