import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test database connectivity with a simple count query
    const { error } = await supabase
      .from('Words')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database health check failed:', error);
      return NextResponse.json(
        { 
          status: 'unhealthy', 
          error: 'Database connection failed',
          timestamp: new Date().toISOString()
        }, 
        { status: 503 }
      );
    }

    // Additional checks - verify we can access the other tables
    const { error: gameScoresError } = await supabase
      .from('GameScores')
      .select('id')
      .limit(1);

    if (gameScoresError) {
      console.error('❌ GameScores table health check failed:', gameScoresError);
      return NextResponse.json(
        { 
          status: 'unhealthy', 
          error: 'GameScores table access failed',
          timestamp: new Date().toISOString()
        }, 
        { status: 503 }
      );
    }

    const { error: usersError } = await supabase
      .from('Users')
      .select('id')
      .limit(1);

    if (usersError) {
      console.error('❌ Users table health check failed:', usersError);
      return NextResponse.json(
        { 
          status: 'unhealthy', 
          error: 'Users table access failed',
          timestamp: new Date().toISOString()
        }, 
        { status: 503 }
      );
    }

    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      tables: ['Words', 'GameScores', 'Users'],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Health check error:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Unexpected error during health check',
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    );
  }
}