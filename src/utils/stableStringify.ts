export function stableStringify(value: unknown): string {
    const seen = new WeakSet()

    const stringify = (val: any): any => {
        if (val && typeof val === "object") {
            if (seen.has(val)) return
            seen.add(val)

            if (Array.isArray(val)) {
                return val.map(stringify)
            }

            return Object.keys(val)
                .sort()
                .reduce((acc: Record<string, unknown>, key) => {
                    acc[key] = stringify(val[key])
                    return acc
                }, {})
        }
        return val
    }

    return JSON.stringify(stringify(value))
}

