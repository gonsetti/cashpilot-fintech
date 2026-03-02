export type StoredRun = {
    id: string;                 // usar resultHash o fingerprint.resultHash
    label: string;              // editable (default: "Run <shortHash>")
    createdAtISO: string;
    scenarioPackId: string;
    engineVersion: string;
    seed?: number;
    resultHash: string;
    evidencePack: any;          // EvidencePack completo (incluye trust, recommendations, onePager, research si aplica)
};

export type RunSummary = Pick<
    StoredRun,
    "id" | "label" | "createdAtISO" | "scenarioPackId" | "engineVersion" | "seed" | "resultHash"
>;
