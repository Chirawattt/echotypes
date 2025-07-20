# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Dev server**: `npm run dev` (uses Turbopack for faster builds)
- **Build**: `npm run build`
- **Production**: `npm start`
- **Lint**: `npm run lint`

## Project Architecture

### Core Application Structure

This is an English vocabulary learning game built with Next.js 15 using the App Router. The application features multiple game modes for practicing English vocabulary with different CEFR difficulty levels (A1-C2).

### Key Technologies

- **Framework**: Next.js 15 with React 19
- **State Management**: Zustand for game state
- **Database**: Supabase (PostgreSQL)
- **Auth**: NextAuth.js with Auth0/Google providers
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Speech**: Web Speech API for text-to-speech
- **Sounds**: Custom audio system with Web Audio API

### Game Architecture

The application revolves around three main game modes:

1. **Echo Mode**: Listen and type what you hear
2. **Memory Mode**: Memorize words, then recall them 
3. **Typing Mode**: Fast-paced typing practice with WPM tracking

Each mode supports:
- **Practice Mode**: Relaxed learning with no time limits
- **Challenge Mode**: Competitive scoring with time pressure
- **DDA (Dynamic Difficulty Adjustment)**: Adaptive difficulty based on performance

### Route Structure

```
/                           # Homepage
/play                       # Game mode selection
/play/{modeId}              # Difficulty selection  
/play/{modeId}/{difficultyId}/pre-game   # Game setup
/play/{modeId}/{difficultyId}/game       # Actual gameplay
/play/{modeId}/dda          # DDA mode selection
/play/{modeId}/dda/play     # DDA gameplay
```

**Mode IDs**: `echo`, `memory`, `typing`
**Difficulty IDs**: `a1`, `a2`, `b1`, `b2`, `c1`, `c2`, `dda`

### State Management

The application uses a centralized Zustand store (`lib/stores/gameStore.ts`) that manages:

- Game status (countdown, playing, gameOver)
- Word lists and current word index
- Scoring system with streak tracking
- Lives and timer states
- Mode-specific statistics
- DDA performance tracking
- Challenge mode scoring

### Custom Hooks Architecture

The game logic is modularized into specialized hooks in the `hooks/` directory:

- `useGameLogic`: Main orchestrator hook
- `useGameModes`: Mode-specific behaviors (echo/memory/typing)
- `useGameEvents`: Input handling and word validation
- `useGameScore`: Scoring calculations for challenge modes
- `useGameTimers`: Timer management for different modes
- `useDDA`: Dynamic difficulty adjustment logic
- `useAudio`: Sound effects management
- `useSpeech`: Text-to-speech functionality
- `useNitroEnergy`: Energy system for typing challenge mode
- `useOverdriveSystem`: Heat level system for typing challenge mode

### Word Management

Words are now stored in Supabase database and fetched dynamically:
- Words table contains vocabulary organized by CEFR levels (A1-C2)
- Words include English text, type (noun/verb/etc.), and meanings
- API endpoint `/api/words` handles word fetching with level filtering
- DDA system (`lib/ddaWords.ts`) uses caching for performance
- `lib/wordsService.ts` provides service functions for database operations

### Scoring System

Two scoring approaches:
1. **Practice Mode**: Simple word count tracking
2. **Challenge Mode**: Complex scoring in `lib/scoring.ts` that factors in:
   - Time efficiency
   - Streak bonuses
   - Difficulty multipliers
   - Mode-specific bonuses

### Authentication & Data

- User authentication via NextAuth.js (`providers/AuthContext.tsx`)
- Score persistence to Supabase database
- Local storage for high scores and preferences
- API routes in `app/api/` for score submission and auth

### Component Organization

```
components/
├── game/           # Game-specific components
├── layout/         # Navigation and layout
└── ui/            # Reusable UI components (shadcn/ui based)
```

### Important Development Notes

