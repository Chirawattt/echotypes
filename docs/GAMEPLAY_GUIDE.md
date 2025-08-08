# EchoTypes Gameplay Guide

A single, consolidated guide for all gameplay systems: modes, challenge rules, scoring, and DDA behavior. This merges and rewrites GAME_MODES + CHALLENGE_SYSTEM + CHALLENGE_SCORING_SYSTEM.

## Game Modes

EchoTypes offers three modes, each supporting Practice and Challenge styles.

### Echo Mode
- Listen to the word (TTS), then type it.
- Challenge specifics:
  - One listen per word
  - 5-second timer starts after audio ends
  - Standard challenge scoring applies

### Memory Mode
- Memorize the word briefly, then type it after it hides.
- Challenge specifics:
  - Viewing time decreases with DDA level (min 1.0s)
  - 5-second typing window
  - Standard challenge scoring applies

### Typing Mode
- Word is visible; type it fast and accurately.
- Challenge specifics:
  - Nitro Energy system (survival): constant drain, gain on correct, penalty on wrong
  - Overdrive/Heat feedback as performance improves
  - Uses adapted scoring focusing on throughput and survival

## Game Styles

- Practice: relaxed learning, optional timers, WPM/accuracy for Typing.
- Challenge: timed/scored with streaks and difficulty multipliers.

## Challenge Scoring

Universal formula (Echo/Memory):
```
Final Score = (Base Score + Speed Bonus) × Difficulty Multiplier + Streak Bonus
```
- Base Score: 100 per correct
- Speed Bonus: up to +50 based on remaining time
- Difficulty Multiplier: 1.0× (A1) → 2.0× (C2)
- Streak Bonus: 25 × current streak

Typing Challenge adapts scoring with energy/speed emphasis:
- Base points per correct word
- Energy bonus for sustained high energy
- Speed multiplier based on WPM
- Survival/time bonus

## Dynamic Difficulty Adjustment (DDA)

- Tracks performance (+1 correct, -2 incorrect) and adjusts level.
- Thresholds: +5 to level up, -3 to level down.
- Affects: word selection, timers (mode-specific), and multipliers.
- Works silently to keep players in the “flow” zone.

## Lives, Timers, and Energy

- Echo/Memory: 3 lives, lose 1 on wrong; 5-second per-turn timer in challenge.
- Typing: Nitro Energy instead of lives; 10s start, constant decay, capped gains per word.

## Achievements & Leaderboards

- Personal bests per mode/style tracked.
- Global leaderboards rank scores per mode/style.
- Streak milestones and mastery targets (e.g., C2 mastery) as future enhancements.

## Routes (DDA-only)

- /play/{modeId}/dda — Pre-game/setup
- /play/{modeId}/dda/play — Gameplay
- style=practice|challenge

Mode IDs: echo, memory, typing.
