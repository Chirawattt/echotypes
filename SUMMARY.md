# EchoTypes Frontend — Project Summary (as of Aug 8, 2025)

A production-ready Next.js 15 + React 19 app for learning English vocabulary through game-based practice. The app uses Dynamic Difficulty Adjustment (DDA), Supabase for data/auth persistence, and a polished, mobile-friendly UI with animations.

## What you have right now

- Three playable modes: Echo, Memory, Typing.
- Both Practice and Challenge styles; Challenge has time/energy pressure and scoring.
- DDA everywhere: difficulty auto-adjusts in-session based on performance (levels A1–C2).
- Supabase-backed data model: Users, GameSessions (per-play logs), GameScores (personal bests), Leaderboard view.
- Authentication: NextAuth (Google) + registration check before gameplay.
- Robust scoring systems per mode, streaks, and combo/overdrive mechanics in Typing.
- Clean state management with Zustand and modular hooks per subsystem.
- End-to-end and unit testing setup (Playwright + Jest/RTL) and ESLint config.

## Tech stack

- Next.js 15 App Router, React 19, TypeScript
- Styling: Tailwind CSS v4, Framer Motion animations
- State: Zustand (single game store)
- Backend/data: Supabase (Postgres + RPC for random words)
- Auth: next-auth (Google), custom registration
- Tests: Jest + React Testing Library; Playwright for E2E

## Top-level structure

- `app/` — Pages, routing, API routes (App Router)
  - `page.tsx` Home: requires login; checks registration; routes to `/play`
  - `play/` Mode selection UI; pushes to `/play/{modeId}/dda`
  - `api/` Backend endpoints (serverless handlers)
    - `words/route.ts` Get random words via Supabase RPC `get_random_words`
    - `scores/route.ts` Submit sessions and upsert personal bests; fetch scores/sessions
    - `leaderboard/route.ts` Leaderboard by game mode/style
    - `profile/route.ts` Aggregated stats + personal bests
    - `health/route.ts` DB connectivity checks
    - `auth/` NextAuth + registration (Google provider)
- `components/`
  - `layout/header.tsx` Auth menu, back/home logic, global cleanup
  - `game/` Mode UIs (Echo/Memory/Typing), shared HUD, timers, effects, overlays, etc.
  - `game/GameModeRenderer.tsx` Delegates to mode-specific components
- `hooks/` Modular gameplay subsystems
  - `useGameLogic.ts` Orchestrator: words load, DDA, timers, scoring, DB submit, nitro/overdrive, session lifecycle
  - `useGameModes.ts` Mode-side-effects (Echo speech, Memory reveal/hide timing)
  - `useDDA.ts` Level transitions + word set swap; smooth state during transitions
  - `useNitroEnergy.ts` Typing Challenge energy bar (gain/decay; game over on depletion)
  - `useOverdriveSystem.ts` Heat-level difficulty escalation in Typing Challenge
  - Other helpers: audio, speech, timers, events, score utilities
- `lib/`
  - `auth.ts` NextAuth options (Google); Supabase writes on sign-in/redirect/session
  - `supabase.ts` Client bootstrap
  - `database.ts` Client-side helpers: submit scores, stats, leaderboard
  - `scoring.ts` All scoring math (Echo/Memory/Typing, streaks, multipliers, breakdown)
  - `ddaConfig.ts` Global DDA thresholds and bounds
  - `ddaWords.ts` DDA cache + session selection; C2 variety & history; preload
  - `words-new.ts`, `wordsService.ts` Fetch and shuffle words from API; DB-first
  - `memoryModeConfig.ts` Memory mode viewing time table and helpers
  - `difficultyHelpers.ts` Map level numbers -> CEFR keys
  - `stores/gameStore.ts` Single Zustand store for all game state + DDA logic
  - `types.ts`, `utils.ts` Shared types and utils
- `providers/AuthContext.tsx` Wraps `SessionProvider`, exposes `useAuth`
- `database/schema.sql` Supabase schema for Users, GameScores, GameSessions, views/policies
- `docs/` Detailed guides (app structure, modes, DDA, challenge system, dev guide)

## Core user flows

1) Auth and onboarding
- Home (`/`) requires NextAuth (Google). After login: redirect includes `loginTimestamp` for welcome toast.
- Calls `/api/auth/register` to verify the user set a display name; otherwise redirect to signup.

2) Mode selection and gameplay
- `/play` shows carousel of modes: Echo, Typing, Memory.
- Selecting a mode routes to DDA difficulty path (`/play/{modeId}/dda`), then starts a DDA-driven session.

