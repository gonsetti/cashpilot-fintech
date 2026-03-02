# Sovereign Capital Intelligence Layer (SCIL)

SCIL is an institutional-grade infrastructure layer built to replace generic B2B financial dashboards. It is designed specifically for modeling multi-entity holdings as dynamic graphs, running advanced stochastic stress tests, and calculating cross-exposure vulnerabilities in real-time.

## System Architecture

SCIL abandons traditional startup "SaaS templates" in favor of pure analytical logic and dark, sober terminal interfaces. The system is divided into three core pillars:

### 1. The Capital Graph (`/src/core/capitalGraph.ts`)
A directed graph topology that models institutions as Nodes (`Entity.ts`) and capital flow/exposure as Edges (`Relationship.ts`). Mapped vulnerabilities cascade through the network based on dynamically computed Centrality and Exposure Weights.

### 2. The Simulation Engine (`/src/core/monteCarloEngine.ts`)
A client/edge-ready mathematical engine execution loop. Instead of projecting a simple linear runway line, SCIL runs Monte Carlo stress tests (10,000+ stochastic iterations) manipulating revenue, cost volatility, and macro interest rate hikes to return a true `Survival Probability`, `95th Percentile VaR`, and `Structural Fragility`.

### 3. The Governance Ledger (`/src/core/governance.ts`)
An immutable WORM (Write Once Read Many) log that cryptographically hashes all terminal actions:
- Extrapolated risk alerts.
- Simulation executions.
- Optimal allocation proposals.
Designed for eventual integration with on-chain ledgers or strictly audited cold storage databases.

## Integration & APIs
The `/src/api` module acts as a mocked RESTful layer mimicking a deeply decoupled microservices architecture:
- `GET /capital/state`: Returns the graph topology.
- `GET /risk/systemic`: Returns empirical fragility indices.
- `POST /simulation/run`: Triggers the Monte Carlo engine.
- `GET /allocation/optimal`: Fires the greedy mathematical allocator to optimize liquidity transfers.

## Escalation Path to Production
To extract SCIL from this interface into a fully autonomous institutional actor:
1. Lift `/src/api` and `/src/core` modules into headless backend Node/Go runtimes.
2. Hook `capital.ts` to live Core Banking APIs or Treasury APIs (e.g. Plaid, Stripe Treasury) to seed real-time `Entities`.
3. Integrate `allocationSolver.ts` with programmable ledgers (e.g. smart contracts) to autonomously execute optimal liquidity transfers to prevent subsidiary default (Default-Dead avoidance).
