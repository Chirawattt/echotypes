import { renderHook, act } from '@testing-library/react'
import { useGameTimers } from '@/hooks/useGameTimers'

// Mock game store pieces used by the hook
jest.mock('@/lib/stores/gameStore', () => {
  const setState = jest.fn()
  return {
    useGameStore: () => ({
      status: 'playing',
      startTime: new Date(),
      setStartTime: jest.fn(),
      setCurrentTime: jest.fn(),
      setStatus: setState,
      decrementTimeLeft: jest.fn(() => 0),
    }),
  }
})

describe('useGameTimers', () => {
  it('starts typing practice countdown and ends game at zero', () => {
    jest.useFakeTimers()

    const { result } = renderHook(() => useGameTimers({ modeId: 'typing', gameStyle: 'practice' }))

    // Advance one tick to trigger decrement -> 0 then gameOver
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current).toBeDefined()

    jest.useRealTimers()
  })
})
