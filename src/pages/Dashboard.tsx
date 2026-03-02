import React, { useEffect, useState, Suspense, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// SCIL APIs
import { getCapitalState } from "@/api/capital";
import { getSystemicRisk, SystemicRiskReport } from "@/api/risk";
import { executeSimulation } from "@/api/simulation";
import { getOptimalAllocation, OptimalAllocationResponse } from "@/api/allocation";
import { GovernanceAudit, GovernanceLog } from "@/core/governance";

import { Entity } from "@/models/Entity";
import { Relationship } from "@/models/Relationship";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { buildEvidencePack } from "@/risk-engine/audit/evidencePack";
import { signEvidence } from "@/risk-engine/audit/signEvidence";
import { stableStringify } from "@/utils/stableStringify";
import { runInstitutionalDemo } from "@/demo/runInstitutionalDemo";
import { generateRecommendations, DecisionRecommendation } from "@/demo/decisionEngine";
import { buildExecutiveOnePager } from "@/demo/executiveOnePager";
import {
  TRUST_STATEMENT_ES,
  EXCEL_COMPARISON_ES,
  MODEL_ASSUMPTIONS_ES,
  MODEL_LIMITS_ES,
  buildTransparencyParams
} from "@/trust/modelTransparency";

import { useRunHistory } from "@/runs/useRunHistory";
import { RunDiff } from "@/runs/compareRuns";

const ResearchModule = FEATURE_FLAGS.ADVANCED_ANALYTICS
  ? React.lazy(() => import("@/components/dashboard/ResearchModule"))
  : null;

export default function SCILTerminal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Data State
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [globalLiquidity, setGlobalLiquidity] = useState(0);
  const [globalBurn, setGlobalBurn] = useState(0);

  const [riskReport, setRiskReport] = useState<SystemicRiskReport | null>(null);
  const [allocationReport, setAllocationReport] = useState<OptimalAllocationResponse | null>(null);
  const [ledger, setLedger] = useState<GovernanceLog[]>([]);

  // Simulation State
  const [simRunning, setSimRunning] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Demo State
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoMessage, setDemoMessage] = useState("");
  const [isDemoResult, setIsDemoResult] = useState(false);

  // Presenter Mode State
  const [presenterMode, setPresenterMode] = useState(false);
  const [presenterStep, setPresenterStep] = useState(1);
  const [copied, setCopied] = useState(false);

  // Run History & Compare State
  const { runs, selectedRun, selectRun, saveCurrentRun, updateLabel, deleteRun, clearSelected, compareWithCurrent, getFullRun } = useRunHistory();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [compareDiff, setCompareDiff] = useState<RunDiff | null>(null);

  // DOM Refs for auto-scrolling
  const section1Ref = useRef<HTMLElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const section4Ref = useRef<HTMLDivElement>(null);
  const section5Ref = useRef<HTMLDivElement>(null);

  const recommendations = useMemo<DecisionRecommendation[]>(() => {
    if (!simResult) return [];
    const scenariosForRec = (isDemoResult && simResult.scenarios) ? simResult.scenarios : [{ name: "Stress Run", result: simResult }];
    return generateRecommendations({
      scenarios: scenariosForRec,
      regulatorySummary: riskReport,
      researchSummary: simResult.researchSummary
    });
  }, [simResult, isDemoResult, riskReport]);

  const onePagerText = useMemo<string>(() => {
    if (!simResult) return "";
    const scenariosForRec = (isDemoResult && simResult.scenarios) ? simResult.scenarios : [{ name: "Stress Run", result: simResult }];
    return buildExecutiveOnePager({
      scenarioPackId: simResult.scenarioPackId || "-",
      engineVersion: simResult.engineVersion || "-",
      resultHash: simResult.resultHash || "-",
      seed: isDemoResult ? 1337 : simResult.fingerprint?.seed,
      scenarios: scenariosForRec,
      regulatorySummary: riskReport,
      researchSummary: simResult.researchSummary,
      recommendations
    });
  }, [simResult, isDemoResult, riskReport, recommendations]);

  const transparencyConfig = useMemo(() => {
    return {
      trustStatement: TRUST_STATEMENT_ES,
      excelComparison: EXCEL_COMPARISON_ES,
      params: buildTransparencyParams({
        config: isDemoResult ? { iterations: 10000, horizonMonths: 12, blackSwanProbability: 0.02, confidenceLevel: 0.95 } : undefined,
        seed: isDemoResult ? 1337 : simResult?.fingerprint?.seed,
        correlationMatrix: []
      }),
      assumptions: MODEL_ASSUMPTIONS_ES,
      limits: MODEL_LIMITS_ES
    };
  }, [simResult, isDemoResult]);

  const copyExecSummary = () => {
    navigator.clipboard.writeText(onePagerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildCurrentEvidencePack = useCallback(() => {
    if (!simResult || !simResult.scenarioPackId) return null;
    const isDemo = isDemoResult && simResult.scenarios && simResult.scenarios.length > 0;
    return buildEvidencePack({
      scenarioPackId: simResult.scenarioPackId,
      engineVersion: simResult.engineVersion,
      seed: isDemoResult ? 1337 : (simResult.fingerprint?.seed),
      createdAtISO: simResult.fingerprint?.createdAtISO || new Date().toISOString(),
      resultHash: simResult.resultHash,
      scenarios: isDemo ? simResult.scenarios : [{ name: "Systemic Contagion Shock", result: simResult }],
      regulatorySummary: riskReport,
      researchSummary: isDemo ? simResult.researchSummary : undefined,
      recommendations,
      executiveOnePager: onePagerText,
      trust: transparencyConfig
    });
  }, [simResult, isDemoResult, riskReport, recommendations, onePagerText, transparencyConfig]);

  useEffect(() => {
    if (simResult && !demoRunning && !simRunning) {
      const pack = buildCurrentEvidencePack();
      if (pack) saveCurrentRun(pack);
    }
  }, [simResult, demoRunning, simRunning, buildCurrentEvidencePack, saveCurrentRun]);

  // Derived Active State (Overridden by Selected Run if viewing history)
  const activeSimResult = selectedRun ? {
    ...(selectedRun.evidencePack.scenarios?.[selectedRun.evidencePack.scenarios.length - 1]?.result || selectedRun.evidencePack.scenarios?.[0]?.result || {}),
    scenarioPackId: selectedRun.scenarioPackId,
    engineVersion: selectedRun.engineVersion,
    resultHash: selectedRun.resultHash,
    fingerprint: { seed: selectedRun.seed }
  } : simResult;

  const activeRecommendations = selectedRun ? (selectedRun.evidencePack.recommendations || []) : recommendations;
  const activeIsDemoResult = selectedRun ? (selectedRun.evidencePack.scenarios?.length > 1) : isDemoResult;

  const getPresenterClass = (targetStep: number) => {
    if (!presenterMode) return '';
    return presenterStep === targetStep
      ? 'ring-2 ring-emerald-500/50 scale-[1.01] z-10 transition-all duration-500 shadow-xl shadow-emerald-900/10'
      : 'opacity-30 transition-all duration-500 blur-[1px]';
  };

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Basic auth check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
        bootTerminal();
      }
    });
  }, [navigate]);

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-2xl">
          <span className="material-icons text-zinc-500 text-3xl">lock</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-4 tracking-tight">Acceso Institucional Restringido</h1>
        <p className="text-zinc-400 text-sm max-w-md mb-8 leading-relaxed">Sovereign Atlas opera bajo mandato estratégico confidencial.</p>
        <button onClick={() => navigate("/contacto")} className="bg-zinc-100 text-zinc-950 px-6 py-2.5 rounded text-sm font-semibold hover:bg-white transition-colors">Solicitar Evaluación Confidencial</button>
      </div>
    );
  }

  const bootTerminal = async () => {
    setLoading(true);
    try {
      const [capital, risk, alloc] = await Promise.all([
        getCapitalState(),
        getSystemicRisk(),
        getOptimalAllocation()
      ]);

      setEntities(capital.entities);
      setRelationships(capital.relationships);
      setGlobalLiquidity(capital.totalLiquidity);
      setGlobalBurn(capital.globalBurn);

      setRiskReport(risk);
      setAllocationReport(alloc);
      setLedger(GovernanceAudit.getLedger());
    } catch (e) {
      console.error("SCIL Boot Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const runStressTest = async () => {
    setSimRunning(true);
    setErrorMessage(null);
    try {
      const result = await executeSimulation({
        scenarioName: "Systemic Contagion Shock",
        iterations: 10000,
        revenueShockRange: [0.6, 1.0], // -40% drop
        costShockRange: [1.0, 1.3],    // +30% spike
        interestRateHikeBase: 0.05,    // +500 bps
        blackSwanProbability: 0.02,
        horizonMonths: 12
      });
      setSimResult(result);
      setLedger(GovernanceAudit.getLedger()); // Refresh logs
    } catch (err: any) {
      setErrorMessage(err.message || "Simulation failed under UI safety policy.");
    } finally {
      setSimRunning(false);
    }
  };

  const downloadEvidencePack = async () => {
    const pack = selectedRun ? selectedRun.evidencePack : buildCurrentEvidencePack();
    if (!pack) return;

    const payloadString = stableStringify(pack);

    let secret = "";
    if (typeof process !== 'undefined' && process.env) {
      secret = process.env.NEXT_PUBLIC_EVIDENCE_SECRET || "";
    } else if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      secret = (import.meta as any).env.VITE_EVIDENCE_SECRET || "";
    }

    if (secret) {
      const signature = await signEvidence(payloadString, secret);
      if (signature) {
        (pack as any).evidenceSignature = signature;
      }
    }

    const finalJson = stableStringify(pack);
    const blob = new Blob([finalJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scil_evidence_${simResult.scenarioPackId.substring(0, 8)}_${simResult.resultHash.substring(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const runDemo = async () => {
    setDemoRunning(true);
    setDemoStep(1);
    setIsDemoResult(false);
    setErrorMessage(null);
    setSimResult(null); // Clear previous runs

    try {
      const demoResult = await runInstitutionalDemo((step, label) => {
        setDemoStep(step);
        setDemoMessage(label);
      });

      // Show the extreme stress outcome in the main dashboard view
      const worstScenario = demoResult.scenarios[demoResult.scenarios.length - 1]; // "Extreme Systemic Stress"

      const syntheticResult = {
        ...worstScenario.result,
        scenarioPackId: demoResult.scenarioPackId,
        engineVersion: demoResult.engineVersion,
        resultHash: demoResult.resultHash,
        fingerprint: demoResult.fingerprint
      };

      setSimResult(syntheticResult);
      setIsDemoResult(true);
      setLedger(GovernanceAudit.getLedger());
    } catch (err: any) {
      setErrorMessage(err.message || "Institutional Demo failed.");
    } finally {
      setDemoRunning(false);
      setDemoStep(0);
      setDemoMessage("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 flex flex-col items-center justify-center font-mono text-sm">
        <span className="material-icons animate-spin text-2xl mb-4 text-emerald-500">sync</span>
        INITIALIZING SOVEREIGN CAPITAL INTELLIGENCE LAYER...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono text-xs uppercase cursor-default selection:bg-emerald-900 selection:text-emerald-100">

      {/* HEADER NAV */}
      <header className="border-b border-zinc-900 bg-[#0a0a0a] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-500">
            <span className="material-icons text-sm">account_tree</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-zinc-100 tracking-widest text-sm">SCIL TERMINAL</h1>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 text-[0.65rem] border border-blue-900/50 bg-blue-900/20 text-blue-400 px-2 py-0.5 rounded hover:bg-blue-900/40 transition-colors tracking-widest font-bold"
            >
              <span className="material-icons text-[0.7rem]">history</span> RUN HISTORY
              {runs.length > 0 && <span className="bg-blue-500/20 px-1 rounded text-blue-300 ml-1">{runs.length}</span>}
            </button>

            <div className="flex items-center gap-2 text-[0.6rem] text-zinc-500 mt-0.5 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              SECURE CONNECTION ESTABLISHED
            </div>
          </div>
        </div>

        {/* PRESENTER MODE TOGGLE */}
        <div className="flex items-center gap-2 border-r border-zinc-800 pr-6 mr-6 transition-opacity">
          <span className={`text-[0.65rem] font-bold tracking-widest ${presenterMode ? 'text-emerald-400' : 'text-zinc-500'}`}>PRESENTER</span>
          <button
            onClick={() => {
              setPresenterMode(!presenterMode);
              if (!presenterMode) setPresenterStep(1);
            }}
            className={`w-8 h-4 rounded-full flex items-center transition-colors px-0.5 ${presenterMode ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-zinc-800 border border-zinc-700'}`}
          >
            <div className={`w-3 h-3 rounded-full transition-transform ${presenterMode ? 'bg-emerald-500 translate-x-3.5' : 'bg-zinc-500 translate-x-0'}`}></div>
          </button>
        </div>

        {/* DEMO MODE TRIGGER */}
        <div className="flex-1 flex justify-start">
          <div className="flex flex-col items-center">
            <button
              onClick={runDemo}
              disabled={demoRunning || simRunning}
              className="bg-emerald-900/30 text-emerald-400 border border-emerald-800 hover:bg-emerald-900/50 hover:text-emerald-300 transition-all px-6 py-1.5 rounded disabled:opacity-30 flex items-center gap-2 font-bold tracking-widest"
            >
              {demoRunning ? <span className="material-icons animate-spin text-sm">refresh</span> : <span className="material-icons text-sm">bolt</span>}
              {demoRunning ? 'EXECUTING PIPELINE...' : 'RUN INSTITUTIONAL DEMO'}
            </button>
            {demoRunning ? (
              <div className="text-[0.55rem] text-emerald-500 mt-1 uppercase tracking-widest font-bold flex gap-2">
                <span>STEP {demoStep}/3</span>
                <span>{demoMessage}</span>
              </div>
            ) : (
              <span className="text-[0.55rem] text-zinc-600 mt-1 uppercase tracking-widest">
                5 Scenarios · Deterministic Seed · Evidence Export
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-6 items-center text-zinc-500">
          <div className="flex flex-col items-end">
            <span className="text-zinc-400">GLOBAL LIQUIDITY</span>
            <span className="text-lg text-emerald-400 font-medium">${globalLiquidity.toLocaleString()}</span>
          </div>
          <div className="w-px h-8 bg-zinc-800"></div>
          <div className="flex flex-col items-end">
            <span className="text-zinc-400">NETWORK BURN (M)</span>
            <span className="text-lg text-rose-500 font-medium">${globalBurn.toLocaleString()}</span>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="ml-4 hover:text-zinc-100 transition-colors">
            <span className="material-icons text-sm">power_settings_new</span>
          </button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">

        {/* NETWORK OVERVIEW (COL 1-8) */}
        <section className="col-span-12 xl:col-span-8 flex flex-col gap-6">
          <div ref={section1Ref as any} className={`bg-[#0a0a0a] border border-zinc-900 rounded p-5 relative overflow-hidden ${getPresenterClass(1)}`}>
            <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-2">
              <h2 className="text-zinc-100 font-semibold tracking-wider flex items-center gap-2">
                <span className="material-icons text-emerald-500 text-sm">share</span>
                NETWORK OVERVIEW / CAPITAL GRAPH
              </h2>
              <span className="bg-zinc-900 px-2 py-1 rounded text-[0.6rem]">{entities.length} NODES MAPPED</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="py-2 px-3 font-normal">NODE ID</th>
                    <th className="py-2 px-3 font-normal">INSTITUTION</th>
                    <th className="py-2 px-3 font-normal text-right">LIQUIDITY</th>
                    <th className="py-2 px-3 font-normal text-right">BURN RATE</th>
                    <th className="py-2 px-3 font-normal text-right">EQUITY</th>
                    <th className="py-2 px-3 font-normal text-center">RISK TIER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  {entities.map(e => (
                    <tr key={e.id} className="hover:bg-zinc-900/30 transition-colors group">
                      <td className="py-3 px-3 text-zinc-400">{e.id}</td>
                      <td className="py-3 px-3 text-zinc-200">{e.name}</td>
                      <td className="py-3 px-3 text-right text-emerald-500/80 group-hover:text-emerald-400">${e.liquidity.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-rose-500/80">${e.monthlyBurn.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-zinc-400">${e.equity.toLocaleString()}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[0.6rem] border ${e.riskScore > 50 ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' : e.riskScore > 20 ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'}`}>
                          {e.riskScore.toFixed(0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* EXPOSURE MATRIX */}
            <h3 className="text-zinc-500 font-semibold tracking-wider mt-6 mb-3 border-b border-zinc-900 pb-2">CROSS-ENTITY EXPOSURE MATRIX</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {relationships.map((r, i) => (
                <div key={i} className="bg-zinc-900/30 border border-zinc-800/50 p-3 rounded flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[0.65rem] text-zinc-500">
                    <span>{r.type}</span>
                    <span className="text-orange-500/70">{r.sensitivity} SENSITIVITY</span>
                  </div>
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-zinc-300 font-bold">{r.fromEntity}</span>
                    <span className="material-icons text-zinc-700 text-xs">arrow_forward</span>
                    <span className="text-zinc-300 font-bold">{r.toEntity}</span>
                  </div>
                  <div className="text-right text-emerald-500 text-xs mt-1 border-t border-zinc-800/50 pt-2">
                    ${r.value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MODEL TRANSPARENCY (LEVEL 12) */}
          <div ref={section2Ref as any} className={`bg-[#0a0a0a] border border-zinc-900 rounded p-5 relative overflow-hidden ${getPresenterClass(2)}`}>
            <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-2">
              <h2 className="text-zinc-100 font-semibold tracking-wider flex items-center gap-2">
                <span className="material-icons text-emerald-500 text-sm">policy</span>
                TRANSPARENCIA DEL MODELO (TRUST LAYER)
              </h2>
            </div>

            <div className="flex flex-col gap-4 text-zinc-300">
              <div className="bg-zinc-900/40 p-3 rounded border-l-2 border-emerald-500/50">
                <p className="text-sm font-semibold tracking-wide text-zinc-200 mb-1">TRUST STATEMENT</p>
                <p className="text-[0.65rem] text-zinc-400 leading-relaxed">{transparencyConfig.trustStatement}</p>
                <p className="text-[0.65rem] text-zinc-500 leading-relaxed mt-1 italic">"{transparencyConfig.excelComparison}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ASSUMPTIONS */}
                <div>
                  <h3 className="text-[0.65rem] font-bold text-zinc-500 mb-2 border-b border-zinc-800 pb-1">MODEL ASSUMPTIONS</h3>
                  <ul className="space-y-2">
                    {transparencyConfig.assumptions.map(a => (
                      <li key={a.id} className="text-[0.6rem] leading-tight">
                        <span className="text-zinc-300 font-bold block">{a.title}</span>
                        <span className="text-zinc-500">{a.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* LIMITS */}
                <div>
                  <h3 className="text-[0.65rem] font-bold text-zinc-500 mb-2 border-b border-zinc-800 pb-1">MODEL LIMITS</h3>
                  <ul className="space-y-2">
                    {transparencyConfig.limits.map(l => (
                      <li key={l.id} className="text-[0.6rem] leading-tight">
                        <span className="flex items-center gap-1">
                          <span className={`px-1 py-0.5 rounded text-[0.5rem] font-bold ${l.severity === 'IMPORTANT' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'}`}>{l.severity}</span>
                          <span className="text-zinc-300 font-bold">{l.title}</span>
                        </span>
                        <span className="text-zinc-500 block mt-0.5">{l.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-2 pt-3 border-t border-zinc-800/50">
                <h3 className="text-[0.65rem] font-bold text-zinc-500 mb-2">EXECUTION PARAMETERS</h3>
                <div className="flex flex-wrap gap-2 text-[0.6rem] font-mono">
                  {Object.entries(transparencyConfig.params).map(([key, value]) => (
                    <span key={key} className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-zinc-400">
                      <span className="text-zinc-600">{key}:</span> {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SIMULATION LAB */}
          <div ref={section3Ref as any} className={`bg-[#0a0a0a] border border-zinc-900 rounded p-5 ${getPresenterClass(3)}`}>
            <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-2">
              <h2 className="text-zinc-100 font-semibold tracking-wider flex items-center gap-2">
                <span className="material-icons text-amber-500 text-sm">science</span>
                MONTE CARLO SIMULATION LAB
              </h2>
              <button
                onClick={runStressTest}
                disabled={simRunning}
                className="bg-zinc-100 text-[#050505] px-4 py-1.5 rounded font-bold hover:bg-zinc-300 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {simRunning ? <span className="material-icons animate-spin text-sm">refresh</span> : <span className="material-icons text-sm">play_arrow</span>}
                {simRunning ? 'EXECUTING...' : 'RUN STRESS TEST (10K ITERATIONS)'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded col-span-1 lg:col-span-1">
                <h4 className="text-zinc-500 mb-3 border-b border-zinc-800 pb-2">SCENARIO PARAMETERS</h4>
                <ul className="space-y-2 text-[0.65rem] text-zinc-400">
                  <li className="flex justify-between"><span>STRUCTURAL SHOCK:</span><span className="text-zinc-200">ACTIVE</span></li>
                  <li className="flex justify-between"><span>INTEREST HIKE:</span><span className="text-zinc-200">+500 BPS</span></li>
                  <li className="flex justify-between"><span>HORIZON:</span><span className="text-zinc-200">12 MONTHS</span></li>
                  <li className="flex justify-between"><span>BLACK SWAN PROB:</span><span className="text-amber-500">2.0%</span></li>
                </ul>
              </div>

              {activeSimResult && (
                <div className="bg-zinc-900 border border-emerald-900/50 p-4 rounded col-span-1 lg:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-zinc-500 text-[0.65rem] mb-1">SURVIVAL PROBABILITY</span>
                    <span className={`text-2xl font-bold ${activeSimResult.survivalProbability > 90 ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {activeSimResult.survivalProbability.toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 text-[0.65rem] mb-1">VALUE AT RISK (95TH P)</span>
                    <span className="text-2xl font-bold text-rose-500">
                      ${activeSimResult.valueAtRisk.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 text-[0.65rem] mb-1">WORST CASE LIQUIDITY</span>
                    <span className="text-lg font-bold text-zinc-300">
                      ${activeSimResult.worstCaseLiquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 text-[0.65rem] mb-1">SIMULATED AVG FRAGILITY</span>
                    <span className="text-lg font-bold text-amber-500">
                      {activeSimResult.averageFragility.toFixed(2)}
                    </span>
                  </div>
                  {activeSimResult.scenarioPackId && (
                    <div className="col-span-2 mt-2 pt-3 border-t border-zinc-800 flex justify-between items-center text-[0.6rem] text-zinc-500 font-mono tracking-widest">
                      <div className="flex gap-4 items-center">
                        <span title={activeSimResult.scenarioPackId}>PACK: {activeSimResult.scenarioPackId.substring(0, 8)}</span>
                        <span title={activeSimResult.engineVersion}>ENGINE: {activeSimResult.engineVersion === 'dev' ? 'DEV' : activeSimResult.engineVersion.substring(0, 8)}</span>
                        <span title={activeSimResult.resultHash}>HASH: {activeSimResult.resultHash.substring(0, 8)}</span>
                        {activeIsDemoResult && (
                          <span className="bg-emerald-900/30 text-emerald-500 border border-emerald-800/50 px-2 py-0.5 rounded font-bold">
                            SEMBRADO: {activeSimResult.fingerprint?.seed || 1337}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 items-center">
                        {selectedRun ? (
                          <span className="text-blue-400 font-bold tracking-widest bg-blue-900/20 border border-blue-900/50 px-2 rounded py-0.5 border-dashed">
                            VIEWING SAVED RUN
                          </span>
                        ) : activeSimResult.runtimeMs ? (
                          <span>{activeSimResult.runtimeMs} MS</span>
                        ) : null}
                        <button
                          onClick={downloadEvidencePack}
                          title="Download Cryptographic Evidence Pack"
                          className="hover:text-emerald-400 transition-colors flex items-center gap-1 border border-zinc-700 px-2 py-0.5 rounded"
                        >
                          <span className="material-icons text-[0.7rem]">download</span> EXPORT
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!simResult && !simRunning && !errorMessage && (
                <div className="bg-zinc-900/20 border border-zinc-800 border-dashed p-4 rounded col-span-1 lg:col-span-2 flex items-center justify-center text-zinc-600">
                  AWAITING EXECUTION COMMAND
                </div>
              )}

              {errorMessage && (
                <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded col-span-1 lg:col-span-2 flex flex-col items-center justify-center text-rose-500 gap-2">
                  <div className="flex items-center gap-2 font-bold tracking-wider">
                    <span className="material-icons text-sm">gpp_bad</span>
                    SAFETY LIMIT TRIGGERED
                  </div>
                  <div className="text-[0.65rem] text-rose-400/80 text-center">
                    {errorMessage}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SIDE PANELS (COL 9-12) */}
        <section className="col-span-12 xl:col-span-4 flex flex-col gap-6">

          {/* SYSTEMIC RISK PANEL */}
          <div className={`bg-[#0a0a0a] border border-zinc-900 rounded p-5 ${getPresenterClass(1)}`}>
            <h2 className="text-zinc-100 font-semibold tracking-wider flex items-center gap-2 mb-4 border-b border-zinc-900 pb-2">
              <span className="material-icons text-rose-500 text-sm">warning</span>
              SYSTEMIC RISK PANEL
            </h2>

            {riskReport && (
              <>
                <div className="mb-6 bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                  <span className="block text-zinc-500 text-[0.65rem] mb-1">MACRO FRAGILITY INDEX</span>
                  <span className={`text-4xl font-black ${riskReport.systemicFragilityIndex > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {riskReport.systemicFragilityIndex.toFixed(2)}
                  </span>
                </div>

                <h3 className="text-zinc-500 font-semibold tracking-wider mb-3">CRITICAL VULNERABILITY NODES</h3>
                <div className="space-y-3">
                  {riskReport.criticalNodes.map(node => (
                    <div key={node.entityId} className="flex flex-col gap-1 p-3 bg-zinc-900/40 rounded border border-zinc-800/50">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-200 font-bold">{node.entityId}</span>
                        <span className="text-rose-500 font-bold">{node.isolatedRisk.toFixed(1)} RISK</span>
                      </div>
                      <div className="flex justify-between text-[0.65rem] text-zinc-500">
                        <span>CEN: {node.centralityScore.toFixed(3)}</span>
                        <span>EXP: {node.exposureWeight.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* CAPITAL ALLOCATION ENGINE */}
          <div ref={section4Ref as any} className={`bg-[#0a0a0a] border border-zinc-900 rounded p-5 ${getPresenterClass(4)}`}>
            <h2 className="text-zinc-100 font-semibold tracking-wider flex items-center gap-2 mb-4 border-b border-zinc-900 pb-2">
              <span className="material-icons text-blue-500 text-sm">swap_horiz</span>
              OPTIMAL ALLOCATION SOLVER
            </h2>

            {allocationReport && allocationReport.result.transfers.length > 0 ? (
              <div className="space-y-3">
                <div className="text-[0.65rem] text-zinc-500 mb-2">
                  EXECUTING THESE TRANSFERS WILL DROP SYSTEMIC FRAGILITY BY <span className="text-emerald-400 font-bold">{allocationReport.result.systemicImprovementPercent.toFixed(2)}%</span>.
                </div>
                {allocationReport.result.transfers.map((t, i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 p-3 rounded">
                    <div className="flex items-center gap-2 justify-between mb-2">
                      <span className="text-zinc-300 font-bold">{t.sourceEntityId}</span>
                      <span className="text-zinc-600 block flex-1 border-b border-dashed border-zinc-700 mx-2 relative">
                        <span className="material-icons text-[0.6rem] text-blue-500 absolute -top-1.5 right-0 bg-zinc-900">arrow_forward</span>
                      </span>
                      <span className="text-zinc-300 font-bold">{t.targetEntityId}</span>
                    </div>
                    <div className="flex justify-between items-center text-[0.65rem]">
                      <span className="text-blue-400">${t.amount.toLocaleString()}</span>
                      <span className="text-emerald-500">TRANSFER</span>
                    </div>
                  </div>
                ))}
                <button className="w-full mt-4 bg-blue-500/10 text-blue-400 border border-blue-500/30 py-2 rounded hover:bg-blue-500/20 transition-colors">
                  EXECUTE TRANSFERS
                </button>
              </div>
            ) : (
              <div className="text-zinc-500 text-center py-6 text-[0.65rem]">
                NO OPTIMAL REALLOCATIONS FOUND UNDER CURRENT CONSTRAINTS
              </div>
            )}
          </div>

          {/* GOVERNANCE AUDIT LOG */}
          <div className={`bg-[#0a0a0a] border border-zinc-900 rounded p-5 ${getPresenterClass(4)}`}>
            <h2 className="text-zinc-100 font-semibold tracking-wider flex items-center gap-2 mb-4 border-b border-zinc-900 pb-2">
              <span className="material-icons text-purple-500 text-sm">gavel</span>
              GOVERNANCE LEDGER (WORM)
            </h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {ledger.length === 0 && <span className="text-zinc-600 text-[0.65rem]">LEDGER EMPTY</span>}
              {[...ledger].reverse().map(log => (
                <div key={log.hash} className="p-2 border-l-2 border-zinc-800 bg-zinc-900/30">
                  <div className="flex justify-between items-center text-[0.6rem] text-zinc-500 mb-1">
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span title={log.hash} className="text-zinc-700 truncate w-16 cursor-help">{log.hash.substring(0, 8)}</span>
                  </div>
                  <div className={`text-[0.65rem] font-bold ${log.eventType === 'RISK_ALERT' ? 'text-rose-400' : log.eventType === 'SIMULATION_RUN' ? 'text-amber-400' : 'text-blue-400'}`}>
                    {log.eventType}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* RECOMMENDATIONS & RESEARCH */}
        <div ref={section5Ref as any} className={`col-span-12 flex flex-col gap-6 transition-all duration-500 ${presenterMode && presenterStep === 5 ? 'ring-2 ring-emerald-500/50 p-2 rounded-lg scale-[1.01] z-10 block' : (presenterMode ? 'opacity-30' : '')}`}>

          {/* ACTIONABLE RECOMMENDATIONS */}
          {activeRecommendations.length > 0 && (
            <div className="bg-[#0a0a0a] border border-zinc-900 rounded p-5">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-2">
                <h2 className="text-zinc-100 font-semibold tracking-wider flex items-center gap-2">
                  <span className="material-icons text-emerald-500 text-sm">lightbulb</span>
                  ACTIONABLE RECOMMENDATIONS (DECISION ENGINE)
                </h2>
                <div className="flex gap-4 items-center">
                  {copied && <span className="text-emerald-500 text-[0.6rem] font-bold animate-pulse">COPIED TO CLIPBOARD</span>}
                  <button
                    onClick={copyExecSummary}
                    className="flex items-center gap-1 text-[0.65rem] border border-zinc-700 hover:bg-zinc-800 text-zinc-300 px-3 py-1 rounded transition-colors"
                  >
                    <span className="material-icons text-[0.75rem]">content_copy</span> EXTRACT EXEC SUMMARY
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeRecommendations.map((rec: any, i: number) => (
                  <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded flex flex-col gap-3 relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-1 h-full ${rec.severity === 'CRITICAL' ? 'bg-rose-600' : rec.severity === 'HIGH' ? 'bg-rose-400' : rec.severity === 'MODERATE' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>

                    <div className="flex justify-between items-start pl-2">
                      <h4 className="text-zinc-200 font-bold text-sm tracking-wide leading-tight">{rec.title}</h4>
                      <span className={`text-[0.55rem] font-bold px-1.5 py-0.5 rounded border ${rec.severity === 'CRITICAL' ? 'border-rose-600/50 text-rose-500 bg-rose-900/10' : rec.severity === 'HIGH' ? 'border-rose-400/50 text-rose-400 bg-rose-900/10' : rec.severity === 'MODERATE' ? 'border-amber-500/50 text-amber-500 bg-amber-900/10' : 'border-emerald-500/50 text-emerald-500 bg-emerald-900/10'}`}>
                        {rec.severity}
                      </span>
                    </div>

                    <p className="text-[0.7rem] text-zinc-500 pl-2 leading-relaxed flex-1">
                      {rec.rationale}
                    </p>

                    <div className="pl-2 mt-2 pt-3 border-t border-zinc-800/50">
                      <span className="block text-[0.6rem] text-zinc-600 mb-1">RECOMMENDED ACTION</span>
                      <span className="text-[0.75rem] text-emerald-400 font-bold">{rec.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {FEATURE_FLAGS.ADVANCED_ANALYTICS && ResearchModule && (
            <Suspense fallback={null}>
              <ResearchModule scenarios={selectedRun ? selectedRun.evidencePack.scenarios : (simResult ? (isDemoResult ? simResult.scenarios : [{ name: "Systemic Contagion Shock", result: simResult }]) : [])} />
            </Suspense>
          )}
        </div>
      </main>

      {/* RUN HISTORY SIDEBAR */}
      <div
        className={`fixed inset-y-0 right-0 w-[450px] bg-[#0a0a0a] border-l border-zinc-800 transform transition-transform duration-500 z-[100] flex flex-col shadow-2xl ${isHistoryOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-zinc-100 font-bold tracking-widest text-sm flex items-center gap-2">
            <span className="material-icons text-blue-500">history</span>
            RUN HISTORY & AUDIT
          </h2>
          <button onClick={() => setIsHistoryOpen(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <span className="material-icons">close</span>
          </button>
        </div>

        {selectedRun && (
          <div className="bg-blue-900/10 border-b border-blue-900/30 p-4">
            <div className="text-[0.65rem] text-blue-400 font-bold tracking-widest flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              VIEWING SAVED RUN
            </div>
            <div className="text-zinc-200 text-sm font-bold mb-1">{selectedRun.label}</div>
            <div className="text-zinc-500 text-[0.65rem] font-mono">{selectedRun.resultHash}</div>
            <button
              onClick={clearSelected}
              className="mt-3 w-full bg-blue-500 text-white rounded py-1.5 text-[0.65rem] font-bold tracking-widest hover:bg-blue-600 transition-colors"
            >
              BACK TO CURRENT MEMORY STATE
            </button>
          </div>
        )}

        {compareDiff && (
          <div className="bg-amber-900/10 border-b border-amber-900/30 p-4 relative">
            <button onClick={() => setCompareDiff(null)} className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 transition-colors">
              <span className="material-icons text-sm">close</span>
            </button>
            <div className="text-[0.65rem] text-amber-500 font-bold tracking-widest flex items-center gap-2 mb-2">
              <span className="material-icons text-[0.8rem]">compare_arrows</span>
              COMPARISON RESULTS (CURRENT VS SAVED)
            </div>
            <p className="text-zinc-300 text-[0.75rem] font-mono leading-relaxed bg-[#050505] p-3 rounded border border-zinc-800 mt-2">
              {compareDiff.summary}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {runs.length === 0 ? (
            <div className="text-zinc-600 text-[0.65rem] text-center mt-10">NO RUNS SAVED. EXECUTE SIMULATION TO AUTO-SAVE.</div>
          ) : (
            runs.map(run => (
              <div key={run.id} className={`bg-[#050505] border p-3 rounded group ${selectedRun?.id === run.id ? 'border-blue-500/50' : 'border-zinc-800 hover:border-zinc-600 transition-colors'}`}>
                <div className="flex justify-between items-start mb-2">
                  <input
                    type="text"
                    value={run.label}
                    onChange={(e) => updateLabel(run.id, e.target.value)}
                    className="bg-transparent text-zinc-200 font-bold text-[0.7rem] uppercase tracking-wide border-b border-transparent hover:border-zinc-700 outline-none w-2/3"
                  />
                  <span className="text-[0.55rem] text-zinc-600">{new Date(run.createdAtISO).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-[0.6rem] text-zinc-500 font-mono mb-4">
                  <span>PACK: {run.scenarioPackId.substring(0, 8)}</span>
                  <span>HASH: {run.resultHash.substring(0, 8)}</span>
                </div>

                <div className="flex gap-2 justify-end opacity-20 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => selectRun(run.id)}
                    className="flex items-center gap-1 text-[0.6rem] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors"
                    title="Load run into Dashboard"
                  >
                    <span className="material-icons text-[0.7rem]">visibility</span> OPEN
                  </button>
                  <button
                    onClick={() => {
                      const diff = compareWithCurrent(buildCurrentEvidencePack(), run.id);
                      setCompareDiff(diff);
                    }}
                    className="flex items-center gap-1 text-[0.6rem] bg-amber-900/20 hover:bg-amber-900/40 text-amber-500 px-2 py-1 rounded border border-amber-900/50 transition-colors"
                    title="Compare Saved Run vs Current In-Memory State"
                  >
                    <span className="material-icons text-[0.7rem]">analytics</span> COMPARE
                  </button>
                  <button
                    onClick={() => {
                      const fullRun = getFullRun(run.id);
                      const packToDl = fullRun?.evidencePack;
                      if (packToDl) {
                        const payloadString = stableStringify(packToDl);
                        const blob = new Blob([payloadString], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `scil_evidence_${run.scenarioPackId.substring(0, 8)}_${run.resultHash.substring(0, 8)}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }
                    }}
                    className="flex items-center gap-1 text-[0.6rem] bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-500 px-2 py-1 rounded border border-emerald-900/50 transition-colors"
                    title="Download Saved Evidence JSON"
                  >
                    <span className="material-icons text-[0.7rem]">download</span> EXPORT
                  </button>
                  <button
                    onClick={() => deleteRun(run.id)}
                    className="flex items-center gap-1 text-[0.6rem] bg-rose-900/20 hover:bg-rose-900/40 text-rose-500 px-2 py-1 rounded border border-rose-900/50 transition-colors"
                    title="Delete saved run"
                  >
                    <span className="material-icons text-[0.7rem]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PRESENTER FLOATING CONTROLS */}
      {presenterMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0a0a0a] border border-emerald-900/50 p-2 rounded-full flex items-center gap-6 z-50 shadow-2xl shadow-emerald-900/20">
          <button
            disabled={presenterStep === 1}
            onClick={() => {
              const prev = presenterStep - 1;
              setPresenterStep(prev);
              if (prev === 1) section1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              if (prev === 2) section2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              if (prev === 3) section3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              if (prev === 4) section4Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              if (prev === 5) section5Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="w-8 h-8 rounded-full hover:bg-zinc-800 disabled:opacity-30 text-emerald-500 flex items-center justify-center transition-colors"
          >
            <span className="material-icons text-sm">west</span>
          </button>

          <div className="text-[0.65rem] font-bold tracking-widest text-emerald-400">
            STEP {presenterStep}/5: {
              presenterStep === 1 ? "EXECUTIVE RISK OVERVIEW" :
                presenterStep === 2 ? "MODEL TRANSPARENCY" :
                  presenterStep === 3 ? "LOSS DISTRIBUTION" :
                    presenterStep === 4 ? "DEFAULT / FRAGILITY MAP" :
                      "RECOMMENDATIONS"
            }
          </div>

          <button
            disabled={presenterStep === 5}
            onClick={() => {
              const next = presenterStep + 1;
              setPresenterStep(next);
              if (next === 1) section1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              if (next === 2) section2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              if (next === 3) section3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              if (next === 4) section4Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              if (next === 5) section5Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="w-8 h-8 rounded-full hover:bg-zinc-800 disabled:opacity-30 text-emerald-500 flex items-center justify-center transition-colors"
          >
            <span className="material-icons text-sm">east</span>
          </button>
        </div>
      )}

      {/* Global CSS for the custom scrollbar in ledger */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
      `}</style>
    </div>
  );
}
