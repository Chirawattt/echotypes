// Scoring system for Challenge Mode
// สูตรพื้นฐาน: คะแนนที่ได้ = (คะแนนพื้นฐาน * โบนัสความยาก) + โบนัส Streak
// สูตรกับโบนัส: คะแนนที่ได้ = ((คะแนนพื้นฐาน + โบนัสฟังครั้งเดียว + โบนัสเวลา) * โบนัสความยาก) + โบนัส Streak

export interface ScoreCalculation {
    baseScore: number;          // คะแนนพื้นฐาน (100 คะแนนต่อข้อ)
    firstListenBonus: number;   // โบนัสฟังครั้งเดียว (Echo Mode เท่านั้น)
    timeBonus: number;          // โบนัสเวลา
    timeBonusDetails: {
        maxTime: number;        // เวลาสูงสุดต่อข้อ
        timeUsed: number;       // เวลาที่ใช้ตอบ
        timeMultiplier: number; // ตัวคูณเวลา
    };
    difficultyMultiplier: number; // โบนัสความยาก
    streakBonus: number;        // โบนัส Streak
    finalScore: number;         // คะแนนสุดท้าย
    usedSpeakAgain?: boolean;   // ใช้ speak again หรือไม่ (Echo Mode เท่านั้น)
}

export interface ScoringConfig {
    baseScore: number;
    firstListenBonus: number;   // โบนัสฟังครั้งเดียว (Echo Mode)
    maxTimePerQuestion: number;
    timeMultiplier: number;
    difficultyMultipliers: Record<string, number>;
    maxStreakMultiplier: number;
}

// Default scoring configuration
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
    baseScore: 100,
    firstListenBonus: 50,       // โบนัสฟังครั้งเดียว 50 คะแนน
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
 * สูตรพื้นฐาน: คะแนนที่ได้ = (คะแนนพื้นฐาน * โบนัสความยาก) + โบนัส Streak
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
            firstListenBonus: 0,
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
    const firstListenBonus = 0; // ไม่มีโบนัสฟังครั้งเดียวในโหมดปกติ
    const timeBonus = calculateTimeBonus(timeUsed, config.maxTimePerQuestion, config.timeMultiplier);
    const difficultyMultiplier = getDifficultyMultiplier(difficulty);
    const streakBonus = calculateStreakBonus(streak);
    
    // คำนวณตามสูตร: (คะแนนพื้นฐาน + โบนัสเวลา) * โบนัสความยาก + โบนัส Streak
    const finalScore = Math.round((baseScore + timeBonus) * difficultyMultiplier + streakBonus);

    return {
        baseScore,
        firstListenBonus,
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
 * สูตร 1 (ฟังครั้งเดียว): คะแนนที่ได้ = ((คะแนนพื้นฐาน + โบนัสฟังครั้งเดียว + โบนัสเวลา) * โบนัสความยาก) + โบนัส Streak
 * สูตร 2 (ฟังหลายครั้ง): คะแนนที่ได้ = (คะแนนพื้นฐาน * โบนัสความยาก) + โบนัส Streak
 */
export function calculateEchoModeScore(
    timeLeft: number, // เวลาที่เหลือ (0-5.0)
    difficulty: string,
    streak: number,
    isCorrect: boolean = true,
    usedSpeakAgain: boolean = false // เพิ่มพารามิเตอร์นี้
): ScoreCalculation {
    // ถ้าตอบผิดจะไม่ได้คะแนน
    if (!isCorrect) {
        return {
            baseScore: 0,
            firstListenBonus: 0,
            timeBonus: 0,
            timeBonusDetails: {
                maxTime: DEFAULT_SCORING_CONFIG.maxTimePerQuestion,
                timeUsed: DEFAULT_SCORING_CONFIG.maxTimePerQuestion - timeLeft,
                timeMultiplier: DEFAULT_SCORING_CONFIG.timeMultiplier
            },
            difficultyMultiplier: getDifficultyMultiplier(difficulty),
            streakBonus: 0,
            finalScore: 0,
            usedSpeakAgain
        };
    }

    const baseScore = DEFAULT_SCORING_CONFIG.baseScore;
    const difficultyMultiplier = getDifficultyMultiplier(difficulty);
    const streakBonus = calculateStreakBonus(streak);
    const timeUsed = DEFAULT_SCORING_CONFIG.maxTimePerQuestion - timeLeft;

    let firstListenBonus = 0;
    let timeBonus = 0;
    let finalScore = 0;

    if (!usedSpeakAgain) {
        // สูตร 1: ฟังครั้งเดียว - ได้โบนัสเต็ม
        firstListenBonus = DEFAULT_SCORING_CONFIG.firstListenBonus;
        timeBonus = calculateTimeBonus(timeUsed, DEFAULT_SCORING_CONFIG.maxTimePerQuestion, DEFAULT_SCORING_CONFIG.timeMultiplier);
        finalScore = Math.round((baseScore + firstListenBonus + timeBonus) * difficultyMultiplier + streakBonus);
    } else {
        // สูตร 2: ฟังหลายครั้ง - ไม่ได้โบนัสเวลาและโบนัสฟังครั้งเดียว
        firstListenBonus = 0;
        timeBonus = 0;
        finalScore = Math.round(baseScore * difficultyMultiplier + streakBonus);
    }

    return {
        baseScore,
        firstListenBonus,
        timeBonus,
        timeBonusDetails: {
            maxTime: DEFAULT_SCORING_CONFIG.maxTimePerQuestion,
            timeUsed,
            timeMultiplier: DEFAULT_SCORING_CONFIG.timeMultiplier
        },
        difficultyMultiplier,
        streakBonus,
        finalScore,
        usedSpeakAgain
    };
}

/**
 * แสดงรายละเอียดการคำนวณคะแนน
 */
export function formatScoreBreakdown(calculation: ScoreCalculation): string {
    const { baseScore, firstListenBonus, timeBonus, timeBonusDetails, difficultyMultiplier, streakBonus, finalScore, usedSpeakAgain } = calculation;
    
    if (usedSpeakAgain !== undefined) {
        // Echo Mode
        if (usedSpeakAgain) {
            return `
Score Breakdown (Echo Mode - Multiple Listens):
• Base Score: ${baseScore}
• First Listen Bonus: 0 (used speak again)
• Time Bonus: 0 (used speak again)
• Difficulty: ×${difficultyMultiplier}
• Streak Bonus: +${streakBonus}
• Final Score: ${finalScore}

Formula: ${baseScore} × ${difficultyMultiplier} + ${streakBonus} = ${finalScore}
            `.trim();
        } else {
            return `
Score Breakdown (Echo Mode - First Listen):
• Base Score: ${baseScore}
• First Listen Bonus: +${firstListenBonus}
• Time Bonus: ${timeBonus} (saved ${(timeBonusDetails.maxTime - timeBonusDetails.timeUsed).toFixed(1)}s × ${timeBonusDetails.timeMultiplier})
• Difficulty: ×${difficultyMultiplier}
• Streak Bonus: +${streakBonus}
• Final Score: ${finalScore}

Formula: (${baseScore} + ${firstListenBonus} + ${timeBonus}) × ${difficultyMultiplier} + ${streakBonus} = ${finalScore}
            `.trim();
        }
    } else {
        // Other modes
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
}
