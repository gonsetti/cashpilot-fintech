export interface Bank {
    id: string;
    capital: number;
    initialCapital: number;
    exposures: Record<string, number>;
}
