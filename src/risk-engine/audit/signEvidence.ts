/**
 * Generates an optional cryptographic signature for an evidence pack.
 * In a production institutional environment, this would be computed server-side
 * using a HSM or strict private key. For UI/Demo purposes, it uses subtle crypto.
 */
export async function signEvidence(payloadString: string, secret?: string): Promise<string | null> {
    if (!secret) return null;

    try {
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            const data = new TextEncoder().encode(secret + payloadString);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }
    } catch (e) {
        console.warn("WebCrypto not available for signing.");
    }

    return null;
}
