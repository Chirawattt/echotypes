import { getLeaderboard, submitGameScore, getUserScores, getUserStats, checkMilestones } from '@/lib/database'

// Mock fetch for API-based functions
const originalFetch = global.fetch
beforeAll(() => {
  global.fetch = jest.fn(async (url: RequestInfo, init?: RequestInit) => {
    const u = String(url)
    if (u.startsWith('/api/scores') && (!init || init.method === 'GET')) {
      return new Response(JSON.stringify({ scores: [] }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    if (u === '/api/scores' && init?.method === 'POST') {
      return new Response(JSON.stringify({ message: 'ok', isNewHighScore: false }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    return new Response(JSON.stringify({}), { status: 200, headers: { 'content-type': 'application/json' } })
  }) as unknown as typeof fetch
})

afterAll(() => {
  global.fetch = originalFetch!
})

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          not: jest.fn(() => ({ order: jest.fn(() => ({ limit: jest.fn(() => ({ data: [], error: null })) })) }))
        }))
      }))
    }))
  }
}))

describe('lib/database', () => {
  it('submitGameScore returns success', async () => {
    const res = await submitGameScore({ gameMode: 'echo', gameStyle: 'practice', score: 1, highestStreak: 1, wordsCorrect: 1, wordsIncorrect: 0, timeSpentSeconds: 5 })
    expect(res.success).toBe(true)
  })

  it('getUserScores returns array', async () => {
    const scores = await getUserScores({ gameMode: 'echo', gameStyle: 'practice' })
    expect(Array.isArray(scores)).toBe(true)
  })

  it('getUserStats returns zeros when no scores', async () => {
    const stats = await getUserStats()
    expect(stats.totalGames).toBe(0)
  })

  it('checkMilestones returns milestone for 50 score', async () => {
    const { newMilestones } = await checkMilestones({ gameMode: 'echo', gameStyle: 'practice', score: 50, highestStreak: 0, wordsCorrect: 0, wordsIncorrect: 0, timeSpentSeconds: 1 })
    expect(newMilestones.length).toBeGreaterThanOrEqual(1)
  })

  it('getLeaderboard returns empty array when supabase returns none', async () => {
    const list = await getLeaderboard('echo', 'practice', 5)
    expect(Array.isArray(list)).toBe(true)
  })
})
