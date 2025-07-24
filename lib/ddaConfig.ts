// DDA (Dynamic Difficulty Adjustment) Configuration
// ไฟล์ตั้งค่าสำหรับระบบปรับความยากแบบไดนามิก

export const ddaConfig = {
  // ค่าเริ่มต้น
  INITIAL_DIFFICULTY_LEVEL: 1,
  MAX_DIFFICULTY_LEVEL: 6, // C2
  MIN_DIFFICULTY_LEVEL: 1, // A1

  // การคำนวณ Performance Score
  PERFORMANCE_ON_CORRECT: 1,
  PERFORMANCE_ON_INCORRECT: -2, // การลงโทษควรหนักกว่ารางวัล

  // เงื่อนไขการปรับระดับ
  LEVEL_UP_THRESHOLD: 10,   // ตอบถูกติดกัน 10 ครั้ง (หรือเทียบเท่า) เพื่อเลื่อนระดับ
  LEVEL_DOWN_THRESHOLD: -3, // ตอบผิด 2 ครั้ง (หรือเทียบเท่า) เพื่อลดระดับ
};
