# Challenge System & Scoring Guide

This document covers the comprehensive Challenge Mode system, scoring mechanics, and all related features across EchoTypes game modes.

## 🏆 Challenge Mode Overview

Challenge Mode transforms EchoTypes from a casual learning tool into an engaging competitive experience with:

- **Time Pressure**: Limited time to answer each question
- **Scoring System**: Points-based gameplay with multipliers and bonuses
- **Dynamic Difficulty**: AI-powered adjustment based on performance
- **Streak Mechanics**: Consecutive correct answers multiply rewards
- **Leaderboards**: Global and personal achievement tracking

---

## 📊 Universal Scoring System

All Challenge modes use a consistent scoring formula with mode-specific variations.

### Core Scoring Formula
```
Final Score = (Base Score + Speed Bonus) × Difficulty Multiplier + Streak Bonus
```

### Component Breakdown

#### 1. Base Score
- **Standard**: 100 points per correct answer
- **Consistency**: Same across all modes for fair comparison
- **Foundation**: The minimum guaranteed points for any correct answer

#### 2. Speed Bonus (0-50 points)
Calculated based on response time relative to maximum allowed time:

```javascript
const speedBonus = Math.floor(50 * (remainingTime / maxTime));

// Examples for 5-second timer:
// Answer in 1 second: 40 speed bonus points
// Answer in 3 seconds: 20 speed bonus points  
// Answer in 5 seconds: 0 speed bonus points
```

#### 3. Difficulty Multiplier
Based on current DDA level (CEFR equivalent):

| DDA Level | CEFR | Multiplier | Description |
|-----------|------|------------|-------------|
| 1 | A1 | 1.0x | Beginner |
| 2 | A2 | 1.2x | Elementary |
| 3 | B1 | 1.4x | Intermediate |
| 4 | B2 | 1.6x | Upper-Intermediate |
| 5 | C1 | 1.8x | Advanced |
| 6 | C2 | 2.0x | Proficient |

#### 4. Streak Bonus
Consecutive correct answers provide escalating bonuses:

```javascript
const streakBonus = streakCount * 25;

// Examples:
// 5 streak: +125 bonus points
// 10 streak: +250 bonus points
// 20 streak: +500 bonus points
```

### Example Score Calculation

**Scenario**: B1 level (1.4x), answered in 2 seconds (out of 5), 7 streak
```
Base Score: 100
Speed Bonus: 30 (60% of max 50)
Difficulty Multiplier: 1.4x
Streak Bonus: 175 (7 × 25)

Final Score = (100 + 30) × 1.4 + 175 = 182 + 175 = 357 points
```

---

## 🎯 Mode-Specific Features

### Echo Mode Challenge
**Theme**: "Listen Once, Answer Fast"

#### Special Rules
- **One Listen**: Can only play audio once per word
- **5-Second Timer**: Starts after audio finishes
- **Audio Dependency**: Must listen before timer starts

#### Unique Mechanics
- **Speak Again Penalty**: No second chances
- **Audio Loading**: Brief delay for audio processing
- **Focus Training**: Develops concentrated listening skills

### Memory Mode Challenge  
**Theme**: "See, Remember, Type"

#### Special Rules
- **Dynamic Viewing Time**: Decreases with DDA level
- **Memorization Phase**: Study the word visually
- **Recall Phase**: 5-second typing timer after word disappears

#### Viewing Time Calculation
```javascript
const calculateViewTime = (ddaLevel) => {
  const baseTime = 2.0;
  const reduction = (ddaLevel - 1) * 0.15;
  return Math.max(1.0, baseTime - reduction);
};
```

#### Progressive Difficulty
- **Level 1**: 2.0 seconds viewing
- **Level 6**: 1.15 seconds viewing  
- **Minimum**: Never below 1.0 second

### Typing Mode Challenge
**Theme**: "Survival Speed Typing"

#### Revolutionary Nitro System
Completely different from other modes - energy-based survival gameplay.

#### Energy Mechanics
- **Starting Energy**: 10 seconds
- **Constant Drain**: Decreases every second
- **Energy Gain**: Correct words add time
- **Energy Loss**: Wrong submissions cost 3 seconds
- **Game Over**: When energy reaches 0

#### Energy Calculation
```javascript
// Gain formula
const energyGain = Math.min(2.5, 1.5 + (wordLength - 3) * 0.2);

// Examples:
// "cat" (3 letters): +1.5 seconds
// "house" (5 letters): +1.9 seconds
// "beautiful" (9 letters): +2.5 seconds (capped)
```

#### The Overdrive System
As performance improves, the game becomes more challenging:

- **Heat Levels**: Visual intensity increases
- **Word Complexity**: Harder vocabulary introduced
- **Speed Requirements**: Faster typing needed to maintain energy
- **Pressure Feedback**: Screen effects and audio cues

#### Scoring Adaptation
Typing Challenge uses a modified scoring system:
- **Base Points**: Per correct word typed
- **Energy Bonus**: Bonus for maintaining high energy
- **Speed Multiplier**: WPM-based multipliers
- **Survival Bonus**: Time-based survival rewards

### MeaningMatch Mode Challenge
**Theme**: "Quick Comprehension"

#### Special Rules
- **15-Second Timer**: Longer timer for reading/thinking
- **Multiple Choice**: 4 options provided
- **Progressive Elimination**: Wrong answers reduce choices
- **Context Variety**: Definitions, synonyms, examples

