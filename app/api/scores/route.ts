import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';

interface GameScoreData {
  gameMode: 'echo' | 'memory' | 'typing';
  gameStyle: 'practice' | 'challenge';
  score: number;
  highestStreak: number;
  wordsCorrect: number;
  wordsIncorrect: number;
  wpm?: number; // Only for typing mode
  timeSpentSeconds: number;
  challengeTotalScore?: number; // Only for challenge mode
}

export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
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
    const data: GameScoreData = await req.json();
  
    
    // Validate required fields
    if (!data.gameMode || !data.gameStyle || 
        typeof data.score !== 'number' || typeof data.highestStreak !== 'number' ||
        typeof data.wordsCorrect !== 'number' || typeof data.wordsIncorrect !== 'number' ||
        typeof data.timeSpentSeconds !== 'number') {
      return NextResponse.json({ error: 'Invalid or missing required data' }, { status: 400 });
    }

    // Validate enum values
    if (!['echo', 'memory', 'typing'].includes(data.gameMode) ||
        !['practice', 'challenge'].includes(data.gameStyle)) {
      return NextResponse.json({ error: 'Invalid game mode or style' }, { status: 400 });
    }

    // 4. Check existing score for this specific combination
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

    // 5. Determine if this is a new high score
    const isNewHighScore = !existingScore || data.score > existingScore.score;
    const isBetterStreak = !existingScore || data.highestStreak > existingScore.highest_streak;
    
    // 6. Always store current game's actual performance data
    // Each game style should track its own performance independently
    
    const scoreData = {
      user_id: userId,
      game_mode: data.gameMode,
      game_style: data.gameStyle,
      score: Math.max(data.score, existingScore?.score || 0),
      highest_streak: Math.max(data.highestStreak, existingScore?.highest_streak || 0),
      words_correct: data.wordsCorrect, // Always use current game's actual values
      words_incorrect: data.wordsIncorrect, // Always use current game's actual values  
      time_spent_seconds: data.timeSpentSeconds, // Always use current game's actual time
      ...(data.wpm && { wpm: Math.max(data.wpm, existingScore?.wpm || 0) }),
      ...(data.challengeTotalScore && { 
        challenge_total_score: Math.max(data.challengeTotalScore, existingScore?.challenge_total_score || 0)
      }),
    };

    // Debug log final score data before database save
    // console.log('💾 API DEBUG: Final score data for database:', {
    //   timestamp: new Date().toISOString(),
    //   userId,
    //   gameMode: data.gameMode,
    //   gameStyle: data.gameStyle,
    //   existingScore: existingScore ? {
    //     score: existingScore.score,
    //     highest_streak: existingScore.highest_streak,
    //     words_correct: existingScore.words_correct,
    //     words_incorrect: existingScore.words_incorrect
    //   } : null,
    //   finalScoreData: JSON.stringify(scoreData, null, 2),
    //   decisions: {
    //     isNewHighScore,
    //     isBetterStreak,
    //     alwaysUpdateGameData: true // Always update words_correct, words_incorrect, time_spent_seconds
    //   }
    // });

    // 7. Save to database
    const { error: upsertError } = await supabase
      .from('GameScores')
      .upsert(scoreData, { 
        onConflict: 'user_id,game_mode,game_style'
      });

    if (upsertError) throw upsertError;

    // 8. Return appropriate response
    if (isNewHighScore || isBetterStreak) {
      return NextResponse.json({ 
        message: 'New record saved!',
        isNewHighScore,
        isBetterStreak,
        savedScore: scoreData
      });
    }

    return NextResponse.json({ 
      message: 'Game completed and stats updated.',
      isNewHighScore: false,
      isBetterStreak: false
    });

  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET endpoint for retrieving user scores
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const gameMode = searchParams.get('gameMode');
    const gameStyle = searchParams.get('gameStyle');

    let query = supabase
      .from('GameScores')
      .select('*')
      .eq('user_id', userId);

    if (gameMode) query = query.eq('game_mode', gameMode);
    if (gameStyle) query = query.eq('game_style', gameStyle);

    const { data, error } = await query.order('score', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ scores: data });

  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}