- Game state is preserved across route navigation using Zustand
- Speech synthesis must be cancelled before starting new games
- Audio preloading is handled in custom audio hooks
- Mobile-specific virtual keyboard support for better UX
- The app supports both Thai and English text for multilingual users
- DDA system tracks performance independently of the main scoring
- Challenge mode uses completely different scoring logic than practice mode

### Database Schema

The app expects a Supabase database with score tracking tables. Check `database/schema.sql` for the required structure.

### Configuration Files

- TypeScript config uses path aliases (`@/*` points to root)
- ESLint extends Next.js core web vitals and TypeScript rules
- Next.js config disables React strict mode for game compatibility

### Testing Approach

Currently no automated tests are configured. Testing should focus on:
- Game logic accuracy across different modes
- Score calculation correctness
- DDA system behavior
- Cross-browser audio/speech compatibility

## Recent Development Session (2025-01-20)

### ✅ Completed Tasks

1. **Database Integration Complete**
   - Migrated all word data from local JSON files to Supabase database
   - Created `/api/words` endpoint for dynamic word fetching
   - Implemented word caching system for DDA compatibility
   - Removed `/lib/words/` directory (reduced bundle size significantly)

2. **Score System Fixes**
   - Fixed personal best scores displaying 0 instead of database values
   - Resolved cross-mode data contamination between game modes
   - Fixed cumulative data issues in database (words_correct, words_incorrect, time_spent)
   - Implemented proper isolation between practice and challenge modes
   - Enhanced best streak display to show highest across all styles per mode

3. **Time Selection Feature**
   - Successfully implemented time selection for typing practice mode (30s, 60s, 2m, 5m, unlimited)
   - Fixed bug where custom time selections (30s, 2m) were defaulting to 60s
   - Root cause was `initializeGame()` resetting `timeLeft` after custom time was set
   - Solution: Set custom time AFTER `initializeGame()` completes

4. **Game Flow Improvements**
   - Fixed double countdown issues by removing game state reset from globalCleanup
   - Added proper loading states before countdown to prevent timing issues
   - Fixed navigation sound issues when clicking back/home buttons
   - Implemented loading screen component for word loading phase

5. **Code Quality**
   - Resolved all critical ESLint errors across the codebase
   - Removed all debug logs related to time selection feature
   - Moved Word type interface to `/lib/types.ts` for better organization
   - Enhanced error handling and race condition prevention

### 🔧 Current System Status

- ✅ All game modes (Echo, Memory, Typing) working correctly
- ✅ Practice and Challenge modes fully functional
- ✅ DDA (Dynamic Difficulty Adjustment) system operational
- ✅ Database integration complete and stable
- ✅ Time selection for typing practice mode working
- ✅ Score tracking and personal bests accurate
- ✅ Mobile virtual keyboard support
- ✅ No critical bugs or ESLint errors

### 📋 Next Steps for Tomorrow

1. **User Experience Enhancements**
   - Consider adding sound effects for time selection
   - Implement haptic feedback for mobile devices
   - Add visual indicators for selected time in typing practice

2. **Performance Optimization**
   - Monitor database query performance under load
   - Consider implementing service worker for offline word caching
   - Optimize bundle size further if needed

3. **Feature Additions**
   - Add leaderboard functionality
   - Implement achievement system
   - Consider adding word definitions in game
   - Add export functionality for user progress

4. **Testing & Quality Assurance**
   - Test time selection on different devices/browsers
   - Verify database performance with multiple concurrent users
   - Cross-browser testing for audio/speech features
   - Mobile device testing for virtual keyboard

5. **Documentation**
   - Update API documentation for new endpoints
   - Create user manual for time selection feature
   - Document database schema changes

### 🐛 Known Issues

None currently - all major issues have been resolved.

### 🎯 Priority Focus Areas

1. **High**: Monitor system stability with database integration
2. **Medium**: User experience improvements and additional features
3. **Low**: Performance optimizations and advanced features