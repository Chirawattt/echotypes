# DDA (Dynamic Difficulty Adjustment) System Design for Echotypes

เอกสารนี้ใช้ออกแบบระบบปรับความยากแบบไดนามิก (DDA) สำหรับโปรเจค Echotypes โดยมีเป้าหมายเพื่อสร้างประสบการณ์การเล่นที่ท้าทายและพอดีกับฝีมือของผู้เล่นใน Challenge Mode ทำให้เกมน่าสนใจและอยากกลับมาเล่นซ้ำมากขึ้น

---

## 1. แนวคิดหลัก: The "Difficulty Controller"

เราจะสร้าง "แกนกลาง" สำหรับจัดการความยากที่เรียกว่า **Difficulty Controller** ซึ่งจะทำงานอยู่เบื้องหลังใน Challenge Mode ของทุกเกม (ยกเว้น Meaning Match) โดยมีหน้าที่หลัก 3 อย่าง:

1.  **ติดตามผลงาน (Track Performance):** ประเมินว่าผู้เล่นกำลังเล่นได้ดีหรือแย่ลง จากการตอบถูก/ผิด
2.  **ปรับระดับความยาก (Adjust Difficulty):** เพิ่มหรือลดระดับความยากของเกมแบบเรียลไทม์
3.  **ส่งมอบความยาก (Provide Difficulty):** บอกให้เกมรู้ว่า ณ ตอนนี้ควรใช้คำศัพท์หรือตั้งค่าความยากที่ระดับไหน

---

## 2. การจัดการ State (Zustand Store Slice)

เราจะเพิ่ม Slice ใหม่เข้าไปใน Zustand store เพื่อจัดการสถานะของ DDA

```typescript
// src/stores/ddaStore.ts (หรือไฟล์ store ที่คุณมีอยู่)

export interface DdaState {
  currentDifficultyLevel: number; // 1=A1, 2=A2, 3=B1, 4=B2, 5=C1, 6=C2
  performanceScore: number;       // คะแนนลับสำหรับวัดฟอร์มการเล่น
}

export interface DdaActions {
  updatePerformance: (isCorrect: boolean) => void;
  resetDdaState: () => void;
}

export const initialDdaState: DdaState = {
  currentDifficultyLevel: 1, // เริ่มต้นที่ระดับ A1 เสมอ
  performanceScore: 0,
};

// ภายใน create() ของ Zustand store
// ...
...create<DdaSlice>((set, get) => ({
  ...initialDdaState,
  updatePerformance: (isCorrect) => {
    const { 
      PERFORMANCE_ON_CORRECT, 
      PERFORMANCE_ON_INCORRECT, 
      LEVEL_UP_THRESHOLD, 
      LEVEL_DOWN_THRESHOLD, 
      MAX_DIFFICULTY_LEVEL, 
      MIN_DIFFICULTY_LEVEL 
    } = ddaConfig;

    let newPerformanceScore = get().performanceScore + (isCorrect ? PERFORMANCE_ON_CORRECT : PERFORMANCE_ON_INCORRECT);
    let newDifficultyLevel = get().currentDifficultyLevel;

    // ตรวจสอบเงื่อนไข Level Up
    if (newPerformanceScore >= LEVEL_UP_THRESHOLD && newDifficultyLevel < MAX_DIFFICULTY_LEVEL) {
      newDifficultyLevel++;
      newPerformanceScore = 0; // รีเซ็ตคะแนนเมื่อเลเวลอัพ
    }

    // ตรวจสอบเงื่อนไข Level Down
    if (newPerformanceScore <= LEVEL_DOWN_THRESHOLD && newDifficultyLevel > MIN_DIFFICULTY_LEVEL) {
      newDifficultyLevel--;
      newPerformanceScore = 0; // รีเซ็ตคะแนนเมื่อเลเวลลด
    }

    set({ 
      currentDifficultyLevel: newDifficultyLevel,
      performanceScore: newPerformanceScore
    });
  },
  resetDdaState: () => {
    set(initialDdaState);
  },
})),
```

---

## 3. ไฟล์ตั้งค่าและค่าคงที่ (Configuration)

เพื่อการปรับจูนที่ง่ายในอนาคต เราจะแยกค่าคงที่ทั้งหมดออกมาไว้ในไฟล์เดียว

```typescript
// src/lib/ddaConfig.ts

export const ddaConfig = {
  // ค่าเริ่มต้น
  INITIAL_DIFFICULTY_LEVEL: 1,
  MAX_DIFFICULTY_LEVEL: 6, // C2
  MIN_DIFFICULTY_LEVEL: 1, // A1

  // การคำนวณ Performance Score
  PERFORMANCE_ON_CORRECT: 1,
  PERFORMANCE_ON_INCORRECT: -2, // การลงโทษควรหนักกว่ารางวัล

  // เงื่อนไขการปรับระดับ
  LEVEL_UP_THRESHOLD: 5,   // ตอบถูกติดกัน 5 ครั้ง (หรือเทียบเท่า) เพื่อเลื่อนระดับ
  LEVEL_DOWN_THRESHOLD: -3, // ตอบผิด 2 ครั้ง (หรือเทียบเท่า) เพื่อลดระดับ
};
```

