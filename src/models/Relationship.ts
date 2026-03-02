/**
 * SCIL - Sovereign Capital Intelligence Layer
 * Domain Model: Relationship
 * Represents the directed connection or exposure between two entities in the Capital Graph.
 */

export type RelationshipType = 'transfer' | 'dependency' | 'guarantee' | 'exposure';

export interface Relationship {
    /** Identifier of the originating Entity node */
    fromEntity: string;

    /** Identifier of the receiving/target Entity node */
    toEntity: string;

    /** Nature of the structural connection */
    type: RelationshipType;

    /** Monetary volume, exposure limit, or transaction value (USD) */
    value: number;

    /** 
     * Impact sensitivity multiplier (0.0 to 1.0+). 
     * How much shock propagates from target to origin (or vice versa). 
     */
    sensitivity: number;
}
