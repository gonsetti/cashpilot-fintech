export function studentTShock(df: number, rng: () => number = Math.random): number {
    const u = rng() || 1e-8;
    const v = rng();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    const chi = Math.sqrt(df / ((rng() || 1e-8) * df));
    return z / chi;
}
