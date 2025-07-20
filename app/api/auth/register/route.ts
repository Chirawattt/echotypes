import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { displayName } = await req.json();

    // 2. Validate display name
    if (!displayName || displayName.trim().length < 2) {
      return NextResponse.json({ 
        error: 'Display name must be at least 2 characters long' 
      }, { status: 400 });
    }

    if (displayName.trim().length > 50) {
      return NextResponse.json({ 
        error: 'Display name must be less than 50 characters' 
      }, { status: 400 });
    }

    // 3. Check if user already has a display name (already registered)
    const { data: existingUser, error: fetchError } = await supabase
      .from('Users')
      .select('id, name')
      .eq('id', session.user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingUser?.name) {
      return NextResponse.json({ 
        error: 'User already registered' 
      }, { status: 409 });
    }

    // 4. Check if display name is already taken
    const { data: nameExists, error: nameError } = await supabase
      .from('Users')
      .select('id')
      .eq('name', displayName.trim())
      .single();

    if (nameExists) {
      return NextResponse.json({ 
        error: 'Display name is already taken' 
      }, { status: 409 });
    }

    if (nameError && nameError.code !== 'PGRST116') {
      throw nameError;
    }

    // 5. Update user with display name (user should already exist from NextAuth)
    const { error: updateError } = await supabase
      .from('Users')
      .update({
        name: displayName.trim(),
      })
      .eq('id', session.user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      message: 'User registered successfully',
      user: {
        id: session.user.id,
        name: displayName.trim(),
        email: session.user.email
      }
    });

  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}

// GET endpoint to check if user is registered
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ 
        registered: false, 
        authenticated: false 
      });
    }

    const { data: user, error } = await supabase
      .from('Users')
      .select('id, name, email, image, created_at')
      .eq('id', session.user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      return NextResponse.json({ 
        registered: false, 
        authenticated: true 
      });
    }

    if (error) throw error;

    return NextResponse.json({ 
      registered: !!user?.name, 
      authenticated: true,
      user 
    });

  } catch (error) {
    console.error('Error checking user registration:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}