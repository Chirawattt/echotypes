# Challenge Mode Score Breakdown Toast 🎯

## 📋 Overview

แก้ไข Challenge Mode Score Breakdown จากแบบ card เป็น toast animation ที่ขึ้นมาทีละรายการและหายไปแบบ smooth

## ✅ Changes Made

### 1. **Toast Animation System**
- **ลบ Background Card**: ไม่มี bg-black/80 หรือ border card แล้ว
- **Individual Toasts**: แต่ละรายการเป็น toast แยกกัน
- **Staggered Animation**: ขึ้นมาทีละรายการด้วย delay
- **Smooth Exit**: หายไปทีละรายการแบบ smooth

### 2. **Animation Timing**
```tsx
// เข้า (staggered)
Base Score:     delay: 0.1s
Time Bonus:     delay: 0.3s  
Difficulty:     delay: 0.5s
Streak Bonus:   delay: 0.7s
Final Score:    delay: 0.9s

// ออก (reverse staggered)  
Base Score:     delay: 0s
Time Bonus:     delay: 0.2s
Difficulty:     delay: 0.4s
Streak Bonus:   delay: 0.6s
Final Score:    delay: 0.8s
```

### 3. **Visual Design**
- **ตำแหน่ง**: ชิดขวา (right-4) บนหน้าจอ
- **สี**: แต่ละรายการมีสีที่แตกต่างกัน
  - Base Score: `text-green-400`
  - Time Bonus: `text-blue-400`
  - Difficulty: `text-purple-400`
  - Streak Bonus: `text-orange-400`
  - Final Score: `text-yellow-400` + border-t
- **Typography**: `font-bold text-lg` (text-xl สำหรับ final score)
- **Effects**: `drop-shadow-lg` สำหรับความชัดเจน

### 4. **State Management**
```tsx
// State สำหรับควบคุมการแสดงผล
const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
const scoreBreakdownTimerRef = useRef<NodeJS.Timeout | null>(null);

// แสดง toast เมื่อได้คะแนน
setShowScoreBreakdown(true);

// ซ่อน toast หลังจาก 5 วินาที
scoreBreakdownTimerRef.current = setTimeout(() => {
    setShowScoreBreakdown(false);
}, 5000);
```

### 5. **AnimatePresence Integration**
```tsx
<AnimatePresence>
    {gameStyle === 'challenge' && lastScoreCalculation && showScoreBreakdown && (
        // Toast content
    )}
</AnimatePresence>
```

## 🎨 Animation Flow

### การเข้า (Enter Animation)
1. **Base Score** ขึ้นมาก่อน (0.1s delay)
2. **Time Bonus** ตาม (0.3s delay)  
3. **Difficulty** ตาม (0.5s delay)
4. **Streak Bonus** ตาม (0.7s delay)
5. **Final Score** สุดท้าย (0.9s delay) พร้อม border

### การออก (Exit Animation)
1. **Base Score** หายไปก่อน (0s delay)
2. **Time Bonus** ตาม (0.2s delay)
3. **Difficulty** ตาม (0.4s delay)  
4. **Streak Bonus** ตาม (0.6s delay)
5. **Final Score** สุดท้าย (0.8s delay)

## 🔧 Technical Details

### Motion Properties
```tsx
initial={{ opacity: 0, x: 20, scale: 0.8 }}
animate={{ opacity: 1, x: 0, scale: 1 }}
exit={{ opacity: 0, x: 20, scale: 0.8 }}
```

### Layout Structure
```
Right side of screen (absolute positioning)
├── Base Score Toast (+100 (base))
├── Time Bonus Toast (+43 (time))  
├── Difficulty Toast (×1.5 (difficulty))
├── Streak Bonus Toast (+25 (streak))
└── Final Score Toast (= 239 pts) [with border]
```

### Auto-hide Timer
- **Duration**: 5 seconds
- **Reset**: ทุกครั้งที่มีคะแนนใหม่
- **Cleanup**: เมื่อ component unmount

## 🎯 User Experience

### ตัวอย่างการทำงาน:
1. ผู้เล่นตอบถูก → คำนวณคะแนน
2. Toast ขึ้นมาทีละรายการ (0.1s, 0.3s, 0.5s, 0.7s, 0.9s)
3. แสดงผล 5 วินาที
4. หายไปทีละรายการแบบ smooth (0s, 0.2s, 0.4s, 0.6s, 0.8s)
5. รอคำตอบถัดไป

### ข้อดี:
- **ไม่บัง Gameplay**: ไม่มี background card ทึบ
- **Clear Information**: เห็นการคำนวณแต่ละขั้นตอน
- **Smooth Experience**: Animation ที่นุ่มนวลและไม่รบกวน
- **Auto-hide**: หายไปเองไม่ต้องกังวล

## 📁 Files Modified

```
app/play/[modeId]/[difficultyId]/game/page.tsx
├── ✅ เพิ่ม showScoreBreakdown state
├── ✅ เพิ่ม scoreBreakdownTimerRef
├── ✅ เพิ่ม auto-show logic เมื่อได้คะแนน
├── ✅ เพิ่ม auto-hide timer (5s)
├── ✅ เปลี่ยน UI จาก card เป็น toast
├── ✅ เพิ่ม AnimatePresence wrapper
├── ✅ ปรับ animation timing และ colors
└── ✅ เพิ่ม cleanup สำหรับ timer
```

## 🚀 Next Steps

- [ ] เพิ่ม Sound effects สำหรับ toast animation
- [ ] เพิ่ม Option ให้ user เลือกเปิด/ปิด score breakdown
- [ ] เพิ่ม Gesture support (swipe เพื่อปิด)
- [ ] เพิ่ม Different animation styles
