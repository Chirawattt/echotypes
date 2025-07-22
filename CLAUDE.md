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

## Recent Development Session (2025-01-21)

### ✅ Completed Tasks

1. **UI/UX Redesign Complete**
   - ✅ **Redesigned pre-game page** with comprehensive game mode information
     - Added mode-specific features, tips, and how-to-play instructions
     - Implemented game style selection (Practice vs Challenge modes)  
     - Added time selection modal for typing practice mode
     - Applied modern glass-morphism design with smooth animations
   
   - ✅ **Redesigned countdown page** 
     - Enhanced countdown animation with multiple pulsing rings
     - Added particle effects and improved visual hierarchy
     - Removed excessive card containers for cleaner design
     - Applied consistent 'Playpen Sans Thai' typography
   
   - ✅ **Redesigned gameplay page**
     - Enhanced with modern glass-morphism containers and animations
     - Improved animated backgrounds with multiple gradient orbs
     - Removed card containers for cleaner appearance
     - Updated component structure for better maintainability

2. **Code Structure Improvements**
   - ✅ **Directory restructuring**: Created unified structure supporting both DDA and regular difficulties
   - ✅ **Component cleanup**: Fixed routing conflicts and import issues
     - Resolved `FaGear` to `FaCog` import errors across multiple components
     - Deleted conflicting `dda.tsx` file that was causing routing issues
   
3. **Localization Updates**
   - ✅ **Thai localization for DDA pre-game page**: All UI text converted to Thai
   - ✅ **Thai localization for ModeSelectPage**: Complete translation including:
     - Mode names: Echo Mode → โหมดเสียงสะท้อน, Typing Mode → โหมดพิมพ์, Memory Mode → โหมดความจำ
     - All features, descriptions, and UI labels translated to Thai
     - Game information sections fully localized
   
4. **Design Philosophy Adjustment**
   - ✅ **Removed excessive card containers**: Cleaned up countdown and gameplay pages
     - Eliminated glass-morphism cards that were cluttering the design
     - Maintained beautiful animations directly on gradient backgrounds
     - Improved visual hierarchy and user experience



### 🔧 Current System Status

- ✅ All game modes (Echo, Memory, Typing) working correctly
- ✅ Practice and Challenge modes fully functional  
- ✅ DDA (Dynamic Difficulty Adjustment) system operational
- ✅ Modern UI/UX redesign completed with Thai localization
- ✅ Time selection for typing practice mode working
- ✅ Score tracking and personal bests accurate
- ✅ Mobile virtual keyboard support
- ✅ Clean codebase with resolved import/routing issues
- ✅ Simplified design without excessive card containers

### 📋 Next Steps for Tomorrow (2025-01-22)

1. **🔥 High Priority - Complete Routing Restructure**
   - ✅ **COMPLETED BY USER**: Remove `[difficultyId]` routing structure entirely
   - Update all routing references to use simplified `/play/[modeId]` structure
   - Update ModeSelectPage navigation to point directly to `/play/{modeId}` instead of `/play/{modeId}/dda`
   - Test all navigation flows after restructuring

2. **🎯 Medium Priority - Remaining UI Enhancements** 
   - **Add level change notification (A1-C2)** with smooth animation
     - Create notification component that appears at bottom when DDA adjusts difficulty
     - Implement smooth slide-in/slide-out animations
     - Display current level changes (A1→A2, B1→B2, etc.)
   
   - **Add smooth number animation for challenge score**
     - Replace instant score updates with smooth number transitions
     - Implement spring animations or counting animations
     - Ensure performance is maintained (avoid lag)
   
   - **Block GameInput after submit** to prevent spam
     - Add temporary disabled state after form submission
     - Prevent multiple rapid submissions
     - Re-enable after transition completes

3. **🎮 Game Mode Specific Enhancements**
   - **Typing Challenge**: Add points increase/decrease notifications
     - Show +/- point changes when user completes words
     - Display brief notification showing score changes
   
   - **Memory Challenge**: Add display time notifications
     - Show countdown timer for word display phase
     - Persistent display (not disappearing) showing remaining view time

4. **🏆 Future Features** (Low Priority)
   - Implement Leaderboard system
   - Code optimization and refactoring
   - Testing and CI/CD setup
   - Final deployment preparation

### 🐛 Known Issues

None currently - all major design and routing issues resolved.

### 🎯 Current Focus

**Primary**: Complete routing simplification and implement remaining medium-priority UI enhancements to finalize the user experience before moving to advanced features like leaderboards.


### Session Summary (2025-01-21)

**Major Accomplishments:**
- ✅ Complete UI/UX redesign with modern glass-morphism aesthetics
- ✅ Full Thai localization for user-facing content
- ✅ Cleaned up routing conflicts and import issues  
- ✅ Simplified design by removing excessive card containers
- ✅ Identified and started routing restructure for DDA-only approach

**Key Design Decisions:**
- Prioritized clean, minimalist design over heavy glass-morphism cards
- Implemented consistent Thai localization across all game modes
- Simplified routing structure since only DDA is being used

**Tomorrow's Focus:**
- Complete routing restructure (remove [difficultyId] entirely)
- Implement level change notifications with smooth animations
- Add remaining UI enhancements for better user experience

### another requirement
- also re-design a pre-game page
- add more information about how to play the game in each mode.
- also redesign a countdown page too.
- also a gameplaypage too.
- i want to delete dda directory it's not necessary also rename a DdaGamePlayPage to GamePlayPage
- about gameplaypage i want a notification that user was level changed up or down at bottom of Level (A1,A2,A3,B1,B2,C1) so appear and diappear smoothly.
- about the challenge score i want to add the animation or something that change the number smoothly not the wrap one but not add too much it will be lagging.
- about GameInput i want after user submit answer then suddenly block it so the users can't spam the answer anyways.
- about Typing Challenge mode i want a text or something that tell the user how many points has increase or decrease after submit.
- about Memory Challenge mode which will decrease display words time so i want some text that notify user how many time will display the words. (display all time not disappear)

- implemeted Leaderboard.
- Optimize code | Refactor | Clean up code
- Do a testing
- CI/CD
- Deploy
- End Project.