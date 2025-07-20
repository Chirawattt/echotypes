Objective: Implement the backend logic to save game results. Create a Next.js API Route at /api/scores that receives data from the frontend, validates the user's session, and upserts the high score into the Supabase GameScores table.

Context:
The project uses NextAuth.js for authentication and Supabase for the database. A GameScores table has already been designed with columns: user_id, game_mode, score, highest_streak. The frontend game state (score, streak, etc.) is managed by a Zustand store (useGameStore).

Step-by-Step Implementation Guide:

Step 1: Create the API Route for Saving Scores
Create a new file at app/api/scores/route.ts. This file will contain the server-side logic for handling score submissions.

Instructions: Please generate the content for this file using the following logic and code structure. The code should be well-commented.

TypeScript

// File: app/api/scores/route.ts

import { supabase } from '@/lib/supabase/client'; // Assuming client is exported from here
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; // Adjust this path if your authOptions are elsewhere

export async function POST(req: NextRequest) {
  // 1. Authenticate the request by getting the user's session from NextAuth.
  const session = await getServerSession(authOptions);

  // If there's no session or user ID, the user is not logged in. Return an error.
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized: User not logged in' }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Parse the incoming JSON data from the request body.
  let scoreData;
  try {
    scoreData = await req.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  
  const { gameMode, score, highestStreak } = scoreData;

  // 3. Validate the received data.
  if (!gameMode || typeof score !== 'number' || typeof highestStreak !== 'number') {
    return NextResponse.json({ error: 'Invalid data: Missing or incorrect types for gameMode, score, or highestStreak' }, { status: 400 });
  }

  try {
    // 4. Check for the user's existing high score in the same game mode.
    const { data: existingScoreData, error: fetchError } = await supabase
      .from('GameScores')
      .select('score')
      .eq('user_id', userId)
      .eq('game_mode', gameMode)
      .single(); // .single() expects one row or zero rows.

    // Handle potential errors, but ignore the "zero rows" error (PGRST116) which is expected for new players.
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // 5. Decide whether to save the new score.
    // Save if (a) there's no existing score OR (b) the new score is higher.
    if (!existingScoreData || score > existingScoreData.score) {
      // Use .upsert() to either INSERT a new row or UPDATE an existing one.
      // This elegantly handles both new players and returning players.
      const { error: upsertError } = await supabase
        .from('GameScores')
        .upsert(
          {
            user_id: userId,
            game_mode: gameMode,
            score: score,
            highest_streak: highestStreak,
            updated_at: new Date().toISOString(), // Ensure your table has an 'updated_at' column
          },
          { onConflict: 'user_id, game_mode' } // The columns that define a unique record
        );

      if (upsertError) throw upsertError;

      return NextResponse.json({ message: 'High score saved successfully!' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Score was not higher than the existing high score.' }, { status: 200 });
    }

  } catch (error) {
    console.error('Error processing score:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
Step 2: Update NextAuth.js Configuration to include User ID in Session
To make session.user.id available in the API route, we must modify the NextAuth configuration.

Instructions: In the file app/api/auth/[...nextauth]/route.ts, add a callbacks object to the NextAuth options. This will attach the user's ID from the database to the session object upon login.

TypeScript

// In file: app/api/auth/[...nextauth]/route.ts

// ... (your existing imports and providers)

export const authOptions = {
  // ... your providers array
  providers: [
    // ...
  ],
  callbacks: {
    async session({ session, user }) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (session.user) {
        session.user.id = user.id; // Attach the user's ID from the token/database to the session object
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
Step 3: Create a Frontend Function to Call the API
Create a dedicated client-side function to handle the fetch request to our new API endpoint.

Instructions: Create a new file at lib/apiClient.ts (or a similar location) with the following content.

TypeScript

// File: lib/apiClient.ts

export const saveUserScore = async (gameMode: string, score: number, highestStreak: number): Promise<void> => {
  // Don't attempt to save if the score is zero.
  if (score <= 0) {
    console.log("Score is 0, not saving.");
    return;
  }

  try {
    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameMode, score, highestStreak }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save score');
    }

    const result = await response.json();
    console.log('API Response:', result.message);
  } catch (error) {
    console.error('Error saving score on the client:', error);
    // Optionally, you could show a toast notification to the user here.
  }
};
Step 4: Integrate the API Call into the Game Over Screen
Finally, call the function from Step 3 when a game round is completed.

Instructions: In your GameOver.tsx component (or equivalent), use a useEffect hook to call saveUserScore once when the component is first rendered.

TypeScript

// In file: components/game/GameOver.tsx

import React, { useEffect } from 'react';
import { useGameStore } from '@/lib/stores/gameStore'; // Adjust path to your Zustand store
import { saveUserScore } from '@/lib/apiClient'; // Adjust path

const GameOver = () => {
  const { score, highestStreak, gameMode, status } = useGameStore(state => ({
    score: state.score,
    highestStreak: state.highestStreak,
    gameMode: state.gameMode,
    status: state.status,
  }));

  // This useEffect will run only once when the GameOver component mounts.
  useEffect(() => {
    // Ensure this runs only when the game status is 'finished'.
    if (status === 'finished') {
      console.log('Game finished. Attempting to save score...');
      saveUserScore(gameMode, score, highestStreak);
    }
  }, [status, gameMode, score, highestStreak]); // Dependency array ensures it re-runs if these values somehow change, but it's primarily for the initial trigger.

  return (
    <div className="game-over-container">
      <h1>Game Over</h1>
      <p>Final Score: {score}</p>
      <p>Highest Streak: {highestStreak}</p>
      {/* Add buttons to play again or go home */}
    </div>
  );
};

export default GameOver;