// DDA Helper Functions
// ฟังก์ชันช่วยสำหรับระบบปรับความยากแบบไดนามิก

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

// ฟังก์ชันแปลงชื่อไฟล์เป็นชื่อที่แสดงผลได้
export const mapLevelToDisplayName = (level: number): string => {
  switch (level) {
    case 1: return 'A1';
    case 2: return 'A2';
    case 3: return 'B1';
    case 4: return 'B2';
    case 5: return 'C1';
    case 6: return 'C2';
    default: return 'A1';
  }
};

// ฟังก์ชันคำนวณเวลาแสดงผลสำหรับ Memory Mode
export const calculateViewTime = (level: number): number => {
  const baseViewTime = 2.0; // วินาที
  const reductionPerLevel = 0.15; // ลดลง 0.15 วิ ทุกๆ 1 เลเวล
  const calculatedTime = baseViewTime - ((level - 1) * reductionPerLevel);
  return Math.max(calculatedTime, 1.0); // เวลาต่ำสุดคือ 1 วินาที
};

// ฟังก์ชันคำนวณเวลา timeout สำหรับ Echo Mode (ถ้าใช้ใน Challenge Mode)
export const calculateEchoTimeout = (level: number): number => {
  const baseTimeout = 3.0; // วินาที
  const reductionPerLevel = 0.2; // ลดลง 0.2 วิ ทุกๆ 1 เลเวล
  const calculatedTime = baseTimeout - ((level - 1) * reductionPerLevel);
  return Math.max(calculatedTime, 1.5); // เวลาต่ำสุดคือ 1.5 วินาที
};
