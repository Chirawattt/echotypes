# Challenge Mode Scoring System 🏆

## 📋 Overview

ระบบคะแนนใหม่สำหรับ Challenge Mode ที่นำมาใช้กับทุกโหมดเกม (Echo, Memory, Meaning Match) โดยมีเป้าหมายเพื่อให้ผู้เล่นได้รับคะแนนที่เหมาะสมตามความเร็ว ความยาก และ streak ที่สร้างได้

## 🧮 Scoring Formula

```
คะแนนที่ได้ = (คะแนนพื้นฐาน + โบนัสเวลา) × โบนัสความยาก + โบนัส Streak
```

### 📊 Component Breakdown

| Component | Description | Value |
|-----------|-------------|-------|
| **คะแนนพื้นฐาน** | คะแนนพื้นฐานสำหรับคำตอบที่ถูก | 100 คะแนน |
| **โบนัสเวลา** | (5.0 - เวลาที่ใช้) × 15 | 0-75 คะแนน |
| **โบนัสความยาก** | ตัวคูณตามระดับ | A1: ×1.0 → C2: ×2.25 |
| **โบนัส Streak** | Streak × 5 (สูงสุด 20) | 0-100 คะแนน |

### 🎚️ Difficulty Multipliers

| Level | Multiplier | Description |
|-------|------------|-------------|
| A1 | ×1.0 | Beginner |
| A2 | ×1.25 | Elementary |
| B1 | ×1.5 | Intermediate |
| B2 | ×1.75 | Upper-Intermediate |
| C1 | ×2.0 | Advanced |
| C2 | ×2.25 | Proficiency |

## 🎮 Mode-Specific Implementation

### 🔊 Echo Mode
- **Timer Start**: หลังจากเสียงพูดเสร็จ
- **Precision**: อัปเดตทุก 0.1 วินาที
- **Time Tracking**: ส่งค่า timeLeft ไปยัง parent สำหรับคำนวณ

### 🧠 Memory Mode
- **Timer Start**: หลังจากจบระยะ memorization (2 วินาที)
- **Precision**: อัปเดตทุก 0.1 วินาที
- **Time Tracking**: เริ่มนับเมื่อผู้เล่นต้องพิมพ์

### 💡 Meaning Match Mode
- **Timer Start**: ทันทีที่แสดงความหมาย
- **Precision**: อัปเดตทุก 0.1 วินาที
- **Time Tracking**: เริ่มนับทันทีที่โหลดข้อสอบ

### ⌨️ Typing Mode
- **Current Status**: ยังใช้ระบบคะแนนเดิม
- **Future**: จะปรับให้ใช้ระบบใหม่ในอนาคต

## 📈 Score Examples

### ตัวอย่างที่ 1: Fast Response (A2, 3 Streak)
```
เวลาที่ใช้: 1.2 วินาที
โบนัสเวลา: (5.0 - 1.2) × 15 = 57 คะแนน
คะแนน: (100 + 57) × 1.25 + 15 = 211 คะแนน
```

### ตัวอย่างที่ 2: Slow Response (B1, 8 Streak)
```
เวลาที่ใช้: 4.3 วินาที
โบนัสเวลา: (5.0 - 4.3) × 15 = 10.5 คะแนน
คะแนน: (100 + 10.5) × 1.5 + 40 = 206 คะแนน
```

### ตัวอย่างที่ 3: High Streak (C2, 20+ Streak)
```
เวลาที่ใช้: 2.1 วินาที
โบนัสเวลา: (5.0 - 2.1) × 15 = 43.5 คะแนน
คะแนน: (100 + 43.5) × 2.25 + 100 = 423 คะแนน
```

## 💾 Technical Implementation

### State Management (Zustand)
```typescript
interface GameState {
    totalChallengeScore: number;
    lastScoreCalculation: ScoreCalculation | null;
    
    // Actions
    addChallengeScore: (calculation: ScoreCalculation) => void;
    resetChallengeScore: () => void;
}
```

### Scoring Functions
- `calculateTotalScore()`: ฟังก์ชันหลักคำนวณคะแนน
- `calculateEchoModeScore()`: เฉพาะสำหรับ Echo Mode
- `calculateTimeBonus()`: คำนวณโบนัสเวลา
- `calculateStreakBonus()`: คำนวณโบนัส Streak

### Timer Precision
- อัปเดตทุก 100ms (0.1 วินาที)
- แสดงผลทศนิยม 1 ตำแหน่ง
- Progress bar animation ที่นุ่มนวล

## 🎨 UI/UX Features

### 📊 Score Display
- แสดงคะแนน Challenge Mode แทนคะแนนปกติ
- รูปแบบ: "XXX pts" แทน "XXX Score"

### 📝 Score Breakdown Popup
```
Last Score:
Base: 100
Time: +43
Difficulty: ×1.5
Streak: +40
─────────────
Total: 247 pts
```

### ⏱️ Visual Timer
- วงกลม progress bar
- สีเปลี่ยนเป็นแดงเมื่อเหลือ ≤ 2 วินาที
- Pulsing effect เมื่อใกล้หมดเวลา

## 🔄 Game Flow Integration

1. **Answer Submitted**: คำนวณคะแนนทันที
2. **Add to Total**: เพิ่มคะแนนเข้า totalChallengeScore
3. **Store Calculation**: เก็บ lastScoreCalculation สำหรับแสดงผล
4. **Visual Feedback**: แสดง score breakdown (optional)

## 🚀 Future Enhancements

- [ ] High Score tracking สำหรับ Challenge Mode
- [ ] Achievement system based on scores
- [ ] Leaderboard system
- [ ] Performance analytics
- [ ] Typing Mode challenge integration
- [ ] Difficulty-based challenge unlocks

## 📁 File Structure

```
lib/
├── scoring.ts                 # Core scoring logic
└── stores/
    └── gameStore.ts          # Challenge score state management

components/game/modes/
├── EchoMode.tsx              # Echo mode with timer
├── MemoryMode.tsx            # Memory mode with timer  
├── MeaningMatchMode.tsx      # Meaning match with timer
└── TypingMode.tsx            # (To be updated)

app/play/[modeId]/[difficultyId]/game/
└── page.tsx                  # Main game logic integration
```

## 🎯 Success Metrics

- ✅ Accurate decimal timing (0.1s precision)
- ✅ Fair scoring across all difficulty levels
- ✅ Incentivizes both speed and accuracy
- ✅ Rewards consistent performance (streaks)
- ✅ Seamless integration with existing game flow
- ✅ Clean, intuitive UI feedback
