# Development Guide

This guide provides comprehensive information for developers working on the EchoTypes project.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18+ (recommended: v20+)
- **npm**: v9+ (comes with Node.js)
- **Git**: Latest version

### Installation
```bash
# Clone the repository
git clone https://github.com/Chirawattt/echotypes-frontend.git
cd echotypes-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### Development Commands
- **Dev server**: `npm run dev` (uses Turbopack for faster builds)
- **Build**: `npm run build`
- **Production**: `npm start`
- **Lint**: `npm run lint`
- **Type check**: `npx tsc --noEmit`

---

## 🏗️ Project Architecture

### Tech Stack
- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript 5+
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with Auth0/Google
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Speech**: Web Speech API
- **Audio**: Custom Web Audio API integration

### Directory Structure
```
echotypes-frontend/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── play/              # Game mode pages
│   │   └── [modeId]/      # Dynamic mode routing
│   │       └── dda/       # DDA-specific pages
│   └── profile/           # User profile pages
├── components/            # React components
│   ├── game/              # Game-specific components
│   │   └── modes/         # Individual game mode components
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── stores/            # Zustand stores
│   └── words/             # Vocabulary data
├── types/                 # TypeScript type definitions
├── docs/                  # Documentation
└── public/                # Static assets
```

---

## 🎮 Game System Architecture

### Core Game Loop
1. **Initialization**: Load words, reset state, start countdown
2. **Gameplay**: Present word, handle input, validate answer
3. **Progression**: Update score, advance to next word, check game over
4. **Completion**: Save score, show results, offer replay

### State Management (Zustand)
The game uses a centralized store with these main slices:

#### Game State
```typescript
interface GameState {
  // Core game state
  status: 'loading' | 'countdown' | 'playing' | 'gameOver';
  words: Word[];
  currentWordIndex: number;
  userInput: string;
  
  // Scoring and progress
  score: number;
  lives: number;
  streakCount: number;
  totalChallengeScore: number;
  
  // Timing and feedback
  timeLeft: number;
  isWrong: boolean;
  isCorrect: boolean;
  isTransitioning: boolean;
}
```

#### DDA State
```typescript
interface DdaState {
  currentDifficultyLevel: number; // 1-6 (A1-C2)
  performanceScore: number;       // Performance tracking
}
```

### Custom Hooks Architecture

#### useGameLogic
Central hook managing:
- Game initialization and state management
- Word progression and game flow
- Score submission and data persistence
- Home navigation and cleanup

#### useGameEvents
Handles user interactions:
- Input validation and processing
- Answer submission and feedback
- Mode-specific event handling

#### useGameScore
Manages scoring system:
- Challenge mode score calculation
- Streak tracking and bonuses
- Score breakdown display

#### useDDA
Dynamic Difficulty Adjustment:
- Performance monitoring
- Level adjustment logic
- Word selection based on difficulty

---

## 📊 Data Flow

### Game Session Flow
```
User starts game → useGameLogic initializes
                ↓
Load words from DDA system → Words displayed
                ↓
User input → useGameEvents processes
                ↓
Validation → useGameScore calculates points
                ↓
DDA update → useDDA adjusts difficulty
                ↓
Next word or Game Over → Save to database
```

### Component Communication
- **Props**: Parent to child data flow
- **Zustand Store**: Global state access
- **Custom Hooks**: Business logic encapsulation
- **Context**: Theme and auth state

---

## 🛠️ Development Patterns

### Component Structure
```typescript
// Standard component pattern
interface ComponentProps {
  // Props interface
}

