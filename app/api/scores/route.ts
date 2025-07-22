import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { ScoreSubmission } from '@/lib/types';
import { GameScoreData } from '@/lib/database';
import type { Session } from 'next-auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. Verify user has completed registration (has display name)
    const { data: existingUser, error: userFetchError } = await supabase
      .from('Users')
      .select('id, name')
      .eq('id', userId)
      .single();

    if (userFetchError && userFetchError.code === 'PGRST116') {
      // User doesn't exist - this shouldn't happen with NextAuth adapter
      return NextResponse.json({ 
        error: 'User not found. Please sign in again.' 
      }, { status: 403 });
    }

    if (userFetchError) {
      throw userFetchError;
    }

    if (!existingUser?.name) {
      // User exists but hasn't completed registration (no display name)
      return NextResponse.json({ 
        error: 'Registration not complete. Please set your display name first.' 
      }, { status: 403 });
    }

    // 3. Validate and extract data
    const rawData: GameScoreData = await req.json();
    
    // Map old field names to new field names for backwards compatibility
    const data: ScoreSubmission = {
      gameMode: rawData.gameMode,
      gameStyle: rawData.gameStyle,
      score: rawData.score,
      streak: rawData.highestStreak, // Map highestStreak -> streak
      wordsCorrect: rawData.wordsCorrect,
      wordsIncorrect: rawData.wordsIncorrect,
      wpm: rawData.wpm,
      timeSpentSeconds: rawData.timeSpentSeconds,
      challengeTotalScore: rawData.challengeTotalScore,
    };
  
    
    // Validate required fields
    if (!data.gameMode || !data.gameStyle || 
        typeof data.score !== 'number' || typeof data.streak !== 'number' ||
        typeof data.wordsCorrect !== 'number' || typeof data.wordsIncorrect !== 'number' ||
        typeof data.timeSpentSeconds !== 'number') {
      return NextResponse.json({ error: 'Invalid or missing required data' }, { status: 400 });
    }

    // Validate enum values
    if (!['echo', 'memory', 'typing'].includes(data.gameMode) ||
        !['practice', 'challenge'].includes(data.gameStyle)) {
      return NextResponse.json({ error: 'Invalid game mode or style' }, { status: 400 });
    }

    // 4. Store individual game session (ALWAYS store every game played)
    const sessionData = {
      user_id: userId,
      game_mode: data.gameMode,
      game_style: data.gameStyle,
      score: data.score,
      streak: data.streak,
      words_correct: data.wordsCorrect,
      words_incorrect: data.wordsIncorrect,
      time_spent_seconds: data.timeSpentSeconds,
      ...(data.wpm && { wpm: data.wpm }),
      ...(data.challengeTotalScore && { challenge_total_score: data.challengeTotalScore }),
    };

    const { error: sessionError } = await supabase
      .from('GameSessions')
      .insert(sessionData);

    if (sessionError) {
      console.error('Error saving game session:', sessionError);
      throw sessionError;
    }

    // 5. Check existing personal best for this mode/style combination
    const { data: existingScore, error: fetchError } = await supabase
      .from('GameScores')
      .select('*')
      .eq('user_id', userId)
      .eq('game_mode', data.gameMode)
      .eq('game_style', data.gameStyle)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      throw fetchError;
    }

    // 6. Determine if this is a new personal best
    const isNewHighScore = !existingScore || data.score > existingScore.score;
    const isBetterStreak = !existingScore || data.streak > existingScore.highest_streak;
    const isBetterWpm = data.wpm && (!existingScore?.wpm || data.wpm > existingScore.wpm);
    const isBetterChallengeScore = data.challengeTotalScore && 
      (!existingScore?.challenge_total_score || data.challengeTotalScore > existingScore.challenge_total_score);

    // 7. Update personal bests ONLY if they were actually beaten
    if (isNewHighScore || isBetterStreak || isBetterWpm || isBetterChallengeScore) {
      const personalBestData = {
        user_id: userId,
        game_mode: data.gameMode,
        game_style: data.gameStyle,
        score: Math.max(data.score, existingScore?.score || 0),
        highest_streak: Math.max(data.streak, existingScore?.highest_streak || 0),
        // For GameScores, we keep the LAST session's basic stats (for compatibility)
        words_correct: data.wordsCorrect,
        words_incorrect: data.wordsIncorrect,
        time_spent_seconds: data.timeSpentSeconds,
        ...(data.wpm && { wpm: Math.max(data.wpm, existingScore?.wpm || 0) }),
        ...(data.challengeTotalScore && { 
          challenge_total_score: Math.max(data.challengeTotalScore, existingScore?.challenge_total_score || 0)
        }),
      };

      const { error: upsertError } = await supabase
        .from('GameScores')
        .upsert(personalBestData, { 
          onConflict: 'user_id,game_mode,game_style'
        });

      if (upsertError) throw upsertError;
    }

    // 8. Return appropriate response
    return NextResponse.json({ 
      message: isNewHighScore || isBetterStreak || isBetterWpm || isBetterChallengeScore 
        ? 'New personal best achieved!' 
        : 'Game session saved successfully!',
      isNewHighScore,
      isBetterStreak,
      isBetterWpm: isBetterWpm || false,
      isBetterChallengeScore: isBetterChallengeScore || false,
      sessionSaved: true
    });

  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET endpoint for retrieving user scores and sessions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const gameMode = searchParams.get('gameMode');
    const gameStyle = searchParams.get('gameStyle');
    const dataType = searchParams.get('type') || 'scores'; // 'scores' or 'sessions'

    if (dataType === 'sessions') {
      // Return individual game sessions
      let sessionQuery = supabase
        .from('GameSessions')
        .select('*')
        .eq('user_id', userId);

      if (gameMode) sessionQuery = sessionQuery.eq('game_mode', gameMode);
      if (gameStyle) sessionQuery = sessionQuery.eq('game_style', gameStyle);

      const { data: sessions, error: sessionError } = await sessionQuery
        .order('played_at', { ascending: false });

      if (sessionError) throw sessionError;

      return NextResponse.json({ 
        success: true,
        sessions: sessions || []
      });
    } else {
      // Return personal best scores (legacy support)
      let scoreQuery = supabase
        .from('GameScores')
        .select('*')
        .eq('user_id', userId);

      if (gameMode) scoreQuery = scoreQuery.eq('game_mode', gameMode);
      if (gameStyle) scoreQuery = scoreQuery.eq('game_style', gameStyle);

      const { data: scores, error: scoreError } = await scoreQuery
        .order('score', { ascending: false });

      if (scoreError) throw scoreError;

      return NextResponse.json({ 
        success: true,
        scores: scores || []
      });
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}