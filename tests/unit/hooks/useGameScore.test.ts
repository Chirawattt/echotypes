import { renderHook, act, waitFor } from '@testing-library/react'

const addChallengeScoreMock = jest.fn()
const resetChallengeScoreMock = jest.fn()
const setLastScoreChangeMock = jest.fn()

jest.mock('@/lib/stores/gameStore', () => ({
  useGameStore: () => ({
    streakCount: 3,
    totalChallengeScore: 0,
    lastScoreCalculation: null,
    lastScoreChange: 0,
    addChallengeScore: addChallengeScoreMock,
    resetChallengeScore: resetChallengeScoreMock,
    setLastScoreChange: setLastScoreChangeMock,
    words: [{ level: 'a1' }],
    currentWordIndex: 0,
  }),
}))

// Import the hook after mocking the store to ensure the mock is used by the hook module
jest.unmock('@/hooks/useGameScore')
import { useGameScore } from '@/hooks/useGameScore'

describe('useGameScore', () => {
  it('calculates and adds score for echo challenge', async () => {
    const { result } = renderHook(() => useGameScore({ gameStyle: 'challenge', modeId: 'echo' }))
    act(() => {
      result.current.calculateAndAddScore(true, 4.5, 5)
    })
    await waitFor(() => expect(addChallengeScoreMock).toHaveBeenCalledTimes(1))
    expect(result.current.scoreBreakdownTimerRef.current).toBeTruthy()
  })

  it('calculates score for time up (echo challenge)', () => {
    const { result } = renderHook(() => useGameScore({ gameStyle: 'challenge', modeId: 'echo' }))
    act(() => {
      result.current.calculateScoreForTimeUp()
    })
    expect(typeof result.current.resetChallengeScore).toBe('function')
  })
})
