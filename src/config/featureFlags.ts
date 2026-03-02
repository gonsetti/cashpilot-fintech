// Protected against undefined process in Vite environments
export const FEATURE_FLAGS = {
    ADVANCED_ANALYTICS:
        (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ADVANCED_ANALYTICS === "true") ||
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADVANCED_ANALYTICS === "true") ||
        false,
};
