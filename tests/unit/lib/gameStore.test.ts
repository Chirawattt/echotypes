import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '@/lib/stores/gameStore';

// Mock external dependencies
jest.mock('@/lib/ddaConfig', () => ({
  ddaConfig: {
    INITIAL_DIFFICULTY_LEVEL: 1,
    PERFORMANCE_ON_CORRECT: 5,
    PERFORMANCE_ON_INCORRECT: -10,
    LEVEL_UP_THRESHOLD: 25,
    LEVEL_DOWN_THRESHOLD: -25,
    MAX_DIFFICULTY_LEVEL: 6,
    MIN_DIFFICULTY_LEVEL: 1,
  }
}));

jest.mock('@/lib/ddaWords', () => ({
  clearC2WordHistory: jest.fn()
}));

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useGameStore.getState().resetGame();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useGameStore());
      const state = result.current;

      expect(state.status).toBe('loading');
      expect(state.currentWordIndex).toBe(0);
      expect(state.score).toBe(0);
      expect(state.lives).toBe(3);
      expect(state.streakCount).toBe(0);
      expect(state.totalChallengeScore).toBe(0);
      expect(state.currentDifficultyLevel).toBe(1);
      expect(state.performanceScore).toBe(0);
    });
  });

  describe('Basic Actions', () => {
    it('should update status correctly', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setStatus('playing');
      });

      expect(result.current.status).toBe('playing');
    });

    it('should update score with function', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setScore(100);
      });
      expect(result.current.score).toBe(100);

      act(() => {
        result.current.setScore(prev => prev + 50);
      });
      expect(result.current.score).toBe(150);
    });

    it('should update lives correctly', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setLives(prev => prev - 1);
      });

      expect(result.current.lives).toBe(2);
    });
  });

  describe('Streak System', () => {
    it('should increment streak correctly', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.incrementStreak();
      });

      expect(result.current.streakCount).toBe(1);
      expect(result.current.bestStreak).toBe(1);

      act(() => {
        result.current.incrementStreak();
        result.current.incrementStreak();
      });

      expect(result.current.streakCount).toBe(3);
      expect(result.current.bestStreak).toBe(3);
    });

    it('should reset streak but preserve best streak', () => {
      const { result } = renderHook(() => useGameStore());

      // Build up streak
      act(() => {
        result.current.incrementStreak();
        result.current.incrementStreak();
        result.current.incrementStreak();
      });

      expect(result.current.streakCount).toBe(3);
      expect(result.current.bestStreak).toBe(3);

      // Reset streak
      act(() => {
        result.current.resetStreak();
      });

      expect(result.current.streakCount).toBe(0);
      expect(result.current.bestStreak).toBe(3); // Preserved
    });
  });

  describe('Challenge Mode Scoring', () => {
    it('should add challenge score correctly', () => {
      const { result } = renderHook(() => useGameStore());

      const mockCalculation = {
        baseScore: 100,
        firstListenBonus: 50,
        timeBonus: 30,
        timeBonusDetails: {
          maxTime: 5,
          timeUsed: 3,
          timeMultiplier: 15
        },
        difficultyMultiplier: 1.5,
        streakBonus: 25,
        finalScore: 295
      };

      act(() => {
        result.current.addChallengeScore(mockCalculation);
      });

      expect(result.current.totalChallengeScore).toBe(295);
      expect(result.current.lastScoreCalculation).toEqual(mockCalculation);
      expect(result.current.lastScoreChange).toBe(295);
    });

    it('should reset challenge score', () => {
      const { result } = renderHook(() => useGameStore());

      // Add some score first
      const mockCalculation = {
        baseScore: 100,
        firstListenBonus: 0,
        timeBonus: 0,
        timeBonusDetails: { maxTime: 5, timeUsed: 5, timeMultiplier: 15 },
        difficultyMultiplier: 1.0,
        streakBonus: 0,
        finalScore: 100
      };

      act(() => {
        result.current.addChallengeScore(mockCalculation);
      });

      expect(result.current.totalChallengeScore).toBe(100);

      // Reset
      act(() => {
        result.current.resetChallengeScore();
      });

      expect(result.current.totalChallengeScore).toBe(0);
      expect(result.current.lastScoreCalculation).toBeNull();
      expect(result.current.lastScoreChange).toBe(0);
    });
  });

  describe('DDA System', () => {
    it('should update performance and level up', () => {
      const { result } = renderHook(() => useGameStore());

      // Build up performance to trigger level up
      let levelChanged = false;
      let newLevel = 1;

      act(() => {
        // Need 5 correct answers to reach threshold (5 * 5 = 25)
        for (let i = 0; i < 5; i++) {
          const result_dda = result.current.updatePerformance(true);
          if (i === 4) { // Last iteration should trigger level up
            levelChanged = result_dda.levelChanged;
            newLevel = result_dda.newDifficultyLevel;
          }
        }
      });

      expect(levelChanged).toBe(true);
      expect(newLevel).toBe(2);
      expect(result.current.currentDifficultyLevel).toBe(2);
      expect(result.current.performanceScore).toBe(0); // Reset after level up
    });

    it('should update performance and level down', () => {
      const { result } = renderHook(() => useGameStore());

      // Start at level 2
      act(() => {
        result.current.setCurrentDifficultyLevel(2);
        result.current.setPerformanceScore(0);
      });

      // Build up negative performance to trigger level down
      let levelChanged = false;
      let newLevel = 2;

      act(() => {
        // Need 3 incorrect answers to reach threshold (3 * -10 = -30, below -25)
        for (let i = 0; i < 3; i++) {
          const result_dda = result.current.updatePerformance(false);
          if (i === 2) { // Last iteration should trigger level down
            levelChanged = result_dda.levelChanged;
            newLevel = result_dda.newDifficultyLevel;
          }
        }
      });

      expect(levelChanged).toBe(true);
      expect(newLevel).toBe(1);
      expect(result.current.currentDifficultyLevel).toBe(1);
      expect(result.current.performanceScore).toBe(0); // Reset after level down
    });

    it('should not level up beyond maximum level', () => {
      const { result } = renderHook(() => useGameStore());

      // Set to max level
      act(() => {
        result.current.setCurrentDifficultyLevel(6);
        result.current.setPerformanceScore(20);
      });

      act(() => {
        const result_dda = result.current.updatePerformance(true);
        expect(result_dda.levelChanged).toBe(false);
        expect(result_dda.newDifficultyLevel).toBe(6);
      });

      expect(result.current.currentDifficultyLevel).toBe(6);
      expect(result.current.performanceScore).toBe(25); // Capped at threshold
    });
  });

  describe('Mode Statistics', () => {
    it('should update mode statistics correctly', () => {
      const { result } = renderHook(() => useGameStore());

      const newStats = {
        highScore: 100,
        bestStreak: 10,
        totalGamesPlayed: 5,
        bestWPM: 45
      };

      act(() => {
        result.current.updateModeStats('typing', newStats);
      });

      const typingStats = result.current.getModeStats('typing');
      expect(typingStats.highScore).toBe(100);
      expect(typingStats.bestStreak).toBe(10);
      expect(typingStats.totalGamesPlayed).toBe(5);
      expect(typingStats.bestWPM).toBe(45);
    });
  });

  describe('Complex Actions', () => {
    it('should increment word index correctly', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.incrementWordIndex();
      });

      expect(result.current.currentWordIndex).toBe(1);
    });

    it('should decrement time left and return new value', () => {
      const { result } = renderHook(() => useGameStore());

      // Set initial time
      act(() => {
        result.current.setTimeLeft(60);
      });

      let newTimeLeft;
      act(() => {
        newTimeLeft = result.current.decrementTimeLeft();
      });

      expect(newTimeLeft).toBe(59);
      expect(result.current.timeLeft).toBe(59);
    });

    it('should add incorrect word correctly', () => {
      const { result } = renderHook(() => useGameStore());

      const incorrectWord = { correct: 'hello', incorrect: 'helo' };

      act(() => {
        result.current.addIncorrectWord(incorrectWord);
      });

      expect(result.current.incorrectWords).toHaveLength(1);
      expect(result.current.incorrectWords[0]).toEqual(incorrectWord);
    });
  });

  describe('Game Initialization and Reset', () => {
    it('should initialize game with words correctly', () => {
      const { result } = renderHook(() => useGameStore());

      const mockWords = [
        { word: 'hello', meaning: 'greeting', level: 'a1' },
        { word: 'world', meaning: 'earth', level: 'a1' }
      ];

      act(() => {
        result.current.initializeGame(mockWords);
      });

      expect(result.current.words).toEqual(mockWords);
      expect(result.current.status).toBe('countdown');
      expect(result.current.currentWordIndex).toBe(0);
      expect(result.current.score).toBe(0);
      expect(result.current.streakCount).toBe(0);
    });

    it('should reset game to initial state', () => {
      const { result } = renderHook(() => useGameStore());

      // Modify some state
      act(() => {
        result.current.setStatus('playing');
        result.current.setScore(100);
        result.current.setCurrentWordIndex(5);
        result.current.incrementStreak();
      });

      // Reset
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.status).toBe('loading');
      expect(result.current.score).toBe(0);
      expect(result.current.currentWordIndex).toBe(0);
      expect(result.current.streakCount).toBe(0);
      expect(result.current.lives).toBe(3);
      expect(result.current.currentDifficultyLevel).toBe(1);
    });

    it('should perform global cleanup correctly', () => {
      const { result } = renderHook(() => useGameStore());

      // Modify state
      act(() => {
        result.current.setStatus('playing');
        result.current.setScore(100);
        result.current.setHighScore(200);
      });

      // Global cleanup
      act(() => {
        result.current.globalCleanup();
      });

      expect(result.current.status).toBe('loading');
      expect(result.current.score).toBe(0);
      expect(result.current.highScore).toBe(0);
      expect(result.current.currentDifficultyLevel).toBe(1);
    });
  });
});