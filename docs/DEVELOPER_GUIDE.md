# EchoTypes Developer Guide

Merged and streamlined developer-focused content from DEVELOPMENT_GUIDE and relevant parts of docs/README.

## Setup

Prereqs: Node 18+ (20+ recommended), npm 9+, Git.

```powershell
# Clone and install
git clone https://github.com/Chirawattt/echotypes-frontend.git ; cd echotypes-frontend ; npm install

# Environment
copy .env.example .env.local
# Edit .env.local with your keys

# Run dev
npm run dev
```

Common scripts:
- dev: start dev server
- build: production build
- start: run production server
- lint: run ESLint
- test: run Jest tests; test:e2e for Playwright

## Tech Stack
- Next.js 15, React 19, TypeScript 5+
- Zustand, Tailwind CSS v4, Framer Motion
- Supabase (Postgres), NextAuth
- Web Speech API, Web Audio API

## App Architecture
- App Router with dynamic routes: /play/{modeId}/dda(/play)
- Global state: lib/stores/gameStore.ts
- Mode orchestration: hooks/useGameLogic.ts + mode hooks
- Words & DDA: lib/wordsService.ts, lib/ddaWords.ts, lib/difficultyHelpers.ts
- APIs: app/api/{words|scores|leaderboard|profile|health}

## Testing
- Unit/Integration: Jest + RTL
- E2E: Playwright

```powershell
npm run test ; npm run test:e2e
```

## Deployment
- Vercel or similar
- Required envs:
  - NEXTAUTH_SECRET, NEXTAUTH_URL
  - SUPABASE_URL, SUPABASE_ANON_KEY
  - OAuth provider keys as needed

## Notes
- Cancel speech before starting new games
- Persist minimal state only; avoid heavy localStorage writes
- Keep animations performant (avoid layout thrash)
- Prefer functional, well-typed helpers in lib/
