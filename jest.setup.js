// Polyfill Fetch API (Request, Response, Headers) for NextRequest and web APIs
import 'whatwg-fetch'
import { TextEncoder as NodeTextEncoder, TextDecoder as NodeTextDecoder } from 'util'
import { webcrypto as NodeWebCrypto } from 'crypto'

import '@testing-library/jest-dom'
import { gameTestMatchers } from './tests/setup/test-utils'

// Extend Jest with custom matchers
expect.extend(gameTestMatchers)

// Note: MSW setup disabled for now due to Node.js compatibility issues
// Can be enabled later with proper polyfills

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Polyfill TextEncoder/TextDecoder and WebCrypto for libraries like next-auth/jose in Node test envs
if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = NodeTextEncoder
}
if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = NodeTextDecoder
}
// Ensure WebCrypto exists for jose/next-auth
// @ts-expect-error Assign Node's webcrypto to global in Jest JS setup
if (!globalThis.crypto || !globalThis.crypto.subtle) {
  // @ts-expect-error Assigning Node webcrypto to globalThis in Jest env
  globalThis.crypto = NodeWebCrypto
}

// NextResponse.json relies on a static Response.json helper that doesn't exist in whatwg-fetch's polyfill.
// Provide a minimal static implementation so NextResponse.json works in tests.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (typeof Response !== 'undefined' && typeof Response.json !== 'function') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Response.json = (body, init) => {
    const headers = new Headers(init?.headers || {})
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json; charset=utf-8')
    }
    return new Response(JSON.stringify(body), { ...init, headers })
  }
}

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt ?? ''} {...props} />
  },
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }
    },
    status: 'authenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock Overdrive System hook with a safe default
jest.mock('@/hooks/useOverdriveSystem', () => ({
  useOverdriveSystem: jest.fn(() => ({
    currentHeatLevel: {
      level: 1,
      name: 'Cool',
      minCorrectWords: 0,
      maxCorrectWords: 5,
      energyDecayInterval: 1000,
      color: 'blue',
      bgColor: 'blue',
      effects: { hasParticles: false, hasShake: false, hasPulse: false },
    },
    isTransitioning: false,
    heatLevels: [],
    getHeatLevelByWordsCount: jest.fn(),
  })),
}))

// Safe default mocks for other hooks used by useGameLogic
jest.mock('@/hooks/useSpeech', () => ({
  useSpeech: jest.fn(() => ({
    speak: jest.fn(),
    cancelSpeech: jest.fn(),
    currentUtteranceRef: { current: null },
  })),
}))

jest.mock('@/hooks/useAudio', () => ({
  useAudio: jest.fn(() => ({
    playSound: jest.fn(),
    correctAudioRef: { current: null },
    incorrectAudioRef: { current: null },
    completedAudioRef: { current: null },
    countdownAudioRef: { current: null },
    keypressAudioRef: { current: null },
  })),
}))

jest.mock('@/hooks/useDDA', () => ({
  useDDA: jest.fn(() => ({
    currentDifficultyLevel: 1,
    performanceScore: 0,
    handleDdaUpdate: jest.fn(),
    resetDdaState: jest.fn(),
    setDifficultyLevel: jest.fn(),
    setPerformanceScoreManually: jest.fn(),
    initDifficultyLevelRef: { current: 1 },
  })),
}))

jest.mock('@/hooks/useGameTimers', () => ({
  useGameTimers: jest.fn(() => ({
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
  })),
}))

jest.mock('@/hooks/useGameScore', () => ({
  useGameScore: jest.fn(() => ({
    showScoreBreakdown: false,
    calculateAndAddScore: jest.fn(),
    calculateScoreForTimeUp: jest.fn(),
    resetChallengeScore: jest.fn(),
    cleanup: jest.fn(),
    scoreBreakdownTimerRef: { current: null },
  })),
}))

jest.mock('@/hooks/useGameModes', () => ({
  useGameModes: jest.fn(() => ({})),
}))

jest.mock('@/hooks/useGameEvents', () => ({
  useGameEvents: jest.fn(() => ({
    handleUserInputChange: jest.fn(),
    handleFormSubmit: jest.fn(),
  })),
}))

jest.mock('@/hooks/useNitroEnergy', () => ({
  useNitroEnergy: jest.fn(() => ({
    energy: 100,
    maxEnergy: 100,
    isLowEnergy: false,
    addEnergy: jest.fn(),
    removeEnergy: jest.fn(),
    resetEnergy: jest.fn(),
  })),
}))

// Ensure required env vars exist for modules that initialize on import (e.g., Supabase client)
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key'

// Mock Web Speech API
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => []),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}

// Mock Web Audio API
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
  currentTime: 0,
}))

// Mock HTML5 Audio
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  volume: 1,
  currentTime: 0,
  duration: 0,
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
})

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
)

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url')

// Mock console methods to reduce noise in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string') {
      const msg = args[0]
      // Ignore legacy render warning
      if (msg.includes('Warning: ReactDOM.render is no longer supported')) {
        return
      }
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Global test timeout
jest.setTimeout(10000)

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
  mockLocalStorage.clear()
})