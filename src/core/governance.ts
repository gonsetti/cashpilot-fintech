/**
 * SCIL WORM Governance Ledger
 * Chained cryptographic verification structure.
 */

export interface GovernanceLog {
    index: number;
    timestamp: string;
    eventType: 'SIMULATION_RUN' | 'ALLOCATION_PROPOSED' | 'RISK_ALERT' | 'GRAPH_MUTATION';
    payload: any;
    previousHash: string;
    hash: string;
}

export class GovernanceAudit {
    private static ledger: GovernanceLog[] = [];

    public static async init() {
        if (this.ledger.length === 0) {
            const genesisHash = await this.hashString("GENESIS_BLOCK");
            this.ledger.push({
                index: 0,
                timestamp: new Date().toISOString(),
                eventType: 'GRAPH_MUTATION',
                payload: { genesis: true },
                previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
                hash: genesisHash
            });
        }
    }

    private static async hashString(input: string): Promise<string> {
        const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    public static async logEvent(
        eventType: GovernanceLog['eventType'],
        payload: any
    ): Promise<GovernanceLog> {
        if (this.ledger.length === 0) await this.init();

        const previousBlock = this.ledger[this.ledger.length - 1];
        const timestamp = new Date().toISOString();
        const payloadString = JSON.stringify(payload);

        // hash_n = SHA256(hash_(n-1) + payload + timestamp)
        const hashMaterial = previousBlock.hash + payloadString + timestamp;
        const newHash = await this.hashString(hashMaterial);

        const newBlock: GovernanceLog = {
            index: this.ledger.length,
            timestamp,
            eventType,
            payload,
            previousHash: previousBlock.hash,
            hash: newHash
        };

        this.ledger.push(newBlock);

        return newBlock;
    }

    public static async verifyLedgerIntegrity(): Promise<boolean> {
        if (this.ledger.length === 0) return true;

        for (let i = 1; i < this.ledger.length; i++) {
            const current = this.ledger[i];
            const prev = this.ledger[i - 1];

            if (current.previousHash !== prev.hash) return false;

            const expectedMaterial = current.previousHash + JSON.stringify(current.payload) + current.timestamp;
            const expectedHash = await this.hashString(expectedMaterial);

            if (current.hash !== expectedHash) return false;
        }

        return true;
    }

    public static getLedger(): GovernanceLog[] {
        return [...this.ledger];
    }
}
