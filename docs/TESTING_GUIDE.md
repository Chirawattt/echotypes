# Testing Guide

This guide covers the comprehensive testing setup for the EchoTypes Frontend project.

## 🧪 Testing Stack

### Unit Testing
- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom Jest matchers

### Integration Testing
- **Jest + React Testing Library**: Component integration tests
- **MSW (Mock Service Worker)**: API mocking (configured but disabled due to Node.js compatibility)

### End-to-End (E2E) Testing
- **Playwright**: Modern E2E testing framework
- Cross-browser testing (Chromium, Firefox, WebKit)
- Mobile device simulation

## 📁 Test Structure

```
tests/
├── unit/           # Unit tests for individual functions/components
├── integration/    # Integration tests for component interactions
└── e2e/           # End-to-end tests for complete user workflows
```

## 🚀 Running Tests

### Unit & Integration Tests
```bash
# Run all Jest tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### End-to-End Tests
```bash
# Run all Playwright tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run tests for specific browser
npx playwright test --project=chromium
```

### Run All Tests
```bash
npm run test:all
```

## 📝 Writing Tests

### Unit Tests Example
```typescript
// tests/unit/utils.test.ts
describe('Utility Functions', () => {
  it('should calculate correctly', () => {
    expect(calculateScore(10, 60)).toBeGreaterThan(0)
  })
})
```

### Integration Tests Example  
```typescript
// tests/integration/component.test.tsx
import { render, screen } from '@testing-library/react'

describe('Component Integration', () => {
  it('should render with props', () => {
    render(<Component text="Hello" />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### E2E Tests Example
```typescript
// tests/e2e/game-flow.spec.ts
import { test, expect } from '@playwright/test'

test('should complete game flow', async ({ page }) => {
  await page.goto('/')
  await page.click('text=เริ่มเล่น')
  await expect(page).toHaveURL('/play')
})
```

## 🎯 Testing Strategy

### Unit Tests (30%)
- Test individual functions and hooks
- Focus on business logic and utilities
- Mock external dependencies

### Integration Tests (50%)
- Test component interactions
- Verify API integrations
- Test state management

### E2E Tests (20%)
- Test complete user workflows
- Verify critical paths
- Cross-browser compatibility

## 🔧 Configuration Files

### Jest Configuration
- `jest.config.js`: Main Jest configuration
- `jest.setup.js`: Test setup and global mocks

### Playwright Configuration
- `playwright.config.ts`: E2E test configuration
- Supports multiple browsers and mobile devices

## 🎮 Game-Specific Testing

### Test Areas to Focus On
1. **Game Modes**: Echo, Memory, Typing modes
2. **DDA System**: Dynamic difficulty adjustment
3. **Scoring System**: Score calculations and persistence
4. **Audio/Speech**: Text-to-speech functionality
5. **User Interactions**: Input handling and validation

### Sample Test Cases
- User can start and complete a game
- DDA system adjusts difficulty correctly
- Scores are calculated and saved properly
- Game responds to user input accurately
- Educational features display word meanings/types

## 🐛 Debugging Tests

### Jest Debugging
```bash
# Run specific test file
npm test -- scoring.test.ts

# Run with verbose output
npm test -- --verbose

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest
```

### Playwright Debugging
```bash
# Run with debug mode
npm run test:e2e -- --debug

# Run headed (visible browser)
npm run test:e2e -- --headed

# Generate test reports
npm run test:e2e -- --reporter=html
```

## 📊 Coverage Reports

Coverage reports are generated in the `coverage/` directory:
- `coverage/lcov-report/index.html`: Detailed HTML report
- `coverage/lcov.info`: LCOV format for CI/CD integration

## 🚨 Best Practices

### General
- Write descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests isolated and independent
- Mock external dependencies

### React Testing
- Test behavior, not implementation
- Use semantic queries (getByRole, getByText)
- Test user interactions
- Avoid testing internal state directly

### E2E Testing
- Test critical user journeys
- Use stable selectors (data-testid)
- Handle async operations properly
- Test across different viewports

## 🔄 Continuous Integration

The testing setup is designed to work with CI/CD pipelines:
- All tests run in parallel when possible
- E2E tests include retry logic for flaky tests
- Coverage reports can be uploaded to services
- Tests run on multiple browsers automatically

## 🛠️ Troubleshooting

### Common Issues
1. **MSW compatibility**: Currently disabled due to Node.js version conflicts
2. **Async operations**: Use proper waiting strategies in tests
3. **Memory leaks**: Clean up resources in afterEach hooks
4. **Flaky tests**: Add proper waiting and error handling

### Getting Help
- Check Jest documentation: https://jestjs.io/
- Check Playwright documentation: https://playwright.dev/
- Review existing test files for patterns
- Use debugging tools when tests fail

## 📈 Next Steps

1. **Expand test coverage**: Add more unit and integration tests
2. **Enable MSW**: Fix Node.js compatibility for API mocking
3. **CI/CD integration**: Set up automated testing in deployment pipeline
4. **Performance testing**: Add load testing for game performance
5. **Visual regression testing**: Add screenshot comparisons

This testing setup provides a solid foundation for maintaining code quality and preventing regressions in the EchoTypes application.