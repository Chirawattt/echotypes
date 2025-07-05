// Scoring system for Challenge Mode
// คะแนนที่ได้ = (คะแนนพื้นฐาน + โบนัสเวลา) * โบนัสความยาก + โบนัส Streak

export interface ScoreCalculation {
    baseScore: number;          // คะแนนพื้นฐาน (100 คะแนนต่อข้อ)
    timeBonus: number;          // โบนัสเวลา
    timeBonusDetails: {
        maxTime: number;        // เวลาสูงสุดต่อข้อ
        timeUsed: number;       // เวลาที่ใช้ตอบ
        timeMultiplier: number; // ตัวคูณเวลา
    };
    difficultyMultiplier: number; // โบนัสความยาก
    streakBonus: number;        // โบนัส Streak
    finalScore: number;         // คะแนนสุดท้าย
}

export interface ScoringConfig {
    baseScore: number;
    maxTimePerQuestion: number;
    timeMultiplier: number;
    difficultyMultipliers: Record<string, number>;
    maxStreakMultiplier: number;
}

// Default scoring configuration
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
    baseScore: 100,
    maxTimePerQuestion: 5.0, // 5 วินาที
    timeMultiplier: 15,
    difficultyMultipliers: {
        'A1': 1.0,
        'A2': 1.25,
        'B1': 1.5,
        'B2': 1.75,
        'C1': 2.0,
        'C2': 2.25,
        'endless': 1.0
    },
    maxStreakMultiplier: 20
};

/**
 * คำนวณโบนัสเวลา
 * โบนัสเวลา = (เวลาสูงสุดต่อข้อ - เวลาที่ใช้ตอบ) * ตัวคูณเวลา
 */
export function calculateTimeBonus(
    timeUsed: number, 
    maxTime: number = DEFAULT_SCORING_CONFIG.maxTimePerQuestion,
    timeMultiplier: number = DEFAULT_SCORING_CONFIG.timeMultiplier
): number {
    const timeSaved = Math.max(0, maxTime - timeUsed);
    return Math.round(timeSaved * timeMultiplier);
}

/**
 * คำนวณโบนัสความยาก
 */
export function getDifficultyMultiplier(difficulty: string): number {
    return DEFAULT_SCORING_CONFIG.difficultyMultipliers[difficulty] || 1.0;
}

/**
 * คำนวณโบนัส Streak
 * สูงสุด 20 เท่า
 */
export function calculateStreakBonus(streak: number): number {
    const effectiveStreak = Math.min(streak, DEFAULT_SCORING_CONFIG.maxStreakMultiplier);
    return effectiveStreak * 5; // 5 คะแนนต่อ streak
}

/**
 * คำนวณคะแนนรวม
 * คะแนนที่ได้ = (คะแนนพื้นฐาน + โบนัสเวลา) * โบนัสความยาก + โบนัส Streak
 */
export function calculateTotalScore(
    timeUsed: number,
    difficulty: string,
    streak: number,
    isCorrect: boolean = true,
    config: ScoringConfig = DEFAULT_SCORING_CONFIG
): ScoreCalculation {
    // ถ้าตอบผิดจะไม่ได้คะแนน
    if (!isCorrect) {
        return {
            baseScore: 0,
            timeBonus: 0,
            timeBonusDetails: {
                maxTime: config.maxTimePerQuestion,
                timeUsed,
                timeMultiplier: config.timeMultiplier
            },
            difficultyMultiplier: getDifficultyMultiplier(difficulty),
            streakBonus: 0,
            finalScore: 0
        };
    }

    const baseScore = config.baseScore;
    const timeBonus = calculateTimeBonus(timeUsed, config.maxTimePerQuestion, config.timeMultiplier);
    const difficultyMultiplier = getDifficultyMultiplier(difficulty);
    const streakBonus = calculateStreakBonus(streak);
    
    // คำนวณตามสูตร: (คะแนนพื้นฐาน + โบนัสเวลา) * โบนัสความยาก + โบนัส Streak
    const finalScore = Math.round((baseScore + timeBonus) * difficultyMultiplier + streakBonus);

    return {
        baseScore,
        timeBonus,
        timeBonusDetails: {
            maxTime: config.maxTimePerQuestion,
            timeUsed,
            timeMultiplier: config.timeMultiplier
        },
        difficultyMultiplier,
        streakBonus,
        finalScore
    };
}

/**
 * คำนวณคะแนนสำหรับ Echo Mode Challenge
 */
export function calculateEchoModeScore(
    timeLeft: number, // เวลาที่เหลือ (0-5.0)
    difficulty: string,
    streak: number,
    isCorrect: boolean = true
): ScoreCalculation {
    // คำนวณเวลาที่ใช้จากเวลาที่เหลือ
    const timeUsed = DEFAULT_SCORING_CONFIG.maxTimePerQuestion - timeLeft;
    
    return calculateTotalScore(timeUsed, difficulty, streak, isCorrect);
}

/**
 * แสดงรายละเอียดการคำนวณคะแนน
 */
export function formatScoreBreakdown(calculation: ScoreCalculation): string {
    const { baseScore, timeBonus, timeBonusDetails, difficultyMultiplier, streakBonus, finalScore } = calculation;
    
    return `
Score Breakdown:
• Base Score: ${baseScore}
• Time Bonus: ${timeBonus} (saved ${(timeBonusDetails.maxTime - timeBonusDetails.timeUsed).toFixed(1)}s × ${timeBonusDetails.timeMultiplier})
• Difficulty: ×${difficultyMultiplier}
• Streak Bonus: +${streakBonus}
• Final Score: ${finalScore}

Formula: (${baseScore} + ${timeBonus}) × ${difficultyMultiplier} + ${streakBonus} = ${finalScore}
    `.trim();
}
