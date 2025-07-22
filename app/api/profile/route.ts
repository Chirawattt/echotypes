import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { UserStats, SessionStats, GameScore } from "@/lib/types";
import type { Session } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from our database
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all game sessions for accurate cumulative statistics
    const { data: sessions, error: sessionsError } = await supabase
      .from('GameSessions')
      .select('*')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false });

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }

    // Fetch personal bests from GameScores
    const { data: personalBests, error: scoresError } = await supabase
      .from('GameScores')
      .select('*')
      .eq('user_id', user.id);

    if (scoresError) {
      console.error('Error fetching personal bests:', scoresError);
      return NextResponse.json({ error: "Failed to fetch personal bests" }, { status: 500 });
    }

    // Calculate TRUE cumulative statistics from all game sessions
    const totalGames = sessions?.length || 0;
    const totalWordsCorrect = sessions?.reduce((sum, session) => sum + session.words_correct, 0) || 0;
    const totalWordsIncorrect = sessions?.reduce((sum, session) => sum + session.words_incorrect, 0) || 0;
    const totalWords = totalWordsCorrect + totalWordsIncorrect;
    const overallAccuracy = totalWords > 0 ? (totalWordsCorrect / totalWords) * 100 : 0;
    const totalTimeSpent = sessions?.reduce((sum, session) => sum + session.time_spent_seconds, 0) || 0;
    
    // Get best streak from personal bests
    const bestStreak = personalBests?.length ? Math.max(...personalBests.map(pb => pb.highest_streak)) : 0;

    // Group personal bests by mode and style
    const groupedPersonalBests: { [key: string]: GameScore } = {};
    personalBests?.forEach(pb => {
      const key = `${pb.game_mode}_${pb.game_style}`;
      groupedPersonalBests[key] = pb;
    });

    // Calculate session statistics by mode and style
    const sessionStatsByMode: { [key: string]: SessionStats } = {};
    
    // Group sessions by mode and style
    const sessionGroups: { [key: string]: typeof sessions } = {};
    sessions?.forEach(session => {
      const key = `${session.game_mode}_${session.game_style}`;
      if (!sessionGroups[key]) sessionGroups[key] = [];
      sessionGroups[key].push(session);
    });

    // Calculate aggregated statistics for each mode/style combination
    Object.entries(sessionGroups).forEach(([key, modeSessions]) => {
      const [gameMode, gameStyle] = key.split('_');
      const totalModeWords = modeSessions.reduce((sum, s) => sum + s.words_correct + s.words_incorrect, 0);
      const totalModeWordsCorrect = modeSessions.reduce((sum, s) => sum + s.words_correct, 0);
      const accuracy = totalModeWords > 0 ? (totalModeWordsCorrect / totalModeWords) * 100 : 0;

      sessionStatsByMode[key] = {
        user_id: user.id,
        game_mode: gameMode,
        game_style: gameStyle,
        total_games: modeSessions.length,
        total_words_correct: totalModeWordsCorrect,
        total_words_incorrect: modeSessions.reduce((sum, s) => sum + s.words_incorrect, 0),
        total_time_spent: modeSessions.reduce((sum, s) => sum + s.time_spent_seconds, 0),
        average_accuracy: accuracy,
        best_score: Math.max(...modeSessions.map(s => s.score), 0),
        best_streak: Math.max(...modeSessions.map(s => s.streak), 0),
        best_wpm: gameMode === 'typing' ? Math.max(...modeSessions.filter(s => s.wpm).map(s => s.wpm || 0), 0) : undefined,
        best_challenge_score: gameStyle === 'challenge' ? Math.max(...modeSessions.filter(s => s.challenge_total_score).map(s => s.challenge_total_score || 0), 0) : undefined,
        first_played: modeSessions[modeSessions.length - 1]?.played_at || new Date().toISOString(),
        last_played: modeSessions[0]?.played_at || new Date().toISOString()
      };
    });

    // Build mode stats structure for frontend
    const modeStats = {
      echo: {
        practice: sessionStatsByMode['echo_practice'] || null,
        challenge: sessionStatsByMode['echo_challenge'] || null,
      },
      memory: {
        practice: sessionStatsByMode['memory_practice'] || null,
        challenge: sessionStatsByMode['memory_challenge'] || null,
      },
      typing: {
        practice: sessionStatsByMode['typing_practice'] || null,
        challenge: sessionStatsByMode['typing_challenge'] || null,
      }
    };

    const userStats: UserStats = {
      totalGames,
      totalWordsCorrect,
      totalWordsIncorrect,
      totalTimeSpent,
      overallAccuracy,
      bestStreak
    };



    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      },
      stats: userStats,
      modeStats,
      allSessions: sessions || [],
      personalBests: personalBests || []
    });

  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}