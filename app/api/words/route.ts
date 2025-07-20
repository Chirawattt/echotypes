import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level'); // e.g., 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'
    const limit = parseInt(searchParams.get('limit') || '20'); // Default 20 words per session


    // Validate level parameter
    if (!level || !['a1', 'a2', 'b1', 'b2', 'c1', 'c2'].includes(level.toLowerCase())) {
      return NextResponse.json({ 
        error: 'Invalid level. Must be one of: a1, a2, b1, b2, c1, c2' 
      }, { status: 400 });
    }

    // Fetch words from the database for the specified level
    const { data: words, error } = await supabase
      .from('Words')
      .select('id, word, type, meaning, level')
      .eq('level', level.toLowerCase())
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching words from database:', error);
      throw error;
    }

    if (!words || words.length === 0) {
      console.warn(`⚠️ No words found for level: ${level}`);
      return NextResponse.json({ 
        words: [],
        message: `No words found for level ${level}` 
      });
    }


    // Transform the data to match the expected Word interface
    const transformedWords = words.map(word => ({
      id: word.id,
      word: word.word,
      type: word.type,
      meaning: word.meaning,
      level: word.level
    }));

    return NextResponse.json({ 
      words: transformedWords,
      count: transformedWords.length,
      level: level.toLowerCase()
    });

  } catch (error) {
    console.error('❌ Error in words API:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch words from database'
    }, { status: 500 });
  }
}