---

## 4. การดึงคำศัพท์และการแปลงระดับความยาก

เราต้องการฟังก์ชัน Helpers เพื่อแปลง `currentDifficultyLevel` (ที่เป็นตัวเลข) ไปเป็นชื่อไฟล์และจัดการการดึงคำศัพท์

```typescript
// src/lib/difficultyHelpers.ts

// ฟังก์ชันแปลงระดับ (ตัวเลข) เป็นชื่อไฟล์ (string)
export const mapLevelToFileName = (level: number): string => {
  switch (level) {
    case 1: return 'a1';
    case 2: return 'a2';
    case 3: return 'b1';
    case 4: return 'b2';
    case 5: return 'c1';
    case 6: return 'c2';
    default: return 'a1';
  }
};

// แนวคิดการดึงคำศัพท์แบบ "Smoothing" (ยังไม่ implement จริงในโค้ดตัวอย่าง)
// เมื่อเกมต้องการคำศัพท์ใหม่ จะเรียกฟังก์ชันนี้
// ฟังก์ชันนี้จะใช้ `currentDifficultyLevel` เพื่อไปดึงคำมาจากไฟล์ที่ถูกต้อง
// Tip: เพื่อให้การเปลี่ยนระดับนุ่มนวล อาจมีการผสมคำศัพท์จากระดับก่อนหน้าเข้ามาเล็กน้อย
// เช่น เมื่อเพิ่งเลื่อนจาก Level 2 ไป 3 อาจจะสุ่มให้มีโอกาสเจอคำจาก A2 30% และ B1 70%
```

---

## 5. การนำไปใช้กับแต่ละโหมด (Mode-Specific Implementations)

### a. Typing Mode & Echo Mode

สองโหมดนี้ใช้ DDA Controller โดยตรงเพื่อกำหนดว่า "จะดึงคำศัพท์จากไฟล์ไหน"

> **การทำงาน:**
> 1. เมื่อผู้เล่นตอบถูก/ผิด ให้เรียก `updatePerformance(isCorrect)`
> 2. ทุกครั้งที่จะแสดงคำใหม่ ให้ดึง `currentDifficultyLevel` จาก store
> 3. ใช้ `mapLevelToFileName(level)` เพื่อหาชื่อไฟล์
> 4. ดึงคำศัพท์แบบสุ่มจากไฟล์นั้นๆ มาแสดง

### b. Memory Mode

โหมดนี้ใช้ DDA ในการควบคุมความยาก 2 ส่วนพร้อมกัน: **คำศัพท์** และ **เวลาแสดงผล**

> **การทำงาน:**
> 1. **การเลือกคำศัพท์:** ทำเหมือนกับ Typing Mode ทุกประการ
> 2. **การคำนวณ View Time:** สร้างฟังก์ชันเพื่อคำนวณเวลาแสดงผลจาก `currentDifficultyLevel`

```typescript
// ภายใน Component ของ Memory Mode
import { useDdaStore } from '@/stores/ddaStore'; // สมมติ path

const calculateViewTime = (level: number): number => {
  const baseViewTime = 2.0; // วินาที
  const reductionPerLevel = 0.15; // ลดลง 0.15 วิ ทุกๆ 1 เลเวล
  const calculatedTime = baseViewTime - ((level - 1) * reductionPerLevel);
  return Math.max(calculatedTime, 1.0); // เวลาต่ำสุดคือ 1 วินาที
};

// ...
const currentDifficultyLevel = useDdaStore((state) => state.currentDifficultyLevel);
const viewTime = calculateViewTime(currentDifficultyLevel); // ได้เวลาแสดงผลแบบไดนามิก
// ...
```

---

## 6. ขั้นตอนการ Implement (Implementation Steps)

1.  **สร้าง `ddaConfig.ts`:** คัดลอกค่าคงที่จากเอกสารนี้ไปใส่
2.  **อัปเดต Zustand Store:** เพิ่ม `DdaState`, `DdaActions`, และ Logic การทำงานของ `updatePerformance` และ `resetDdaState` เข้าไปใน Store ที่มีอยู่
3.  **สร้าง `difficultyHelpers.ts`:** เพิ่มฟังก์ชัน `mapLevelToFileName`
4.  **เริ่มที่ Typing Mode:** นำระบบ DDA นี้ไปใช้กับ Challenge Mode ของ Typing Mode ก่อนเพื่อทดสอบระบบ
5.  **ต่อยอดไปยัง Memory Mode:** ทำเหมือน Typing Mode แต่เพิ่ม Logic การคำนวณ `viewTime` เข้าไป
6.  **ปรับปรุง Echo Mode:** กลับไปแก้ไข Echo Challenge Mode ที่ทำเสร็จแล้ว โดยเอาส่วนเลือก Difficulty แบบเก่าออก และใช้ DDA Controller นี้แทน