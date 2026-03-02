import { useState, useEffect, useCallback } from "react";
import { LocalRunRepository } from "./localRunRepository";
import { StoredRun, RunSummary } from "./types";
import { RunDiff, compareEvidencePacks } from "./compareRuns";

const repo = new LocalRunRepository();

export function useRunHistory() {
    const [runs, setRuns] = useState<RunSummary[]>([]);
    const [selectedRun, setSelectedRun] = useState<StoredRun | null>(null);

    const refresh = useCallback(() => {
        setRuns(repo.list());
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const selectRun = (id: string) => {
        const run = repo.get(id);
        setSelectedRun(run);
    };

    const saveCurrentRun = (evidencePack: any) => {
        if (!evidencePack || !evidencePack.meta || !evidencePack.meta.resultHash) return;

        const id = evidencePack.meta.resultHash;
        const existing = repo.get(id);
        if (!existing) {
            repo.save({
                id,
                label: `Run ${id.substring(0, 8)}`,
                createdAtISO: evidencePack.meta.createdAtISO,
                scenarioPackId: evidencePack.meta.scenarioPackId,
                engineVersion: evidencePack.meta.engineVersion,
                seed: evidencePack.meta.seed,
                resultHash: id,
                evidencePack,
            });
            refresh();
        }
    };

    const updateLabel = (id: string, label: string) => {
        repo.updateLabel(id, label);
        refresh();
        if (selectedRun && selectedRun.id === id) {
            setSelectedRun({ ...selectedRun, label: label });
        }
    };

    const deleteRun = (id: string) => {
        repo.remove(id);
        refresh();
        if (selectedRun?.id === id) {
            setSelectedRun(null);
        }
    };

    const clearSelected = () => {
        setSelectedRun(null);
    };

    const compareWithCurrent = (currentEvidencePack: any, idToCompare: string): RunDiff | null => {
        const saved = repo.get(idToCompare);
        if (!saved || !currentEvidencePack) return null;
        return compareEvidencePacks(currentEvidencePack, saved.evidencePack);
    };

    const getFullRun = (id: string) => repo.get(id);

    return {
        runs,
        selectedRun,
        selectRun,
        saveCurrentRun,
        updateLabel,
        deleteRun,
        clearSelected,
        compareWithCurrent,
        getFullRun
    };
}
