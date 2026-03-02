import { SimulationRequestPayload } from "../api/simulation";

export type DemoScenarioSpec = {
    name: string;
    description: string;
    payload: SimulationRequestPayload;
};

export const INSTITUTIONAL_DEMO_SEED = 1337;

// Shape must match executeSimulation exactly (which runs MonteCarlo under the hood)
export const INSTITUTIONAL_SCENARIOS: DemoScenarioSpec[] = [
    {
        name: "Baseline (Mild Stress)",
        description: "Standard operating conditions with minor friction.",
        payload: {
            scenarioName: "Baseline (Mild Stress)",
            iterations: 10000,
            revenueShockRange: [0.95, 1.05],
            costShockRange: [0.95, 1.05],
            interestRateHikeBase: 0.0,
            blackSwanProbability: 0.001,
            horizonMonths: 12
        }
    },
    {
        name: "Liquidity Crunch",
        description: "Short-term debt markets freeze, causing capital retention issues.",
        payload: {
            scenarioName: "Liquidity Crunch",
            iterations: 10000,
            revenueShockRange: [0.80, 0.95],
            costShockRange: [1.0, 1.1],
            interestRateHikeBase: 0.03, // +300 bps
            blackSwanProbability: 0.01,
            horizonMonths: 12
        }
    },
    {
        name: "Rate Shock",
        description: "Aggressive central bank hikes to curb inflation.",
        payload: {
            scenarioName: "Rate Shock",
            iterations: 10000,
            revenueShockRange: [0.75, 0.90],
            costShockRange: [1.1, 1.25],
            interestRateHikeBase: 0.06, // +600 bps
            blackSwanProbability: 0.02,
            horizonMonths: 12
        }
    },
    {
        name: "Contagion Event",
        description: "A major holding defaults, cascading counterparty risk through the structure.",
        payload: {
            scenarioName: "Contagion Event",
            iterations: 10000,
            revenueShockRange: [0.60, 0.85],
            costShockRange: [1.2, 1.4],
            interestRateHikeBase: 0.04,
            blackSwanProbability: 0.05,
            horizonMonths: 12
        }
    },
    {
        name: "Extreme Systemic Stress",
        description: "Perfect storm: Hyper-inflation, defaults, and revenue collapse.",
        payload: {
            scenarioName: "Extreme Systemic Stress",
            iterations: 10000,
            revenueShockRange: [0.40, 0.70], // Massive drop
            costShockRange: [1.3, 1.6],    // Massive spike
            interestRateHikeBase: 0.08,    // +800 bps
            blackSwanProbability: 0.10,    // 10% structural collapse prob
            horizonMonths: 12
        }
    }
];
