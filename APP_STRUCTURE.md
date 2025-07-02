# EchoTypes Frontend - App Structure

## 📁 Application Directory Structure

```
app/
├── globals.css
├── layout.tsx
├── page.tsx                                  # หน้า Home links ไปที่ /play
│
└── play/                                     # โฟลเดอร์หลักสำหรับเกมทั้งหมด
    ├── page.tsx                              # หน้าเลือกโหมด (Mode Select) URL: /play
    │
    └── [modeId]/                             # Dynamic route สำหรับโหมดที่เลือก
        ├── page.tsx                          # หน้าเลือกความยาก (Difficulty Select) URL: /play/typing
        │
        └── [difficultyId]/                   # Dynamic route สำหรับความยากที่เลือก
            ├── pre-game/
            │   └── page.tsx                  # หน้า Pre-Game Screen URL: /play/typing/a1/pre-game
            │
            └── play/
                └── page.tsx                  # หน้าเล่นเกมจริง URL: /play/typing/a1/play
```

## 🎮 Game Modes (modeId)

- **`echo`** - Echo Mode: Listen and type what you hear
- **`typing`** - Typing Mode: Fast and accurate typing practice
- **`memory`** - Memory Mode: Memorize and recall vocabulary
- **`meaning-match`** - Meaning Match: Match definitions to words

## 📊 Difficulty Levels (difficultyId)

- **`a1`** - A1 Beginner
- **`a2`** - A2 Elementary
- **`b1`** - B1 Intermediate
- **`b2`** - B2 Upper-Intermediate
- **`c1`** - C1 Advanced
- **`c2`** - C2 Proficient
- **`endless`** - Endless Mode (All levels mixed)

## 🌐 Route Examples

### Complete User Flow:
```
/ (Home)
  ↓
/play (Choose game mode)
  ↓
/play/echo (Choose difficulty)
  ↓
/play/echo/a1/pre-game (Confirm settings & choose style)
  ↓
/play/echo/a1/play?style=challenge (Play the game)
```

### All Possible Routes:

**Home & Mode Selection:**
- `/` - Homepage
- `/play` - Game mode selection

**Difficulty Selection:**
- `/play/echo`
- `/play/typing`
- `/play/memory`
- `/play/meaning-match`

**Pre-Game Setup:**
- `/play/echo/a1/pre-game`
- `/play/echo/a2/pre-game`
- `/play/echo/b1/pre-game`
- `/play/echo/b2/pre-game`
- `/play/echo/c1/pre-game`
- `/play/echo/c2/pre-game`
- `/play/echo/endless/pre-game`
- ... (same pattern for typing, memory, meaning-match)

**Gameplay:**
- `/play/echo/a1/play?style=practice`
- `/play/echo/a1/play?style=challenge`
- ... (same pattern for all modes and difficulties)

## 🔧 Query Parameters

### Pre-Game to Play:
- `style=practice` - Practice mode (relaxed, no time limit)
- `style=challenge` - Challenge mode (timed, scored, competitive)

## 📝 Page Purposes

| Page | Purpose | Features |
|------|---------|----------|
| **Home** | Landing page | Game introduction, start button |
| **Mode Select** | Choose game type | Mode carousel, descriptions |
| **Difficulty** | Choose difficulty level | Level cards with descriptions and high scores |
| **Pre-Game** | Final confirmation | Mode/difficulty confirmation, how-to-play modal, style selection |
| **Play** | Actual gameplay | Game mechanics, scoring, streak system |

## 🎨 Design Patterns

- **Consistent Navigation**: Back buttons on all pages except home
- **Progressive Enhancement**: Each page builds upon previous selections
- **State Management**: Zustand for game state, localStorage for persistence
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Animation**: Framer Motion for smooth transitions and interactions

## 🗂️ Related Directories

```
components/
├── layout/
│   └── header.tsx                 # Main header component
├── ui/
│   └── button.tsx                 # Reusable button component
└── game/
    ├── StreakDisplay.tsx          # Streak counter with animations
    └── StreakCelebration.tsx      # Streak milestone celebrations

lib/
├── utils.ts                       # Utility functions
├── words.ts                       # Word data and utilities
└── stores/
    └── gameStore.ts              # Zustand game state management

public/
└── sounds/                        # Game audio files
    ├── completed.wav
    ├── correct.mp3
    ├── countdown.mp3
    ├── incorrect.mp3
    └── keypress.mp3
```

## 🚀 Development Notes

- All pages use Next.js 13+ App Router
- Dynamic routes handle multiple game modes and difficulties
- State persistence across navigation
- Responsive design with Tailwind CSS
- TypeScript for type safety
- Accessibility considerations throughout
