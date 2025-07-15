# Interesting feature to be implemented

1. เวลาแสดงผลแบบไดนามิก (Dynamic Viewing Time)
เวลาแสดงผลจะลดลงอัตโนมัติตามระดับความยาก (DDA Level) ของผู้เล่นในขณะนั้น

const calculateViewTime = (level: number): number => {
  switch (level) {
    case 1: // A1
      return 2.00;
    case 2: // A2
      return 1.90;
    case 3: // B1
      return 1.75;
    case 4: // B2
      return 1.55;
    case 5: // C1
      return 1.35;
    case 6: // C2
      return 1.15;
    default: // กรณีฉุกเฉินหรือค่าเริ่มต้น
      return 2.00;
  }
};

เวลาลดลงแบบนี้

2. เวลากดดันในการพิมพ์ (The Typing Countdown)
- หลังจากที่คำศัพท์หายไป ผู้เล่นจะมีเวลาในการพิมพ์คำตอบที่จำมาได้ เพียง 5 วินาทีเท่านั้น!
- จะมีแถบเวลานับถอยหลังปรากฏขึ้นทันทีเพื่อสร้างแรงกดดัน เหมือนโหมด Echo Challenge Mode
- ถ้าพิมพ์ไม่ทันใน 5 วินาที จะถือว่าข้อนั้น "ผิด" ทันที ซึ่งจะส่งผลให้: เสีย 1 ชีวิต, Streak ขาด (Combo Multiplier รีเซ็ตเป็น x1), performanceScore ของระบบ DDA ลดลง เหมือนโหมดอื่นทั่วไป

3. การคิดคะแนน (Scoring Integration)
เราจะใช้ ระบบคะแนนที่ขับเคลื่อนด้วยคอมโบ (Combo-Driven Scoring) ที่เราออกแบบไว้สำหรับ Typing Mode ทุกประการ
- คะแนนที่ได้ต่อ 1 คำ = (100 + (จำนวนตัวอักษร * 5)) * ตัวคูณคอมโบ


** bug ที่เจอตอนนี้ **
- มีอาการ word flashing นิดหน่อยตอนโหลดคำศัพท์ใหม่เข้ามาเมื่อเลื่อนระดับ (แก้แล้ว)
- ตรง text now type what you remember หลังจากส่งคำตอบไปแล้ว อยากให้เปลี่ยนเป็นแสดง feed back ของคำตอบแทน ว่าเราตอบถูกหรือไม่ถูก (แก้แล้ว)
- หลังจาก game over ที่จะมีหน้าค้างไว้แปปนึงที่เป็น bg สีม่วงๆ เวลามันนับถอยหลังใหม่ (จริงๆ ควรหยุดเวลา หรือไม่ก็เซ็ตให้เป็น 0 ไปเลย) (แก้แล้ว)
- เสียง completed ถูกเล่นสองครั้งเหมือนโหมดอื่นๆ ตอนแรกที่แก้ไปแล้ว 1. คือตอนให้ค้างหน้า gameover และตอน gameover overlay (แก้แล้ว)

- แสดง point display (คะแนนที่ทำได้ใน Challenge Mode) ไว้ตลอดเวลา ในหน้า gameplay เหมือน Echo Challenge Mode

refs from Echo Challenge Mode
{/* Points Display - for Challenge Mode */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="rounded-lg p-1 sm:p-2 mb-2 sm:mb-4 text-center"
                    >
                        <motion.p
                            className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${getScoreColorByStreak(streakCount)}`}
                            animate={streakCount >= 5 ? {
                                scale: [1, 1.05, 1],
                                textShadow: [
                                    '0 0 10px rgba(250,204,21,0.5)',
                                    '0 0 20px rgba(250,204,21,0.8)',
                                    '0 0 10px rgba(250,204,21,0.5)'
                                ]
                            } : {}}
                            transition={{
                                duration: 2,
                                repeat: streakCount >= 5 ? Infinity : 0,
                                ease: "easeInOut"
                            }}
                        >
                            {totalChallengeScore} pts.
                        </motion.p>
                    </motion.div>