3) Challenge vs Practice
- Practice focuses on learning: timers relaxed, WPM tracking (Typing), 2s reveal (Memory), unlimited listens (Echo).
- Challenge introduces pressure and scoring: streaks, time/energy constraints, DDA ramps difficulty.

## Gameplay systems

- Words pipeline
  - API `GET /api/words?level=a1..c2&limit` → Supabase RPC `get_random_words`
  - `wordsService` shuffles and trims -> `getGameSessionWords`
  - `ddaWords` caches by level and supplies new sessions on level change

- DDA (Dynamic Difficulty Adjustment)
  - Store tracks `performanceScore` and `currentDifficultyLevel` (1..6 A1–C2)
  - Correct/incorrect updates score; thresholds shift up/down; smooth transitions load new word sets
  - Memory Challenge changes reveal durations by level; Echo/Typing adapt difficulty via content pacing

- Scoring
  - Echo/Memory: base + time bonus × difficulty + streak; Echo adds first-listen bonus
  - Typing Challenge: base 100 + per-character, multiplied by combo (up to 5×)
  - Score breakdowns are produced for UI toasts/overlays

- Typing Challenge extras
  - Nitro energy: depletes over time; refills per correct word by length; mistake penalty; game over at 0
  - Overdrive: heat levels increase decay speed and visual intensity with performance

- Persistence and analytics
  - Every game writes a `GameSessions` row (true activity log)
  - `GameScores` stores personal bests per mode/style (score, streak, WPM, challenge score)
  - Leaderboards rank by `challenge_total_score` (challenge) or `score` (practice)
  - Profile aggregates sessions into user stats and mode/style stats

## API endpoints (App Router)

- `GET /api/words` → random words by level (Supabase RPC)
- `POST /api/scores` → save session + upsert personal best; requires auth + completed registration
- `GET /api/scores` → personal bests or sessions (type=sessions)
- `GET /api/leaderboard` → leaderboard for gameMode + gameStyle
- `GET /api/profile` → aggregated user stats + personal bests + sessions
- `GET /api/health` → DB connectivity/health checks
- `api/auth/...` → NextAuth handlers; `api/auth/register` for registration check

## Auth

- Google provider via NextAuth; server-side Supabase client used in callbacks
- On sign-in, ensures `Users` row exists; session decorator attaches app user id
- Redirect adds `loginTimestamp` query param for welcome toast on the client

## State and UI

- Zustand store centralizes all runtime game state, timers, scores, lives, streaks, DDA, and mode stats
- Mode UIs are isolated components; `GameModeRenderer` switches rendering and passes props
- `Header` manages navigation, cleanup, and auth menu
- Responsive, animated, mobile-optimized UX; custom virtual keyboard for mobile typing (component present)

## Data model (Supabase)

- `Users` — registered players; used by NextAuth and app profiles
- `GameSessions` — every playthrough, for accurate cumulative stats
- `GameScores` — personal bests per mode/style
- `public_leaderboard` view — stable ranking projection (per mode/style)
- RLS policies are permissive in schema.sql; ensure production-tight policies on your instance

## Tooling & quality

- Tests
  - Jest + RTL for unit/component; configured via `next/jest` with `jest.setup.js`
  - Playwright E2E: runs against `npm run dev`; projects for desktop and mobile
- Linting: ESLint (Next.js + TS flat config)
- Scripts (from `package.json`)
  - `dev`, `build`, `start`, `lint`
  - `test`, `test:watch`, `test:coverage`
  - `test:e2e`, `test:e2e:ui`, `test:all`

## Environment configuration

- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- NextAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`

## Notable design decisions

- DDA everywhere: unified difficulty progression simplifies UX and removes per-difficulty leaderboards
- Dual persistence: sessions for analytics + personal bests for fast lookups and UI
- Client hooks modularization: clear separation of responsibilities and testability
- Server-only usage of service role key in NextAuth callbacks; client uses anon key

## Gaps and next steps (observed)

 
- Confirm RLS policies on Supabase instance (schema shows permissive policies)
- Add MSW and unit tests around hooks and scoring math (scaffolding exists)
- Consider rate limit / validation hardening on API routes

---

Generated from the codebase and docs in this repository. For deep dives, see `docs/` (APP_STRUCTURE, GAME_MODES, DDA_DESIGN, CHALLENGE_SYSTEM, DEVELOPMENT_GUIDE).
