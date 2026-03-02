import { RunRepository } from "./runRepository";
import { StoredRun, RunSummary } from "./types";

const LOCAL_KEY = "scil_runs_v1";
const MAX_RUNS = 50;

export class LocalRunRepository implements RunRepository {
    private getStored(): StoredRun[] {
        try {
            const data = localStorage.getItem(LOCAL_KEY);
            if (!data) return [];
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) return parsed;
            return [];
        } catch {
            return [];
        }
    }

    private setStored(runs: StoredRun[]): void {
        try {
            // Sort desc by date
            runs.sort((a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime());

            // Limit to max runs
            if (runs.length > MAX_RUNS) {
                runs = runs.slice(0, MAX_RUNS);
            }

            localStorage.setItem(LOCAL_KEY, JSON.stringify(runs));
        } catch (e) {
            // Ignore or log softly but do not throw per requirements
        }
    }

    list(): RunSummary[] {
        return this.getStored().map(r => ({
            id: r.id,
            label: r.label,
            createdAtISO: r.createdAtISO,
            scenarioPackId: r.scenarioPackId,
            engineVersion: r.engineVersion,
            seed: r.seed,
            resultHash: r.resultHash,
        }));
    }

    get(id: string): StoredRun | null {
        const runs = this.getStored();
        return runs.find(r => r.id === id) || null;
    }

    save(run: StoredRun): void {
        const runs = this.getStored();
        const existingIndex = runs.findIndex(r => r.id === run.id);
        if (existingIndex >= 0) {
            runs[existingIndex] = run;
        } else {
            runs.push(run);
        }
        this.setStored(runs);
    }

    updateLabel(id: string, label: string): void {
        const runs = this.getStored();
        const run = runs.find(r => r.id === id);
        if (run) {
            run.label = label;
            this.setStored(runs);
        }
    }

    remove(id: string): void {
        let runs = this.getStored();
        runs = runs.filter(r => r.id !== id);
        this.setStored(runs);
    }

    clear(): void {
        try {
            localStorage.removeItem(LOCAL_KEY);
        } catch { }
    }
}