#### Difficulty Progression
- **A1-A2**: Simple, direct definitions
- **B1-B2**: Context clues and usage examples  
- **C1-C2**: Abstract concepts and nuanced meanings

---

## 🎮 Game Over & Scoring Integration

### Game Over Conditions
- **Echo/Memory**: 3 lives lost OR last word completed
- **Typing**: Energy reaches 0 OR player stops
- **MeaningMatch**: 3 lives lost OR question set complete

### Final Score Display
Comprehensive breakdown showing:

#### Score Components Toast
Appears briefly after each correct answer:
```
Base Score: 100
Speed Bonus: +30
Difficulty: ×1.4 (B1)
Streak Bonus: +175
─────────────────
Final: 357 pts
```

#### Game Over Screen
Detailed session summary:
- **Total Score**: Final accumulated points
- **Best Streak**: Highest consecutive correct answers
- **Accuracy**: Percentage of correct answers
- **Time Spent**: Total session duration
- **Personal Best**: Comparison with previous records

### Score Persistence
- **Database Storage**: All scores saved to user profile
- **Leaderboard Integration**: Automatic ranking updates
- **Progress Tracking**: Historical performance data
- **Achievement Unlocks**: Milestone-based rewards

---

## 🧠 Dynamic Difficulty Adjustment (DDA)

### Core Concept
The DDA system automatically adjusts game difficulty based on real-time performance, ensuring optimal challenge level.

### Performance Tracking
```javascript
// Performance score calculation
const performanceUpdate = isCorrect ? +1 : -2;

// Level adjustment thresholds
const LEVEL_UP_THRESHOLD = 5;    // 5 consecutive successes
const LEVEL_DOWN_THRESHOLD = -3; // 2 failures (or equivalent)
```

### Adjustment Triggers

#### Level Up Conditions
- Performance score reaches +5
- Indicates consistent success at current level
- Unlocks next difficulty tier

#### Level Down Conditions  
- Performance score reaches -3
- Indicates struggle at current level
- Returns to previous difficulty tier

### Seamless Integration
- **Background Operation**: Changes happen invisibly
- **Smooth Transitions**: No jarring difficulty jumps
- **Word Selection**: Automatically chooses appropriate vocabulary
- **Timing Adjustments**: Mode-specific timing modifications

### DDA Benefits
- **Personalized Experience**: Adapts to individual skill level
- **Maintained Engagement**: Prevents boredom or frustration
- **Skill Development**: Gradually increases challenge as skills improve
- **Data-Driven**: Uses actual performance metrics

---

## 🏅 Achievement & Progression System

### Streak Achievements
- **First Steps**: 5 consecutive correct answers
- **Getting Warmed Up**: 10 consecutive correct answers
- **On Fire**: 15 consecutive correct answers
- **Unstoppable**: 20+ consecutive correct answers

### Mode-Specific Achievements
- **Echo Master**: Complete 100 Echo Challenge words
- **Memory Champion**: Achieve 95% accuracy in Memory Challenge
- **Speed Demon**: Reach 60 WPM in Typing Challenge
- **Meaning Expert**: Master all difficulty levels in MeaningMatch

### Score Milestones
- **Point Collector**: Reach 10,000 total points
- **Score Hunter**: Reach 50,000 total points  
- **Point Master**: Reach 100,000 total points
- **Legend**: Reach 500,000 total points

### Time-Based Achievements
- **Dedicated Learner**: Play for 1 hour total
- **Study Enthusiast**: Play for 10 hours total
- **Learning Addict**: Play for 50 hours total
- **Master Student**: Play for 100 hours total

---

## 📱 Mobile Challenge Experience

### Touch Optimizations
- **Large Timer Display**: Easy to read on small screens
- **Touch-Friendly Buttons**: Appropriately sized for mobile
- **Gesture Support**: Swipe and tap interactions
- **Haptic Feedback**: Vibration for important events

### Performance Considerations
- **Optimized Animations**: Smooth on lower-end devices
- **Battery Efficiency**: Minimal background processing
- **Network Tolerance**: Works with poor connections
- **Storage Management**: Efficient local data handling

### Mobile-Specific Features
- **Portrait/Landscape**: Adapts to orientation changes
- **Virtual Keyboard**: Custom keyboards for typing modes
- **Audio Management**: Respects system audio settings
- **Notification Support**: Progress reminders and achievements

---

## 📈 Analytics & Insights

### Performance Metrics
- **Accuracy Trends**: Track improvement over time
- **Speed Development**: WPM and response time analytics
- **Difficulty Progression**: DDA level advancement
- **Mode Preferences**: Which games you excel at

### Learning Insights
- **Vocabulary Gaps**: Words that need more practice
- **Skill Areas**: Listening vs. typing vs. comprehension
- **Optimal Sessions**: Best times and durations for learning
- **Challenge Readiness**: When to attempt harder difficulties

### Comparative Analytics
- **Peer Comparison**: How you rank among similar learners
- **Global Trends**: Popular words and common mistakes
- **Improvement Rate**: Personal development velocity
- **Goal Tracking**: Progress toward learning objectives

This comprehensive Challenge system ensures that every player faces an appropriate level of difficulty while maintaining engagement through competitive scoring and continuous progression.
