import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/scores/route';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';

// Define types for mocked functions
type MockedSupabaseResponse = {
  data: unknown[] | null;
  error: Error | null;
};

type MockedSupabaseChain = {
  select: jest.MockedFunction<() => {
    eq: jest.MockedFunction<() => {
      order: jest.MockedFunction<() => {
        limit: jest.MockedFunction<() => Promise<MockedSupabaseResponse>>;
      }>;
    }>;
  }>;
};

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/supabase');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('/api/scores API Integration', () => {
  const mockSession: Session = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  // Mock supabase module
  const mockSupabase = {
    from: jest.fn(),
    insert: jest.fn(),
    upsert: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Reset supabase mocks
    const supabaseModule = await import('@/lib/supabase');
    (supabaseModule as { supabase: typeof mockSupabase }).supabase = mockSupabase;
  });

  describe('GET /api/scores', () => {
    it('should return scores for authenticated user', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      
      const mockSupabaseResponse: MockedSupabaseResponse = {
        data: [
          {
            id: 1,
            game_mode: 'echo',
            game_style: 'practice',
            score: 100,
            highest_streak: 5,
            wpm: null
          }
        ],
        error: null
      };

      // Mock the Supabase chain
      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve(mockSupabaseResponse))
          }))
        }))
      }));
      mockSupabase.from.mockReturnValue({ select: mockSelect } as MockedSupabaseChain);

      const request = new NextRequest('http://localhost:3000/api/scores?gameMode=echo&gameStyle=practice');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.scores).toHaveLength(1);
      expect(data.scores[0].game_mode).toBe('echo');
    });

    it('should return 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/scores');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Unauthorized');
    });

    it('should filter by game mode when provided', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const mockEq = jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }));
      const mockSelect = jest.fn(() => ({ eq: mockEq }));
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const request = new NextRequest('http://localhost:3000/api/scores?gameMode=typing');
      await GET(request);

      expect(mockEq).toHaveBeenCalledWith('game_mode', 'typing');
    });

    it('should handle database errors gracefully', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const mockError = new Error('Database connection failed');
      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({
              data: null,
              error: mockError
            }))
          }))
        }))
      }));
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const request = new NextRequest('http://localhost:3000/api/scores');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Failed to fetch scores');
    });
  });

  describe('POST /api/scores', () => {
    const validScoreData = {
      gameMode: 'echo',
      gameStyle: 'practice',
      score: 150,
      streak: 8,
      wordsCorrect: 15,
      wordsIncorrect: 2,
      timeSpentSeconds: 120
    };

    it('should submit score for authenticated user', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const mockInsert = jest.fn(() => Promise.resolve({
        data: [{ id: 1, ...validScoreData }],
        error: null
      }));
      const mockUpsert = jest.fn(() => Promise.resolve({
        data: [{ id: 1 }],
        error: null
      }));
      mockSupabase.from.mockReturnValue({ 
        insert: mockInsert,
        upsert: mockUpsert 
      });

      const request = new NextRequest('http://localhost:3000/api/scores', {
        method: 'POST',
        body: JSON.stringify(validScoreData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should return 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/scores', {
        method: 'POST',
        body: JSON.stringify(validScoreData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Unauthorized');
    });

    it('should validate required fields', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const invalidData = {
        gameMode: 'echo',
        // Missing required fields
      };

      const request = new NextRequest('http://localhost:3000/api/scores', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Missing required fields');
    });

    it('should handle database insertion errors', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const mockError = new Error('Insertion failed');
      const mockInsert = jest.fn(() => Promise.resolve({
        data: null,
        error: mockError
      }));
      mockSupabase.from.mockReturnValue({ insert: mockInsert });

      const request = new NextRequest('http://localhost:3000/api/scores', {
        method: 'POST',
        body: JSON.stringify(validScoreData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Failed to submit score');
    });
  });
});