// Jest custom matchers type declarations
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidWord(): R;
      toBeValidGameState(): R;
    }
  }
}