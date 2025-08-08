import {
  calculateTimeBonus,
  getDifficultyMultiplier,
  calculateStreakBonus,
  calculateTotalScore,
  calculateEchoModeScore,
  calculateComboMultiplier,
  calculateTypingModeScore,
  formatScoreBreakdown
} from '@/lib/scoring';

describe('Scoring System', () => {
  describe('calculateTimeBonus', () => {
    it('should calculate correct time bonus for fast answer', () => {
      const timeUsed = 2.0; // 2 seconds
      const maxTime = 5.0; // 5 seconds max
      const timeMultiplier = 15;
      
      const bonus = calculateTimeBonus(timeUsed, maxTime, timeMultiplier);
      expect(bonus).toBe(45); // (5 - 2) * 15 = 45
    });

    it('should return 0 bonus for maximum time used', () => {
      const bonus = calculateTimeBonus(5.0, 5.0, 15);
      expect(bonus).toBe(0);
    });

    it('should return 0 bonus for overtime', () => {
      const bonus = calculateTimeBonus(7.0, 5.0, 15);
      expect(bonus).toBe(0);
    });
  });

  describe('getDifficultyMultiplier', () => {
    it('should return correct multipliers for each difficulty', () => {
      expect(getDifficultyMultiplier('A1')).toBe(1.0);
      expect(getDifficultyMultiplier('A2')).toBe(1.25);
      expect(getDifficultyMultiplier('B1')).toBe(1.5);
      expect(getDifficultyMultiplier('B2')).toBe(1.75);
      expect(getDifficultyMultiplier('C1')).toBe(2.0);
      expect(getDifficultyMultiplier('C2')).toBe(2.25);
    });

    it('should return 1.0 for unknown difficulty', () => {
      expect(getDifficultyMultiplier('UNKNOWN')).toBe(1.0);
    });
  });

  describe('calculateStreakBonus', () => {
    it('should calculate streak bonus correctly', () => {
      expect(calculateStreakBonus(0)).toBe(0);
      expect(calculateStreakBonus(1)).toBe(5);
      expect(calculateStreakBonus(5)).toBe(25);
      expect(calculateStreakBonus(10)).toBe(50);
    });

    it('should cap streak bonus at maximum', () => {
      expect(calculateStreakBonus(20)).toBe(100); // 20 * 5
      expect(calculateStreakBonus(25)).toBe(100); // capped at 20
    });
  });

  describe('calculateTotalScore', () => {
    it('should calculate correct score for perfect answer', () => {
      const result = calculateTotalScore(1.0, 'B1', 5, true);
      
      expect(result.baseScore).toBe(100);
      expect(result.timeBonus).toBe(60); // (5-1) * 15
      expect(result.difficultyMultiplier).toBe(1.5);
      expect(result.streakBonus).toBe(25); // 5 * 5
      expect(result.finalScore).toBe(265); // (100 + 60) * 1.5 + 25
    });

    it('should return 0 score for incorrect answer', () => {
      const result = calculateTotalScore(1.0, 'B1', 5, false);
      
      expect(result.baseScore).toBe(0);
      expect(result.timeBonus).toBe(0);
      expect(result.streakBonus).toBe(0);
      expect(result.finalScore).toBe(0);
    });
  });

  describe('calculateEchoModeScore', () => {
    it('should calculate correct score for first listen', () => {
      const timeLeft = 2.0; // 3 seconds used out of 5
      const result = calculateEchoModeScore(timeLeft, 'C1', 3, true, false);
      
      expect(result.baseScore).toBe(100);
      expect(result.firstListenBonus).toBe(50);
      expect(result.timeBonus).toBe(30); // (5-3) * 15
      expect(result.difficultyMultiplier).toBe(2.0);
      expect(result.streakBonus).toBe(15); // 3 * 5
      expect(result.finalScore).toBe(375); // (100 + 50 + 30) * 2.0 + 15
      expect(result.usedSpeakAgain).toBe(false);
    });

    it('should calculate correct score for multiple listens', () => {
      const timeLeft = 2.0;
      const result = calculateEchoModeScore(timeLeft, 'C1', 3, true, true);
      
      expect(result.baseScore).toBe(100);
      expect(result.firstListenBonus).toBe(0);
      expect(result.timeBonus).toBe(0);
      expect(result.difficultyMultiplier).toBe(2.0);
      expect(result.streakBonus).toBe(15);
      expect(result.finalScore).toBe(215); // 100 * 2.0 + 15
      expect(result.usedSpeakAgain).toBe(true);
    });
  });

  describe('calculateTypingModeScore', () => {
    it('should calculate correct score with combo multiplier', () => {
      const word = 'hello'; // 5 characters
      const combo = 10;
      const result = calculateTypingModeScore(word, combo, true);
      
      expect(result.baseScore).toBe(125); // 100 + (5 * 5)
      expect(result.comboMultiplier).toBe(2.0); // 1.0 + (10 * 0.1)
      expect(result.finalScore).toBe(250); // 125 * 2.0
      expect(result.wordLength).toBe(5);
      expect(result.comboCount).toBe(10);
    });

    it('should cap combo multiplier at maximum', () => {
      const combo = 50; // Very high combo
      const multiplier = calculateComboMultiplier(combo);
      expect(multiplier).toBe(5.0); // Capped at max
    });

    it('should return 0 score for incorrect answer', () => {
      const result = calculateTypingModeScore('hello', 10, false);
      expect(result.finalScore).toBe(0);
      expect(result.comboCount).toBe(0);
    });
  });

  describe('formatScoreBreakdown', () => {
    it('should format echo mode first listen breakdown', () => {
      const calculation = calculateEchoModeScore(2.0, 'B1', 5, true, false);
      const breakdown = formatScoreBreakdown(calculation);
      
      expect(breakdown).toContain('Echo Mode - First Listen');
      expect(breakdown).toContain('Base Score: 100');
      expect(breakdown).toContain('First Listen Bonus: +50');
      expect(breakdown).toContain('Difficulty: ×1.5');
    });

    it('should format echo mode multiple listens breakdown', () => {
      const calculation = calculateEchoModeScore(2.0, 'B1', 5, true, true);
      const breakdown = formatScoreBreakdown(calculation);
      
      expect(breakdown).toContain('Echo Mode - Multiple Listens');
      expect(breakdown).toContain('used speak again');
    });

    it('should format other modes breakdown', () => {
      const calculation = calculateTotalScore(2.0, 'B1', 5, true);
      const breakdown = formatScoreBreakdown(calculation);
      
      expect(breakdown).toContain('Score Breakdown:');
      expect(breakdown).not.toContain('Echo Mode');
    });
  });
});