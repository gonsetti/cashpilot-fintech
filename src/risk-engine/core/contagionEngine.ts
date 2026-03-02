import { Bank } from "../models/Bank";

export function runContagion(
    banks: Bank[],
    threshold: number
): void {

    let defaulted = true;

    while (defaulted) {
        defaulted = false;

        for (const bank of banks) {
            if (bank.capital > 0 && bank.capital < threshold) {

                for (const counterparty of banks) {
                    const exposure = counterparty.exposures[bank.id] || 0;
                    counterparty.capital -= exposure;
                }

                bank.capital = 0;
                defaulted = true;
            }
        }
    }
}
