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

import { GET } from '@/app/api/leaderboard/route'

jest.mock('@/lib/database', () => ({
  getLeaderboard: jest.fn(),
}))

import { getLeaderboard } from '@/lib/database'

const makeReq = (qs: string) => ({ url: `http://localhost:3000/api/leaderboard${qs}` }) as any

describe('/api/leaderboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('validates required params', async () => {
    const res = await GET(makeReq(''))
    expect(res.status).toBe(400)
  })

  it('validates enum values', async () => {
    const res = await GET(makeReq('?gameMode=wrong&gameStyle=practice'))
    expect(res.status).toBe(400)
  })

  it('validates limit range', async () => {
    const res = await GET(makeReq('?gameMode=echo&gameStyle=practice&limit=1000'))
    expect(res.status).toBe(400)
  })

  it('returns leaderboard data on success', async () => {
    ;(getLeaderboard as jest.Mock).mockResolvedValue([
      { player_name: 'A', game_mode: 'echo', game_style: 'practice', score: 10, highest_streak: 2, created_at: '', rank: 1 },
    ])
    const res = await GET(makeReq('?gameMode=echo&gameStyle=practice&limit=5'))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.leaderboard).toHaveLength(1)
  })

  it('handles internal errors', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(getLeaderboard as jest.Mock).mockRejectedValue(new Error('boom'))
    const res = await GET(makeReq('?gameMode=echo&gameStyle=practice&limit=5'))
    expect(res.status).toBe(500)
    errSpy.mockRestore()
  })
})
