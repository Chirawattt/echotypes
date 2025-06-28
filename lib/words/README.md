# Words Module - New Modular Structure

## Why Change?

The original `words.ts` file became too large (6,083 lines) and difficult to maintain. This new structure splits vocabulary by difficulty levels for better:

- **Maintainability**: Each file focuses on one difficulty level
- **Performance**: Only load needed vocabulary levels
- **Collaboration**: Different people can work on different levels
- **Code Organization**: Cleaner separation of concerns

## New Structure

```
lib/
├── words/
│   ├── types.ts          # Shared Word interface
│   ├── a1.ts            # Beginner vocabulary
│   ├── a2.ts            # Elementary vocabulary  
│   ├── b1.ts            # Intermediate vocabulary
│   ├── b2.ts            # Upper-Intermediate vocabulary
│   ├── c1.ts            # Advanced vocabulary
│   ├── c2.ts            # Proficiency vocabulary
│   └── migration-template.ts # Helper for migration
├── words-new.ts         # New main module (temp)
└── words.ts            # Original file (to be replaced)
```

## Migration Steps

### 1. Copy Vocabulary Data

For each difficulty level, copy the words from your original `words.ts`:

**A1 Words (lines 7-908):**
```typescript
// Copy to lib/words/a1.ts
export const a1Words: Word[] = [
    // Paste all A1 words here
];
```

**A2 Words (lines 910-1780):**
```typescript
// Copy to lib/words/a2.ts  
export const a2Words: Word[] = [
    // Paste all A2 words here
];
```

Continue for B1, B2, C1, C2...

### 2. Update Import Statements

Replace the old import:
```typescript
// Old way
import { getGameSessionWords, Word } from '@/lib/words';
```

With the new import:
```typescript
// New way  
import { getGameSessionWords, Word } from '@/lib/words-new';
```

### 3. Test Everything Works

After migration, test all game modes to ensure vocabulary loading works correctly.

### 4. Clean Up

Once everything works:
1. Rename `words-new.ts` to `words.ts`
2. Delete the old `words.ts` file
3. Remove `migration-template.ts`

## Benefits of New Structure

1. **Smaller files**: Each file is ~200-1000 lines instead of 6000+
2. **Faster loading**: Only load needed vocabulary levels
3. **Better Git diffs**: Changes to one level don't affect others
4. **Easier maintenance**: Find and edit specific level vocabulary quickly
5. **Team collaboration**: Multiple people can work on different levels
6. **Type safety**: Same strong typing with TypeScript
7. **Same API**: All existing game code continues to work unchanged

## API Compatibility

The new structure maintains 100% API compatibility:

```typescript
// These all work exactly the same:
getWords('a1')              // Get A1 words
getWords('endless')         // Get all words combined
getGameSessionWords('b2')   // Get shuffled B2 words
getWordCount('c1')          // Get word count
getDifficultyInfo('a2')     // Get difficulty info
```

## Additional Features

The new structure also adds some helpful utilities:

```typescript
// Get word counts for all levels
getAllDifficulties()        // ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'endless']

// Get detailed info about a difficulty
getDifficultyInfo('a1')     // { difficulty: 'a1', wordCount: 900, isEndless: false }
```
