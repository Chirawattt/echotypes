# Game Modes Guide

EchoTypes features 4 distinct game modes, each designed to train different English vocabulary skills. Each mode supports both **Practice** (relaxed learning) and **Challenge** (competitive scoring) styles.

## 🔊 Echo Mode

**Skill Focus**: Listening comprehension and pronunciation recognition

### How It Works
1. **Listen**: Click the speaker icon to hear the word pronunciation
2. **Type**: Type what you heard
3. **Submit**: Press Enter to check your answer

### Practice Mode
- Unlimited listening attempts
- No time pressure
- Focus on learning and improvement

### Challenge Mode Features
- **Limited Listens**: Only 1 listen per word
- **5-Second Timer**: Must answer within 5 seconds after audio ends
- **Scoring System**: Points based on accuracy, speed, and difficulty
- **Streak Bonuses**: Consecutive correct answers multiply your score

### Scoring Formula (Challenge Mode)
```
Final Score = (Base Score + Time Bonus) × Difficulty Multiplier + Streak Bonus
```

**Components:**
- **Base Score**: 100 points per correct answer
- **Time Bonus**: Up to 50 points based on response speed
- **Difficulty Multiplier**: 1.0x (A1) to 2.0x (C2)
- **Streak Bonus**: 25 points per consecutive correct answer

---

## 🧠 Memory Mode

**Skill Focus**: Visual memory and spelling retention

### How It Works
1. **Memorize**: Word appears for a limited time - study it carefully
2. **Recall**: Word disappears, type what you remember
3. **Submit**: Press Enter to check your spelling

### Practice Mode
- 2-second viewing time for all words
- No time pressure for typing
- Focus on memorization techniques

### Challenge Mode Features
- **Dynamic Viewing Time**: Display time decreases with DDA level
  - Level 1 (A1): 2.00 seconds
  - Level 2 (A2): 1.90 seconds
  - Level 3 (B1): 1.75 seconds
  - Level 4 (B2): 1.55 seconds
  - Level 5 (C1): 1.35 seconds
  - Level 6 (C2): 1.15 seconds
- **5-Second Typing Timer**: Must type within 5 seconds after word disappears
- **Pressure System**: Creates intense memorization challenge
- **Same Scoring**: Uses Echo Mode scoring formula

---

## ⚡ Typing Mode

**Skill Focus**: Typing speed and word recognition

### How It Works
1. **Read**: Word appears immediately on screen
2. **Type**: Type the word as quickly and accurately as possible
3. **Continue**: Automatically moves to next word upon correct entry

### Practice Mode
- Timed sessions (1, 3, 5 minutes, or unlimited)
- WPM (Words Per Minute) tracking
- Accuracy percentage display

### Challenge Mode Features
- **Nitro Energy System**: Revolutionary survival-based gameplay
- **Dynamic Energy Bar**: Starts with 10 seconds, constantly decreasing
- **Energy Management**:
  - **Gain Energy**: +1.5 to +2.5 seconds per correct word (longer words = more energy)
  - **Lose Energy**: -3 seconds for any incorrect submission
  - **Game Over**: When energy reaches 0

#### The Overdrive System 🔥
"The better you get, the harder the game pushes back"

- **Heat Levels**: Game difficulty increases as you perform better
- **Visual Feedback**: Screen effects intensify with heat level
- **Challenge Escalation**: Word difficulty and speed requirements increase

### Nitro Energy Calculation
```javascript
// Energy gained per correct word
const energyGain = Math.min(2.5, 1.5 + (wordLength - 3) * 0.2);

// Examples:
// 3-letter word: +1.5 seconds
// 5-letter word: +1.9 seconds  
// 8-letter word: +2.5 seconds (capped)
```

---

## 💭 MeaningMatch Mode

**Skill Focus**: Vocabulary comprehension and definition understanding

### How It Works
1. **Read**: A definition or context clue is displayed
2. **Choose**: Select the correct word from 4 multiple-choice options
3. **Learn**: Immediate feedback with explanations

### Practice Mode
- Unlimited time to think
- Explanations for all answer choices
- Focus on understanding word meanings

### Challenge Mode Features
- **15-Second Timer**: Must choose within 15 seconds
- **Penalty System**: Wrong answers reduce available options
- **Context Variety**: Definitions, synonyms, usage examples
- **Progressive Difficulty**: More abstract definitions at higher levels

### Difficulty Progression
- **A1-A2**: Simple definitions with common words
- **B1-B2**: Context clues and usage examples
- **C1-C2**: Abstract concepts and academic vocabulary

---

## 🎯 Common Challenge Mode Features

### Dynamic Difficulty Adjustment (DDA)
All Challenge modes use an intelligent difficulty system:

- **Performance Tracking**: Monitors your accuracy and speed
- **Automatic Adjustment**: Increases difficulty when you're doing well
- **Seamless Transitions**: Difficulty changes happen behind the scenes
- **Personalized Challenge**: Maintains optimal difficulty for each player

### Scoring Components
1. **Base Points**: Consistent across all modes (100 per correct)
2. **Speed Bonus**: Faster responses earn more points
3. **Difficulty Multiplier**: Higher CEFR levels multiply your score
4. **Streak System**: Consecutive correct answers add bonus points
5. **Special Bonuses**: Mode-specific bonuses (e.g., Nitro in Typing)

### Lives System
- **Echo & Memory**: 3 lives, lose 1 per wrong answer
- **Typing**: Energy-based (Nitro system)
- **MeaningMatch**: 3 lives, strategic answer elimination

---

## 🔄 Mode Transitions

### Practice → Challenge
- Unlock Challenge mode by completing Practice sessions
- Gradually introduces competitive elements
- Maintains learning focus with added excitement

### Difficulty Progression
- Start at your appropriate CEFR level
- DDA system adjusts in real-time
- Manual level selection available in Practice mode

### Cross-Mode Skills
- **Echo → Memory**: Listening skills help with memorization
- **Memory → Typing**: Visual recognition improves typing accuracy
- **Typing → MeaningMatch**: Speed reading enhances comprehension
- **All Modes**: Vocabulary knowledge transfers across modes

---

## 📱 Mobile Optimization

All game modes are fully optimized for mobile devices:

- **Touch-Friendly**: Large buttons and intuitive gestures
- **Virtual Keyboard**: Custom keyboard for Typing mode
- **Responsive Timers**: Adapted for touch input delays
- **Audio Controls**: Mobile-optimized speech synthesis
- **Portrait/Landscape**: Supports both orientations

---

## 🎵 Audio Features

### Text-to-Speech Integration
- **High-Quality Voices**: Natural English pronunciation
- **Speed Control**: Adjustable playback speed
- **Accent Variety**: Multiple English accents available
- **Offline Capability**: Works without internet connection

### Sound Effects
- **Feedback Audio**: Success, error, and completion sounds
- **Immersive Experience**: Audio cues enhance gameplay
- **Volume Control**: Customizable audio levels
- **Mobile Compatibility**: Optimized for all devices

---

## 🏆 Achievement System

### Progress Tracking
- **Game Mode Mastery**: Complete challenges in each mode
- **Streak Achievements**: Maintain consecutive correct answers
- **Speed Milestones**: Achieve target WPM in Typing mode
- **Perfect Rounds**: Complete sessions without errors

### Leaderboards
- **Global Rankings**: Compete with players worldwide
- **Friend Comparisons**: Challenge people you know
- **Personal Bests**: Track your improvement over time
- **Mode-Specific**: Separate rankings for each game mode

This comprehensive game mode system ensures that learners of all levels can find appropriate challenges while building comprehensive English vocabulary skills.