export default function Component({ 
  prop1, 
  prop2 
}: ComponentProps) {
  // Hooks
  const storeValue = useGameStore(state => state.value);
  
  // Local state
  const [localState, setLocalState] = useState();
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // Event handlers
  const handleEvent = useCallback(() => {
    // Event logic
  }, [dependencies]);
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Custom Hook Pattern
```typescript
export function useCustomHook(params: HookParams) {
  // Store access
  const { value, setValue } = useGameStore();
  
  // Local state
  const [state, setState] = useState();
  
  // Computed values
  const computedValue = useMemo(() => {
    return expensiveCalculation(value);
  }, [value]);
  
  // Event handlers
  const handleAction = useCallback(() => {
    // Action logic
  }, [dependencies]);
  
  // Return interface
  return {
    state,
    computedValue,
    handleAction
  };
}
```

### Error Handling
```typescript
// Async operations with error handling
try {
  const result = await apiCall();
  handleSuccess(result);
} catch (error) {
  console.error('Operation failed:', error);
  handleError(error);
}
```

---

## 🔧 Configuration Files

### Next.js Config (`next.config.ts`)
```typescript
const nextConfig = {
  experimental: {
    turbo: {
      // Turbopack configuration
    }
  },
  // Other Next.js settings
};
```

### TypeScript Config (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    // Path mapping for imports
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Tailwind Config (`tailwind.config.js`)
```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      // Custom theme extensions
    }
  }
};
```

---

## 📡 API Integration

### Database Schema (Supabase)
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scores table  
CREATE TABLE scores (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  game_mode TEXT,
  game_style TEXT,
  score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Routes Structure
```
/api/
├── auth/                 # Authentication endpoints
├── scores/               # Score management
├── profile/              # User profile data
└── words/                # Vocabulary data
```

### API Route Pattern
```typescript
// app/api/example/route.ts
export async function GET(request: Request) {
  try {
    // Authentication check
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Business logic
    const data = await fetchData(session.user.id);
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

## 🧪 Testing Strategy

### Testing Stack
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Playwright
- **Type Safety**: TypeScript strict mode
- **Linting**: ESLint + Prettier

### Test File Structure
```
__tests__/
├── components/           # Component tests
├── hooks/               # Hook tests
├── utils/               # Utility function tests
└── integration/         # End-to-end tests
```

### Testing Patterns
```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import Component from '@/components/Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

---

## 🚀 Deployment

### Build Process
```bash
# Production build
npm run build

# Check build output
npm run start
```

### Environment Variables
```env
# Required for production
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# Supabase configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key

# Authentication providers
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Build succeeds without errors
- [ ] All tests passing
- [ ] Performance optimized
- [ ] Security headers configured

---

## 🔍 Debugging

### Development Tools
- **React DevTools**: Component inspection
- **Redux DevTools**: State debugging (works with Zustand)
- **Network Tab**: API request monitoring
- **Console**: Error tracking and logging

### Common Issues

#### Performance Issues
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Expensive render */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
```

#### Memory Leaks
```typescript
// Clean up effects
useEffect(() => {
  const timer = setInterval(() => {
    // Timer logic
  }, 1000);
  
  return () => {
    clearInterval(timer); // Cleanup
  };
}, []);
```

#### State Management
```typescript
// Avoid direct mutations
const updateScore = (newScore: number) => {
  // Wrong: mutating state
  // state.score = newScore;
  
  // Correct: creating new state
  setState(prev => ({ ...prev, score: newScore }));
};
```

---

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

### Tools
- [VS Code](https://code.visualstudio.com/) - Recommended editor
- [Git](https://git-scm.com/) - Version control
- [Node.js](https://nodejs.org/) - Runtime environment

### Project-Specific Guides
- [APP_STRUCTURE.md](./APP_STRUCTURE.md) - Application architecture
- [GAME_MODES.md](./GAME_MODES.md) - Game mechanics
- [CHALLENGE_SYSTEM.md](./CHALLENGE_SYSTEM.md) - Scoring and DDA
- [DDA_DESIGN.md](./DDA_DESIGN.md) - Difficulty adjustment details

This development guide provides the foundation for contributing to and maintaining the EchoTypes project. For specific implementation details, refer to the specialized documentation files.
