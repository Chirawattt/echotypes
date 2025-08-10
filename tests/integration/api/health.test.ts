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

import { GET } from '@/app/api/health/route'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

import { supabase as mockedSupabase } from '@/lib/supabase'

type QueryResult<T = unknown> = { data: T | null; error: any };
const ok = (data: any = []): Promise<QueryResult> => Promise.resolve({ data, error: null })
const fail = (err: any): Promise<QueryResult> => Promise.resolve({ data: null, error: err })

const createChain = (result: Promise<QueryResult>) => {
  const chain: any = {}
  chain.select = jest.fn(() => chain)
  chain.limit = jest.fn(() => result)
  return chain
}

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns healthy when all checks pass', async () => {
    ;(mockedSupabase.from as unknown as jest.Mock).mockImplementation((table: string) => {
      if (table === 'Words') return createChain(ok([{ count: 1 }]))
      if (table === 'GameScores') return createChain(ok([{ id: 1 }]))
      if (table === 'Users') return createChain(ok([{ id: 1 }]))
      return createChain(ok())
    })

    const res = await GET()
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.status).toBe('healthy')
  })

  it('returns 503 when first DB check fails', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(mockedSupabase.from as unknown as jest.Mock).mockImplementation((table: string) => {
      if (table === 'Words') return createChain(fail(new Error('db down')))
      return createChain(ok())
    })

    const res = await GET()
    const json = await res.json()
    expect(res.status).toBe(503)
    expect(json.status).toBe('unhealthy')
    errSpy.mockRestore()
  })
})
