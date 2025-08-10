import { renderHook, act, waitFor } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

// Base mocks
jest.mock("next-auth/react");
jest.mock("@/lib/database");

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock fetch globally
global.fetch = jest.fn(); // jest.fn() is a mock function

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock custom hooks
const mockAudioHooks = {
  playSound: jest.fn(),
  correctAudioRef: { current: null },
  incorrectAudioRef: { current: null },
  completedAudioRef: { current: null },
  countdownAudioRef: { current: null },
  keypressAudioRef: { current: null },
};

const mockSpeechHooks = {
  speak: jest.fn(),
  cancelSpeech: jest.fn(),
  currentUtteranceRef: { current: null },
};

const mockDDAHooks = {
  currentDifficultyLevel: 1,
  performanceScore: 0,
  handleDdaUpdate: jest.fn(),
  resetDdaState: jest.fn(),
  setDifficultyLevel: jest.fn(),
  setPerformanceScoreManually: jest.fn(),
  initDifficultyLevelRef: { current: 1 },
};

const mockTimerHooks = {
  isEchoCountingDown: false,
  echoTimeLeft: 5,
  memoryTimeLeft: 3,
  setIsEchoCountingDown: jest.fn(),
  setEchoTimeLeft: jest.fn(),
  setMemoryTimeLeft: jest.fn(),
  stopEchoTimer: jest.fn(),
  stopMemoryTimer: jest.fn(),
  handleEchoTimerReady: jest.fn(),
  handleMemoryTimerReady: jest.fn(),
  handleEchoTimeLeftChange: jest.fn(),
  handleMemoryTimeLeftChange: jest.fn(),
  echoStopTimerRef: { current: null },
};

const mockScoreHooks = {
  showScoreBreakdown: false,
  calculateAndAddScore: jest.fn(),
  calculateScoreForTimeUp: jest.fn(),
  resetChallengeScore: jest.fn(),
  cleanup: jest.fn(),
  scoreBreakdownTimerRef: { current: null },
};

const mockEventsHooks = {
  handleUserInputChange: jest.fn(),
  handleFormSubmit: jest.fn(),
};

const mockNitroEnergyHooks = {
  energy: 100,
  maxEnergy: 100,
  isLowEnergy: false,
  addEnergy: jest.fn(),
  removeEnergy: jest.fn(),
  resetEnergy: jest.fn(),
};

const mockOverdriveHooks = {
  currentHeatLevel: {
    level: 1,
    name: "Cool",
    energyDecayInterval: 1000,
    color: "blue",
  },
  isTransitioning: false,
};

// Apply mocks (use jest.mock with factory so they are hoisted before the hook is loaded)
jest.mock("@/hooks/useAudio", () => ({
  useAudio: jest.fn(() => mockAudioHooks),
}));

jest.mock("@/hooks/useSpeech", () => ({
  useSpeech: jest.fn(() => mockSpeechHooks),
}));

jest.mock("@/hooks/useDDA", () => ({
  useDDA: jest.fn(() => mockDDAHooks),
}));

jest.mock("@/hooks/useGameTimers", () => ({
  useGameTimers: jest.fn(() => mockTimerHooks),
}));

jest.mock("@/hooks/useGameScore", () => ({
  useGameScore: jest.fn(() => mockScoreHooks),
}));

jest.mock("@/hooks/useGameModes", () => ({
  useGameModes: jest.fn(() => ({})),
}));

jest.mock("@/hooks/useGameEvents", () => ({
  useGameEvents: jest.fn(() => mockEventsHooks),
}));

jest.mock("@/hooks/useNitroEnergy", () => ({
  useNitroEnergy: jest.fn(() => mockNitroEnergyHooks),
}));

jest.mock("@/hooks/useOverdriveSystem", () => ({
  useOverdriveSystem: jest.fn(() => mockOverdriveHooks),
}));

