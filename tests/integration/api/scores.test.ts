/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock("next/server", () => ({
  NextResponse: {
    json: (
      body: unknown,
      init?: { status?: number; headers?: Record<string, string> }
    ) => {
      const headers = new Headers(init?.headers ?? {});
      if (!headers.has("content-type"))
        headers.set("content-type", "application/json; charset=utf-8");
      return new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers,
      });
    },
  },
  // Provide a placeholder value export for NextRequest to satisfy runtime import.
  NextRequest: class {
    url: string;
    constructor(url: string) {
      this.url = url;
    }
    async json() {
      return {};
    }
  },
}));

import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/scores/route";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";

// Mock dependencies
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockGetServerSession = getServerSession as unknown as jest.MockedFunction<
  typeof getServerSession
>;
import { supabase as mockedSupabase } from "@/lib/supabase";

// Helper to build a chainable supabase query mock
type QueryResult<T = unknown> = { data: T | null; error: unknown };
type Chain = {
  select: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
  order: jest.Mock;
  insert: jest.Mock;
  upsert: jest.Mock;
};

const createChain = (
  initial: Partial<{
    single: Promise<QueryResult>;
    order: Promise<QueryResult>;
    insert: Promise<{ error: unknown }>;
    upsert: Promise<{ error: unknown }>;
  }> = {}
) => {
  const chain: any = {};
  chain.select = jest.fn(() => chain);
  chain.eq = jest.fn(() => chain);
  chain.single = jest.fn(
    () => initial.single ?? Promise.resolve({ data: null, error: null })
  );
  chain.order = jest.fn(
    () => initial.order ?? Promise.resolve({ data: null, error: null })
  );
  chain.insert = jest.fn(
    () => initial.insert ?? Promise.resolve({ error: null })
  );
  chain.upsert = jest.fn(
    () => initial.upsert ?? Promise.resolve({ error: null })
  );
  return chain as Chain;
};

describe("/api/scores API Integration", () => {
  const mockSession: Session = {
    user: {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // expires in 24 hours
  };

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe("GET /api/scores", () => {
    it("should return scores for authenticated user", async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const rows = [
        {
          id: 1,
          game_mode: "echo",
          game_style: "practice",
          score: 100,
          highest_streak: 5,
          wpm: null,
        },
      ];
      const chain = createChain({
        order: Promise.resolve({ data: rows, error: null }),
      });
      (mockedSupabase.from as unknown as jest.Mock).mockReturnValue(chain);

      const request = {
        url: "http://localhost:3000/api/scores?gameMode=echo&gameStyle=practice",
      } as unknown as NextRequest;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.scores).toHaveLength(1);
      expect(data.scores[0].game_mode).toBe("echo");
    });

    it("should return 401 for unauthenticated user", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = {
        url: "http://localhost:3000/api/scores",
      } as unknown as NextRequest;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should filter by game mode when provided", async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const chain = createChain({
        order: Promise.resolve({ data: [], error: null }),
      });
      (mockedSupabase.from as unknown as jest.Mock).mockReturnValue(chain);

      const request = {
        url: "http://localhost:3000/api/scores?gameMode=typing",
      } as unknown as NextRequest;
      await GET(request);

      // First eq is for user_id, ensure one of the eq calls was for game_mode
      expect(chain.eq.mock.calls).toEqual(
        expect.arrayContaining([
          ["user_id", "test-user-id"],
          ["game_mode", "typing"],
        ])
      );
    });

    it("should handle database errors gracefully", async () => {
      const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockGetServerSession.mockResolvedValue(mockSession);
      const chain = createChain({
        order: Promise.resolve({ data: null, error: new Error("db failed") }),
      });
      (mockedSupabase.from as unknown as jest.Mock).mockReturnValue(chain);

      const request = {
        url: "http://localhost:3000/api/scores",
      } as unknown as NextRequest;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Internal Server Error" });
      errSpy.mockRestore();
    });
  });

  describe("POST /api/scores", () => {
    const validScoreData = {
      gameMode: "echo",
      gameStyle: "practice",
      score: 150,
      highestStreak: 8,
      wordsCorrect: 15,
      wordsIncorrect: 2,
      timeSpentSeconds: 120,
    };

    it("should submit score for authenticated user", async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      // Chain sequence: Users.single() -> ok, GameSessions.insert() -> ok, GameScores.single() -> not found (code PGRST116), upsert() -> ok
      const usersChain = createChain({
        single: Promise.resolve({
          data: { id: "test-user-id", name: "Test User" },
          error: null,
        }),
      });
      const sessionsChain = createChain({
        insert: Promise.resolve({ error: null }),
      });
      const scoresChain = createChain({
        single: Promise.resolve({ data: null, error: { code: "PGRST116" } }),
        upsert: Promise.resolve({ error: null }),
      });
      (mockedSupabase.from as unknown as jest.Mock).mockImplementation(
        (table: string) => {
          if (table === "Users") return usersChain;
          if (table === "GameSessions") return sessionsChain;
          if (table === "GameScores") return scoresChain;
          return createChain();
        }
      );

      const request = {
        url: "http://localhost:3000/api/scores",
        method: "POST",
        json: async () => validScoreData,
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionSaved).toBe(true);
      expect(sessionsChain.insert).toHaveBeenCalled();
    });

    it("should return 401 for unauthenticated user", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = {
        url: "http://localhost:3000/api/scores",
        method: "POST",
        json: async () => validScoreData,
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should validate required fields", async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const invalidData = {
        gameMode: "echo",
        // Missing required fields
      };

      const request = {
        url: "http://localhost:3000/api/scores",
        method: "POST",
        json: async () => invalidData as unknown as Record<string, unknown>,
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid or missing required data" });
    });

    it("should handle database insertion errors", async () => {
      const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockGetServerSession.mockResolvedValue(mockSession);
      const usersChain = createChain({
        single: Promise.resolve({
          data: { id: "test-user-id", name: "Test User" },
          error: null,
        }),
      });
      const sessionsChain = createChain({
        insert: Promise.resolve({ error: new Error("Insertion failed") }),
      });
      (mockedSupabase.from as unknown as jest.Mock).mockImplementation(
        (table: string) => (table === "Users" ? usersChain : sessionsChain)
      );

      const request = {
        url: "http://localhost:3000/api/scores",
        method: "POST",
        json: async () => validScoreData,
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Internal Server Error" });
      errSpy.mockRestore();
    });
  });
});
