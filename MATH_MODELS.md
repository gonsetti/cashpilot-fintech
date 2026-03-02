# SCIL Mathematical Models & Indices

This document serves as the technical definition of the formulas executing within the Sovereign Capital Intelligence Layer.

## 1. Local Entity Risk 
*(SystemicRisk.ts)*

The base vulnerability of any detached Node (Entity).
```math
Burn Pressure (BP) = MAX(0, MonthlyBurn ÷ Liquidity)
Leverage Ratio (LR) = Debt ÷ MAX(Equity, 1)
Volatility Shift (VS) = 1 + Historical Volatility Coefficient

Raw Risk = (BP + LR) × VS
Entity Risk (Normalized 0-100) = BOUND((Raw Risk ÷ 5.0) × 100)
```

## 2. Structural Centrality Score
*(CapitalGraph.ts)*

Measures how much of the network's liquidity depends directly on a specific Node.
```math
Centrality(Node A) = Σ [Exposure Edge Value × Edge Sensitivity] / Network Liquidity Buffer
```

## 3. Systemic Fragility Index (SFI)
*(FragilityIndex.ts)*

The global index defining how structurally vulnerable the macroscopic network is to collapse.
```math
SFI = Σ [(Entity Risk(Node) × Centrality(Node) × Outbound Exposure(Node))] ÷ Network Liquidity Buffer
```
*Scaled internally by a proprietary constant (x1000) for readability.*

## 4. Monte Carlo Survival Probability 
*(MonteCarloEngine.ts)*

The stochastic simulator runs $N$ iterations (default 10,000). For each iteration $i$, it simulates Revenue and Cost multipliers drawn from constrained uniform random distributions.

```math
Ending Liquidity(i) = Σ [Entity.Liquidity + (SimulatedNetCashFlow × HorizonMonths)]
```
If `Ending Liquidity(i) > 0`, the test is marked "Survived".
`Survival Probability = (Survived Iterations / 10,000) × 100%`

## 5. Systemic Value at Risk (VaR 95%)
The Engine records array `[EndingLiquidity_1 ... EndingLiquidity_10000]`. Given a 95th Percentile confidence:
```math
VaR = Base Network Liquidity - EndingLiquidity(500th worst case)
```

## 6. Optimal Capital Allocation Solver
*(AllocationSolver.ts)*

Uses a greedy linear approach to test capital injections ($3 \times MonthlyBurn$) from Provider Nodes ($Liquidity > 6 \times Burn$) to Critical Nodes ($Liquidity < 3 \times Burn$).
```math
Objective = MIN( SystemicFragilityIndex( State_n ) )
Subject to = Provider.Liquidity > 3 × Provider.Burn
```
If simulated `SFI(State_n+1) < SFI(State_n)`, the state mutation is proposed to the Governance Ledger for execution.
