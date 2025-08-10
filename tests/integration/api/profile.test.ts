/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => {
      const headers = new Headers(init?.headers ?? {})
      if (!headers.has('content-type')) headers.set('content-type', 'application/json; charset=utf-8')
      return new Response(JSON.stringify(body), { status: init?.status ?? 200, headers })
    },
  },
}))

import { GET } from '@/app/api/profile/route'

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/supabase', () => ({ supabase: { from: jest.fn() } }))

import { getServerSession } from 'next-auth/next'
import { supabase as mockedSupabase } from '@/lib/supabase'

const mockGetServerSession = getServerSession as unknown as jest.Mock

type QueryResult<T = unknown> = { data: T | null; error: any };
const ok = (data: any = []): Promise<QueryResult> => Promise.resolve({ data, error: null })
const fail = (err: any): Promise<QueryResult> => Promise.resolve({ data: null, error: err })

const chain = () => {
  const c: any = {}
  c.select = jest.fn(() => c)
  c.eq = jest.fn(() => c)
  c.order = jest.fn(() => c)
  c.single = jest.fn(() => ok({}))
  return c
}

describe('/api/profile', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when unauthenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 404 when user not found', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'a@b.com' } })
    const users = chain()
    users.single = jest.fn(() => fail(new Error('no user')))
  ;(mockedSupabase.from as unknown as jest.Mock).mockImplementation(() => users)

    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const res = await GET()
    expect(res.status).toBe(404)
    errSpy.mockRestore()
  })

  it('returns profile stats when authenticated', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'a@b.com', name: 'N' } })
    const users = chain()
    users.single = jest.fn(() => ok({ id: 'u1' }))
    const sessions = chain()
    sessions.order = jest.fn(() => ok([{ words_correct: 2, words_incorrect: 1, time_spent_seconds: 10, score: 2, streak: 1 }]))
    const scores = chain()
    scores.eq = jest.fn(() => scores)
    scores.select = jest.fn(() => scores)
    scores.order = jest.fn(() => ok([{ highest_streak: 3 }]))

    ;(mockedSupabase.from as unknown as jest.Mock).mockImplementation((t: string) => {
      if (t === 'Users') return users
      if (t === 'GameSessions') return sessions
      if (t === 'GameScores') return scores
      return chain()
    })

    const res = await GET()
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.stats.totalGames).toBe(1)
  })
})
