import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/providers/AuthContext';

// Mock session for testing
const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com'
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={mockSession}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test utilities for game state
export const createMockWord = (overrides = {}) => ({
  word: 'test',
  meaning: 'a test word',
  level: 'a1',
  type: 'noun',
  ...overrides
});

export const createMockGameState = (overrides = {}) => ({
  status: 'loading' as const,
  words: [createMockWord()],
  currentWordIndex: 0,
  userInput: '',
  score: 0,
  lives: 3,
  streakCount: 0,
  totalChallengeScore: 0,
  timeLeft: 60,
  currentDifficultyLevel: 1,
  performanceScore: 0,
  ...overrides
});

// Mock audio functions
export const createMockAudioHooks = () => ({
  playSound: jest.fn(),
  correctAudioRef: { current: null },
  incorrectAudioRef: { current: null },
  completedAudioRef: { current: null },
  countdownAudioRef: { current: null },
  keypressAudioRef: { current: null }
});

// Mock speech functions
export const createMockSpeechHooks = () => ({
  speak: jest.fn(),
  cancelSpeech: jest.fn(),
  currentUtteranceRef: { current: null }
});

// Wait for async operations in tests
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock fetch responses
export const mockFetchResponse = (data: unknown, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: jest.fn().mockResolvedValue(data),
    status: ok ? 200 : 400
  });
};

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    length: Object.keys(store).length
  };
};

// Mock Web APIs that games use
export const mockWebAPIs = () => {
  // Mock speechSynthesis
  global.speechSynthesis = {
    speak: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    getVoices: jest.fn(() => []),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  } as SpeechSynthesis;

  // Mock AudioContext
  global.AudioContext = jest.fn().mockImplementation(() => ({
    createOscillator: jest.fn(() => ({
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: { value: 0 }
    })),
    createGain: jest.fn(() => ({
      connect: jest.fn(),
      gain: { value: 0 }
    })),
    destination: {},
    currentTime: 0
  }));

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }));

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn()
    }))
  });

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage(),
    writable: true
  });
};

// Setup function to call in test files
export const setupTestEnvironment = () => {
  mockWebAPIs();
  
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
};

// Custom matchers for game testing
export const gameTestMatchers = {
  toBeValidWord: (received: unknown) => {
    const pass = received && 
                 typeof (received as { word?: unknown }).word === 'string' && 
                 typeof (received as { meaning?: unknown }).meaning === 'string' && 
                 typeof (received as { level?: unknown }).level === 'string';
    
    return {
      message: () => `expected ${received} to be a valid word object`,
      pass
    };
  },
  
  toBeValidGameState: (received: unknown) => {
    const requiredFields = ['status', 'words', 'currentWordIndex', 'score', 'lives'];
    const pass = requiredFields.every(field => field in (received as Record<string, unknown>));
    
    return {
      message: () => `expected ${received} to be a valid game state object`,
      pass
    };
  }
};

// Jest matcher types
export interface CustomMatchers<R = unknown> {
  toBeValidWord(): R;
  toBeValidGameState(): R;
}

// Test data generators
export const generateTestWords = (count: number) => {
  return Array.from({ length: count }, (_, i) => createMockWord({
    word: `word${i}`,
    meaning: `meaning ${i}`,
    level: ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'][i % 6]
  }));
};

export const generateTestScores = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    score: 100 + i * 50,
    highest_streak: 5 + i,
    game_mode: ['echo', 'memory', 'typing'][i % 3],
    game_style: ['practice', 'challenge'][i % 2],
    wpm: i % 3 === 2 ? 60 + i * 5 : undefined
  }));
};