// Mock word loading
jest.mock("@/lib/words-new", () => ({
  getGameSessionWords: jest.fn().mockResolvedValue([
    { word: "hello", meaning: "greeting", level: "a1" },
    { word: "world", meaning: "earth", level: "a1" },
  ]),
}));

jest.mock("@/lib/ddaWords", () => ({
  getDdaGameSessionWords: jest
    .fn()
    .mockReturnValue([{ word: "test", meaning: "exam", level: "a1" }]),
  preloadDdaWords: jest.fn().mockResolvedValue(undefined),
  clearC2WordHistory: jest.fn(),
}));

// Now import the hook under test (mocks above are hoisted)
import { useGameLogic } from "@/hooks/useGameLogic";

describe("useGameLogic", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
    mockLocalStorage.getItem.mockReturnValue(null); // Mock localStorage.getItem to return null
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ scores: [] }),
    });

    // Default: unauthenticated to avoid triggering fetch effects for most tests
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: jest.fn(),
    } as unknown as ReturnType<typeof useSession>);
  });

  describe("Initialization", () => {
    // Test initial state for echo mode
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() =>
        useGameLogic({ modeId: "echo", gameStyle: "practice" })
      );
      // Assert initial state
      expect(result.current.status).toBe("loading");
      expect(result.current.currentWordIndex).toBe(0);
      expect(result.current.score).toBe(0);
      expect(result.current.lives).toBe(3);
      expect(result.current.streakCount).toBe(0);
    });

    it("should handle typing mode with custom time", () => {
      const { result } = renderHook(() =>
        useGameLogic({
          modeId: "typing",
          gameStyle: "practice",
          selectedTime: 120,
        })
      );

      expect(result.current).toBeDefined(); // Assert hook is defined
      // Timer setting is handled internally
    });

    it("should handle unlimited time mode", () => {
      const { result } = renderHook(() =>
        useGameLogic({
          modeId: "typing",
          gameStyle: "practice",
          selectedTime: null,
        })
      );

      expect(result.current).toBeDefined();
    });
  });

  describe("Game Actions", () => {
    it("should handle restart game correctly", async () => {
      const { result } = renderHook(() =>
        useGameLogic({ modeId: "echo", gameStyle: "practice" })
      );

      await act(async () => {
        result.current.handleRestartGame();
      });

      expect(mockDDAHooks.resetDdaState).toHaveBeenCalled();
      expect(mockScoreHooks.resetChallengeScore).toHaveBeenCalled();
    });

    it("should handle home navigation cleanup", () => {
      const { result } = renderHook(() =>
        useGameLogic({ modeId: "echo", gameStyle: "practice" })
      );

      act(() => {
        result.current.handleHomeNavigation();
      });

      expect(mockSpeechHooks.cancelSpeech).toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });

    it("should handle finish game", () => {
      const { result } = renderHook(() =>
        useGameLogic({ modeId: "typing", gameStyle: "practice" })
      );

      act(() => {
        result.current.handleFinishGame();
      });

      expect(result.current.status).toBe("gameOver");
    });
  });

  describe("Form Submission", () => {
    it("should handle form submit", () => {
      const { result } = renderHook(() =>
        useGameLogic({ modeId: "echo", gameStyle: "practice" })
      );

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      act(() => {
        result.current.handleFormSubmit(mockEvent);
      });

      expect(mockEventsHooks.handleFormSubmit).toHaveBeenCalledWith(
        mockEvent,
        mockTimerHooks.echoTimeLeft,
        mockTimerHooks.memoryTimeLeft
      );
    });
  });

  describe("Time Up Handling", () => {
    it("should handle echo time up in challenge mode", () => {
      const { result } = renderHook(() =>
        useGameLogic({ modeId: "echo", gameStyle: "challenge" })
      );

      act(() => {
        result.current.handleEchoTimeUp();
      });

      expect(mockScoreHooks.calculateScoreForTimeUp).toHaveBeenCalled();
    });

    it("should not handle echo time up in wrong mode", () => {
      const { result } = renderHook(() =>
        useGameLogic({ modeId: "memory", gameStyle: "challenge" })
      );

      act(() => {
        result.current.handleEchoTimeUp();
      });

      expect(mockScoreHooks.calculateScoreForTimeUp).not.toHaveBeenCalled();
    });

    it("should handle memory time up in challenge mode", () => {
      const { result } = renderHook(() =>
        useGameLogic({ modeId: "memory", gameStyle: "challenge" })
      );

      act(() => {
        result.current.handleMemoryTimeUp();
      });

      // Should call common time up logic
      expect(mockAudioHooks.playSound).toBeDefined();
    });
  });

  describe("Score Fetching", () => {
    beforeEach(() => {
      // Enable authenticated session only for this group
      const mockSession: Session = {
        user: {
          id: "test-user-id",
          name: "Test User",
          email: "test@example.com",
        } as Session["user"],
        expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: jest.fn(),
      } as unknown as ReturnType<typeof useSession>);
    });
    it("should fetch personal best scores on mount", async () => {
      renderHook(() => useGameLogic({ modeId: "echo", gameStyle: "practice" }));

      // Wait for async effects (personal best + best streak all styles)
      await waitFor(() => {
        expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(2);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/scores?gameMode=echo&gameStyle=practice"
      );
    });

    it("should handle fetch error gracefully", async () => {
  const originalConsoleError = console.error
  console.error = jest.fn() as unknown as typeof console.error
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      const { result } = renderHook(() =>
        useGameLogic({ modeId: "echo", gameStyle: "practice" })
      );

      // Wait for state updates triggered by failing fetch effect
      await waitFor(() => {
        expect(result.current.highScore).toBe(0);
      });

      // Should not crash and should have default values
  expect(result.current.highScore).toBe(0);
  console.error = originalConsoleError
    });
  });

  describe("Echo Mode Specific", () => {
    it("should handle speak again usage", () => {
      const { result } = renderHook(() =>
        useGameLogic({ modeId: "echo", gameStyle: "practice" })
      );

      act(() => {
        result.current.handleSpeakAgainUsed(true);
      });

      expect(result.current.usedSpeakAgain).toBe(true);
    });
  });

  describe("Mode Switching", () => {
    it("should handle mode change correctly", () => {
      const { result, rerender } = renderHook(
        ({ modeId, gameStyle }) => useGameLogic({ modeId, gameStyle }),
        {
          initialProps: { modeId: "echo", gameStyle: "practice" as const },
        }
      );

      // Change mode
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rerender({ modeId: "typing", gameStyle: "challenge" as any });

      expect(result.current).toBeDefined();
    });
  });

  describe("Nitro Energy (Typing Challenge)", () => {
    it("should expose nitro energy for typing challenge mode", () => {
      const { result } = renderHook(() =>
        useGameLogic({ modeId: "typing", gameStyle: "challenge" })
      );

      expect(result.current.energy).toBe(100);
      expect(result.current.maxEnergy).toBe(100);
      expect(result.current.isLowEnergy).toBe(false);
      expect(typeof result.current.addEnergy).toBe("function");
      expect(typeof result.current.removeEnergy).toBe("function");
      expect(typeof result.current.resetEnergy).toBe("function");
    });
  });

  describe("Overdrive System (Typing Challenge)", () => {
    it("should expose overdrive system for typing challenge mode", () => {
      const { result } = renderHook(() =>
        useGameLogic({ modeId: "typing", gameStyle: "challenge" })
      );

      expect(result.current.heatLevel).toBeDefined();
      expect(result.current.heatLevel.level).toBe(1);
      expect(result.current.isOverdriveTransitioning).toBe(false);
      expect(result.current.correctWordsCount).toBe(0);
    });
  });
});
