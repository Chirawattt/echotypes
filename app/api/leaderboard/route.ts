import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameMode = searchParams.get('gameMode');
    const gameStyle = searchParams.get('gameStyle');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate required parameters (no difficulty needed - DDA system)
    if (!gameMode || !gameStyle) {
      return NextResponse.json(
        { error: 'gameMode and gameStyle are required' },
        { status: 400 }
      );
    }

    // Validate enum values (removed difficulty validation)
    if (!['echo', 'memory', 'typing'].includes(gameMode) ||
        !['practice', 'challenge'].includes(gameStyle)) {
      return NextResponse.json(
        { error: 'Invalid game mode or style' },
        { status: 400 }
      );
    }

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    const leaderboard = await getLeaderboard(gameMode, gameStyle, limit);

    return NextResponse.json({
      leaderboard,
      filters: {
        gameMode,
        gameStyle,
        limit,
      },
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}