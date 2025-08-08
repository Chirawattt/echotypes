# EchoTypes Architecture & Routing

This guide explains the app structure, routing, and key UI patterns. It merges and updates previous APP_STRUCTURE and APP_FEATURE docs, reflecting the DDA-only flow (no difficultyId routes).

## Application Directory

```
app/
├── globals.css
├── layout.tsx
├── page.tsx                 # Home → links to /play
│
└── play/                    # All game modes
    ├── page.tsx             # Mode Select (/play)
    │
    └── [modeId]/            # echo | typing | memory
        └── dda/             # Dynamic Difficulty Adjustment flow
            ├── page.tsx     # Pre-game/setup (/play/{modeId}/dda)
            └── play/
                └── page.tsx # Gameplay (/play/{modeId}/dda/play)
```

Mode IDs: echo, typing, memory

## Route Flows

### Typical flow
```
/ (Home)
  ↓
/play (Choose mode)
  ↓
/play/echo (Mode landing)
  ↓
/play/echo/dda (Configure style, tips)
  ↓
/play/echo/dda/play?style=challenge (Play)
```

### All routes
- `/` — Home
- `/play` — Mode selection
- `/play/{modeId}` — Mode landing
- `/play/{modeId}/dda` — Pre-game/setup
- `/play/{modeId}/dda/play?style=practice|challenge` — Gameplay

Query parameters:
- `style=practice` — Relaxed, no timered scoring
- `style=challenge` — Timed/scored competitive play

## Pages and Purpose

| Page                | Purpose                         | Highlights |
|---------------------|---------------------------------|------------|
| Home                | Landing                         | Start CTA, brief intro |
| Mode Select         | Choose game mode                | Carousel, descriptions |
| Mode (DDA)          | Configure and learn             | DDA info, personal bests, how-to-play |
| Play                | Core gameplay                   | Timers, scoring, streaks, effects |

## Design Patterns

- Consistent navigation with back/home
- Progressive enhancement across pages
- State with Zustand; persistence via localStorage
- Responsive, mobile-first; animations with Framer Motion

## Related Directories

```
components/
├── layout/
│   └── header.tsx
├── ui/
│   └── button.tsx
└── game/
    ├── StreakDisplay.tsx
    └── ... (mode UIs and effects)

lib/
├── utils.ts
├── wordsService.ts
├── ddaWords.ts
└── stores/
    └── gameStore.ts

public/
└── sounds/
```

## Notes

- Uses Next.js App Router with dynamic routes
- DDA replaces manual difficulty selection; CEFR levels are handled automatically
- Accessibility and performance considered across components
