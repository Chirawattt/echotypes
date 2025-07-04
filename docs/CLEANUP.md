# Cleanup Utility

This utility provides comprehensive cleanup functions for the EchoTypes game to ensure no resources are left hanging when navigating away from the game.

## Features

- **Speech Synthesis Cleanup**: Cancels any ongoing speech synthesis
- **Audio Cleanup**: Stops all audio elements and resets their playback position
- **Timer Cleanup**: Clears tracked timeouts and intervals
- **Global Cleanup**: Comprehensive cleanup of all resources

## Usage

### Global Cleanup (Recommended)

```typescript
import { globalCleanup } from '@/lib/cleanup';

// Use when navigating away from the game or to home
const handleNavigateHome = () => {
    globalCleanup();
    router.push('/');
};
```

### Specific Cleanup Functions

```typescript
import { 
    stopAllAudio, 
    stopCountdownAudio,
    cancelAllTimers, 
    cancelSpeechSynthesis,
    registerAudioRef,
    unregisterAudioRef
} from '@/lib/cleanup';

// Stop only audio
stopAllAudio();

// Stop only countdown audio
stopCountdownAudio();

// Cancel only timers
cancelAllTimers();

// Cancel only speech synthesis
cancelSpeechSynthesis();

// Register audio refs for cleanup (in useEffect)
registerAudioRef(countdownAudioRef);
registerAudioRef(keypressAudioRef);

// Unregister audio refs (in cleanup function)
unregisterAudioRef(countdownAudioRef);
unregisterAudioRef(keypressAudioRef);
```

### Tracked Timers (For Better Memory Management)

```typescript
import { 
    trackTimeout, 
    trackInterval, 
    clearTrackedTimeout, 
    clearTrackedInterval 
} from '@/lib/cleanup';

// Use these instead of regular setTimeout/setInterval
const timeoutId = trackTimeout(() => {
    console.log('Timeout executed');
}, 1000);

const intervalId = trackInterval(() => {
    console.log('Interval executed');
}, 1000);

// Clear individual tracked timers
clearTrackedTimeout(timeoutId);
clearTrackedInterval(intervalId);
```

## Implementation Details

### Current Implementation

1. **Header Component**: Calls `globalCleanup()` when clicking EchoTypes logo
2. **Game Page**: 
   - Calls `globalCleanup()` on component unmount and when going back
   - Registers all audio refs for cleanup on mount
   - Unregisters audio refs on unmount
3. **EchoMode Component**: Calls `cancelSpeechSynthesis()` on component unmount

### What Gets Cleaned Up

- ✅ Speech synthesis cancellation
- ✅ Audio element stopping and reset (including countdown audio)
- ✅ Specific countdown audio stopping
- ✅ Registered audio refs (countdownAudioRef, keypressAudioRef, etc.)
- ✅ Tracked timeouts and intervals
- ✅ Recent untracked timers (last 100 IDs)
- ✅ Animation frames
- ✅ Component-specific cleanup

### Safety Features

- Client-side only execution (checks for `window` object)
- Graceful error handling
- Limited scope cleanup to prevent over-clearing
- Tracked timer management for better control

## Best Practices

1. **Always call cleanup before navigation**: Especially when leaving the game
2. **Use tracked timers for new code**: This provides better memory management
3. **Component-specific cleanup**: Each component should handle its own cleanup in `useEffect` cleanup functions
4. **Test thoroughly**: Ensure cleanup doesn't interfere with normal game operation

## Future Improvements

- Add cleanup for WebSocket connections if added
- Add cleanup for video elements if added
- Add cleanup for service workers if added
- Add more granular cleanup options
