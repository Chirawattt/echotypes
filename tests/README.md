# EchoTypes Testing Suite

This directory contains comprehensive tests for the EchoTypes application, covering unit tests, integration tests, and end-to-end tests.

## Test Structure

```
tests/
├── unit/              # Unit tests for individual components and functions
│   ├── lib/          # Library and utility function tests
│   │   ├── scoring.test.ts
│   │   └── gameStore.test.ts
│   └── hooks/        # Custom hook tests
│       └── useGameLogic.test.ts
├── integration/      # Integration tests for feature combinations
│   ├── game-modes/   # Game mode component tests
│   │   ├── EchoMode.test.tsx
│   │   └── TypingMode.test.tsx
│   └── api/          # API route tests
│       └── scores.test.ts
├── e2e/              # End-to-end tests using Playwright
│   ├── auth.spec.ts
│   ├── gameplay.spec.ts
│   └── navigation.spec.ts
├── setup/            # Test configuration and utilities
│   └── test-utils.tsx
└── README.md         # This file
```

## Running Tests

### Unit Tests (Jest)
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test scoring.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="scoring"
```

### Integration Tests
```bash
# Run integration tests specifically
npm test tests/integration

# Run API tests
npm test tests/integration/api

# Run game mode tests
npm test tests/integration/game-modes
```

### End-to-End Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific E2E test
npx playwright test auth.spec.ts

# Run E2E tests on specific browser
npx playwright test --project=chromium
```

### All Tests
```bash
# Run all test suites
npm run test:all
```

## Test Categories

### Unit Tests
Test individual functions, components, and hooks in isolation:

- **Scoring System**: Tests for challenge mode scoring calculations
- **Game Store**: Tests for Zustand state management
- **Game Logic Hook**: Tests for main game orchestration logic
- **DDA System**: Tests for dynamic difficulty adjustment
- **Audio/Speech**: Tests for sound and speech functionality

### Integration Tests
Test how different parts of the application work together:

- **Game Modes**: Test complete game mode components with real interactions
- **API Routes**: Test API endpoints with database operations
- **User Flows**: Test multi-step user interactions
- **Component Integration**: Test how components interact with stores and hooks

### End-to-End Tests
Test complete user journeys in a real browser environment:

- **Authentication Flow**: Login, logout, session management
- **Complete Gameplay**: Full game sessions from start to finish
- **Navigation**: Moving between different pages and sections
- **Responsive Design**: Mobile and desktop interactions
- **Error Handling**: How the app handles various error conditions

## Test Utilities

### Custom Render Function
```typescript
import { render } from '@/tests/setup/test-utils';

// Automatically wraps components with necessary providers
render(<MyComponent />);
```

### Mock Data Generators
```typescript
import { createMockWord, generateTestWords } from '@/tests/setup/test-utils';

const word = createMockWord({ word: 'hello', level: 'a1' });
const words = generateTestWords(10);
```

### Custom Matchers
```typescript
expect(word).toBeValidWord();
expect(gameState).toBeValidGameState();
```

## Mocked APIs and Services

### Web APIs
- Speech Synthesis API
- Web Audio API
- Local Storage
- Session Storage
- Fetch API
- ResizeObserver
- IntersectionObserver

### External Services
- NextAuth.js authentication
- Supabase database operations
- Next.js routing and navigation

### Audio and Media
- HTML5 Audio elements
- AudioContext for sound effects
- Speech synthesis for word pronunciation

## Test Data

### Mock Users
```typescript
const testUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com'
};
```

### Mock Words
```typescript
const mockWords = [
  { word: 'hello', meaning: 'greeting', level: 'a1', type: 'interjection' },
  { word: 'world', meaning: 'earth', level: 'a1', type: 'noun' },
  { word: 'javascript', meaning: 'programming language', level: 'b2', type: 'noun' }
];
```

### Mock Scores
```typescript
const mockScores = [
  { score: 150, highest_streak: 8, game_mode: 'echo', game_style: 'practice' },
  { score: 2500, highest_streak: 15, game_mode: 'typing', game_style: 'challenge', wpm: 65 }
];
```

## Configuration

### Jest Configuration
- Custom test environment with jsdom
- Path aliases matching the main application
- Coverage collection from relevant source files
- Test timeout of 10 seconds for async operations

### Playwright Configuration
- Tests run on Chromium, Firefox, and WebKit
- Mobile viewport testing (iPhone, Pixel)
- Automatic retry on CI environments
- HTML reporter for test results
- Base URL configured for local development

## Best Practices

### Writing Tests
1. **Test Behavior, Not Implementation**: Focus on what the user sees and does
2. **Arrange-Act-Assert**: Structure tests clearly with setup, action, and verification
3. **Descriptive Test Names**: Use clear, specific test descriptions
4. **Mock External Dependencies**: Isolate the code under test
5. **Test Edge Cases**: Cover error conditions and boundary cases

### Test Organization
1. **Group Related Tests**: Use `describe` blocks to organize test suites
2. **Setup and Teardown**: Use `beforeEach` and `afterEach` for test preparation
3. **Shared Test Data**: Use test utilities for consistent mock data
4. **Async Testing**: Properly handle promises and async operations

### Performance
1. **Parallel Execution**: Tests run in parallel for faster execution
2. **Selective Testing**: Run only relevant tests during development
3. **Coverage Thresholds**: Maintain good test coverage without obsessing over 100%
4. **Fast Feedback**: Unit tests should run quickly for rapid iteration

## Debugging Tests

### Jest Debugging
```bash
# Run tests with debug info
npm test -- --verbose

# Run single test file with debugging
node --inspect-brk node_modules/.bin/jest tests/unit/lib/scoring.test.ts

# Debug in VS Code
# Use the "Jest Debug" configuration in launch.json
```

### Playwright Debugging
```bash
# Run tests in headed mode
npx playwright test --headed

# Debug specific test
npx playwright test auth.spec.ts --debug

# Generate test code
npx playwright codegen localhost:3000
```

## Continuous Integration

Tests are designed to run reliably in CI environments:

- **Deterministic**: Tests produce consistent results
- **Environment Independent**: Don't rely on external services
- **Fast Execution**: Optimized for quick feedback
- **Comprehensive Coverage**: Cover critical user paths and edge cases

## Adding New Tests

### For New Features
1. Start with unit tests for core logic
2. Add integration tests for component interactions
3. Create E2E tests for critical user flows
4. Update test utilities if needed

### For Bug Fixes
1. Write a failing test that reproduces the bug
2. Fix the bug
3. Ensure the test now passes
4. Add edge case tests to prevent regression

## Coverage Goals

- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: Cover all major user interactions
- **E2E Tests**: Cover critical user journeys
- **API Tests**: 100% coverage for all endpoints

The goal is comprehensive testing that gives confidence in deployments while maintaining fast feedback loops during development.