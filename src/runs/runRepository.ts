import { StoredRun, RunSummary } from "./types";

export interface RunRepository {
    list(): RunSummary[];
    get(id: string): StoredRun | null;
    save(run: StoredRun): void;
    updateLabel(id: string, label: string): void;
    remove(id: string): void;
    clear(): void;
}
