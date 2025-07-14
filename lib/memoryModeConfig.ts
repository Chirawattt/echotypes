/**
 * Memory Challenge Mode Configuration
 * Dynamic viewing time based on DDA difficulty level
 */

export const MEMORY_MODE_CONFIG = {
    // Typing timer duration (seconds) - remains constant
    TYPING_TIMER_DURATION: 5.0,
    
    // Base viewing times (seconds) for each DDA level
    VIEWING_TIMES: {
        A1: 2.00, // Level 1
        A2: 1.90, // Level 2  
        B1: 1.75, // Level 3
        B2: 1.55, // Level 4
        C1: 1.35, // Level 5
        C2: 1.15, // Level 6
    } as const
};

/**
 * Calculate dynamic viewing time based on DDA difficulty level
 * @param level DDA difficulty level (1-6)
 * @returns Viewing time in seconds
 */
export const calculateViewTime = (level: number): number => {
    switch (level) {
        case 1: // A1
            return MEMORY_MODE_CONFIG.VIEWING_TIMES.A1;
        case 2: // A2
            return MEMORY_MODE_CONFIG.VIEWING_TIMES.A2;
        case 3: // B1
            return MEMORY_MODE_CONFIG.VIEWING_TIMES.B1;
        case 4: // B2
            return MEMORY_MODE_CONFIG.VIEWING_TIMES.B2;
        case 5: // C1
            return MEMORY_MODE_CONFIG.VIEWING_TIMES.C1;
        case 6: // C2
            return MEMORY_MODE_CONFIG.VIEWING_TIMES.C2;
        default: // Emergency fallback or default
            return MEMORY_MODE_CONFIG.VIEWING_TIMES.A1;
    }
};

/**
 * Get viewing time in milliseconds for setTimeout
 * @param level DDA difficulty level (1-6)
 * @returns Viewing time in milliseconds
 */
export const getViewTimeMs = (level: number): number => {
    return calculateViewTime(level) * 1000;
};
