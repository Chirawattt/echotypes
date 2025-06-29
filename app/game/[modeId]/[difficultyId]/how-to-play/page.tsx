"use client";

import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaVolumeUp, FaKeyboard, FaPlay, FaChevronDown, FaBrain, FaLightbulb, FaClock, FaHeart, FaTrophy } from "react-icons/fa";
import { useRef, useState, useEffect } from "react";

interface HowToPlayStep {
    stepNumber: string;
    title: string;
    description: string;
    icon: React.ElementType;
}

// โครงสร้างข้อมูลสำหรับข้อมูลโหมด
interface ModeInfo {
    name: string;
    description: string;
    color: string;
    gradientFrom: string;
    gradientTo: string;
}

// ข้อมูลของแต่ละโหมด
const getModeInfo = (modeId: string): ModeInfo => {
    switch (modeId) {
        case 'echo':
            return {
                name: 'Echo Mode',
                description: 'ฟังและพิมพ์ตามที่ได้ยิน',
                color: 'text-blue-400',
                gradientFrom: 'from-blue-400',
                gradientTo: 'to-blue-600'
            };
        case 'typing':
            return {
                name: 'Typing Mode',
                description: 'พิมพ์อย่างรวดเร็วและแม่นยำ',
                color: 'text-green-400',
                gradientFrom: 'from-green-400',
                gradientTo: 'to-green-600'
            };
        case 'memory':
            return {
                name: 'Memory Mode',
                description: 'จำและพิมพ์คำศัพท์',
                color: 'text-purple-400',
                gradientFrom: 'from-purple-400',
                gradientTo: 'to-purple-600'
            };
        case 'meaning-match':
            return {
                name: 'Meaning Match',
                description: 'จับคู่คำศัพท์กับความหมาย',
                color: 'text-orange-400',
                gradientFrom: 'from-orange-400',
                gradientTo: 'to-orange-600'
            };
        default:
            return {
                name: 'Game Mode',
                description: 'เล่นเกมเพื่อฝึกคำศัพท์',
                color: 'text-gray-400',
                gradientFrom: 'from-gray-400',
                gradientTo: 'to-gray-600'
            };
    }
};

// Steps สำหรับแต่ละโหมด - ปรับปรุงให้เฉพาะเจาะจงมากขึ้น
const getStepsForMode = (modeId: string): HowToPlayStep[] => {
    switch (modeId) {
        case 'echo':
            return [
                {
                    stepNumber: "1",
                    title: "ฟังเสียงคำศัพท์อย่างตั้งใจ",
                    description: "กดปุ่มลำโพงหรือรอให้ระบบเล่นเสียงคำศัพท์ ฟังอย่างตั้งใจและจดจำการออกเสียง คุณสามารถฟังซ้ำได้หากจำเป็น",
                    icon: FaVolumeUp,
                },
                {
                    stepNumber: "2",
                    title: "พิมพ์คำที่ได้ยินทันที",
                    description: "พิมพ์คำศัพท์ที่ได้ยินลงในช่องข้อความ ไม่ต้องกังวลกับตัวเล็ก-ใหญ่ ระบบจะตรวจสอบให้อัตโนมัติ",
                    icon: FaKeyboard,
                },
                {
                    stepNumber: "3",
                    title: "ระบบให้ผลลัพธ์ทันที",
                    description: "หากตอบถูกจะแสดงเครื่องหมายถูกสีเขียว หากผิดจะแสดงกากบาทสีแดงและคำตอบที่ถูกต้อง คุณมีชีวิต 3 ครั้ง",
                    icon: FaHeart,
                },
                {
                    stepNumber: "4",
                    title: "ดูผลลัพธ์และความก้าวหน้า",
                    description: "เมื่อจบเกม ดูคะแนนรวม เปอร์เซ็นต์ความแม่นยำ และรายการคำที่ตอบผิดเพื่อทบทวน",
                    icon: FaTrophy,
                }
            ];

        case 'typing':
            return [
                {
                    stepNumber: "1",
                    title: "เตรียมความพร้อมสำหรับการพิมพ์",
                    description: "วางนิ้วในตำแหน่งที่ถูกต้อง (Home Row) คำศัพท์จะแสดงบนหน้าจอและเริ่มจับเวลา 60 วินาทีทันที",
                    icon: FaClock,
                },
                {
                    stepNumber: "2",
                    title: "พิมพ์ให้เร็วและแม่นยำ",
                    description: "พิมพ์คำศัพท์ที่แสดงให้เร็วที่สุดแต่ยังคงความแม่นยำ ระบบจะคำนวณ WPM (Words Per Minute) แบบเรียลไทม์",
                    icon: FaKeyboard,
                },
                {
                    stepNumber: "3",
                    title: "ติดตามคะแนน WPM",
                    description: "ดูคะแนน WPM ที่เพิ่มขึ้นเรื่อยๆ ในขณะที่พิมพ์ ยิ่งพิมพ์เร็วและถูกต้องมากยิ่งได้คะแนนสูง",
                    icon: FaTrophy,
                },
                {
                    stepNumber: "4",
                    title: "ท้าทายตัวเองให้ดีขึ้น",
                    description: "เมื่อหมดเวลา ดูผลลัพธ์ WPM สูงสุดและเฉลี่ย พยายามทำลายสถิติของตัวเองในรอบถัดไป",
                    icon: FaPlay,
                }
            ];

        case 'memory':
            return [
                {
                    stepNumber: "1",
                    title: "สังเกตคำศัพท์ให้ละเอียด",
                    description: "คำศัพท์จะแสดงเป็นเวลา 2 วินาที มองดูอย่างตั้งใจ สังเกตการสะกดทุกตัวอักษร และพยายามจำให้ได้",
                    icon: FaBrain,
                },
                {
                    stepNumber: "2",
                    title: "จำคำในใจขณะนับถอยหลัง",
                    description: "เมื่อคำหายไป จะมีการนับถอยหลัง 3-2-1 ใช้เวลานี้ในการทบทวนคำที่เห็นในใจ",
                    icon: FaClock,
                },
                {
                    stepNumber: "3",
                    title: "พิมพ์ตามที่จำได้",
                    description: "พิมพ์คำศัพท์ที่จำได้ลงในช่อง ไม่ต้องรีบร้อน ใช้เวลาคิดให้ดีก่อนพิมพ์",
                    icon: FaKeyboard,
                },
                {
                    stepNumber: "4",
                    title: "พัฒนาความจำต่อเนื่อง",
                    description: "ทำแบบนี้ต่อไปเรื่อยๆ จนจบเกม การฝึกซ้ำจะช่วยพัฒนาความจำระยะสั้นของคุณ",
                    icon: FaTrophy,
                }
            ];

        case 'meaning-match':
            return [
                {
                    stepNumber: "1",
                    title: "อ่านความหมายอย่างละเอียด",
                    description: "อ่านความหมายที่แสดงบนหน้าจอให้เข้าใจ ถ้าเป็นคำที่ยาก ลองคิดถึงคำที่เกี่ยวข้องหรือคล้ายกัน",
                    icon: FaLightbulb,
                },
                {
                    stepNumber: "2",
                    title: "ใช้ความรู้ในการเดาคำ",
                    description: "จากความหมายที่อ่าน ใช้ความรู้คำศัพท์ที่มีอยู่ในการคิดหาคำภาษาอังกฤษที่ตรงกัน",
                    icon: FaBrain,
                },
                {
                    stepNumber: "3",
                    title: "พิมพ์คำตอบที่คิดได้",
                    description: "พิมพ์คำศัพท์ภาษาอังกฤษที่คิดว่าตรงกับความหมาย หากไม่แน่ใจ ให้ลองคำที่ใกล้เคียงที่สุด",
                    icon: FaKeyboard,
                },
                {
                    stepNumber: "4",
                    title: "เรียนรู้จากคำตอบ",
                    description: "ไม่ว่าจะตอบถูกหรือผิด ระบบจะแสดงคำตอบที่ถูกต้อง เป็นโอกาสเรียนรู้คำศัพท์ใหม่",
                    icon: FaTrophy,
                }
            ];

        default:
            return [];
    }
};

const VISIBLE_CARDS = 3;

export default function HowToPlayPage() {
    const router = useRouter();
    const params = useParams();
    const modeId = params.modeId as string;
    const difficultyId = params.difficultyId as string;

    // Get mode info and steps based on mode
    const modeInfo = getModeInfo(modeId);
    const steps = getStepsForMode(modeId);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [canScroll, setCanScroll] = useState(steps.length > VISIBLE_CARDS);
    const [scrollContainerMaxHeight, setScrollContainerMaxHeight] = useState<number | undefined>(undefined);

    const handlePlayGame = () => {
        router.push(`/game/${modeId}/${difficultyId}/play`);
    };

    const checkScrollPosition = () => {
        const container = scrollContainerRef.current;
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            setIsAtBottom(scrollHeight - scrollTop <= clientHeight + 5); // Add a small tolerance
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container && steps.length > 0) {
            // Calculate maxHeight based on the first VISIBLE_CARDS items
            const firstCard = container.children[0] as HTMLElement;
            if (firstCard) {
                // Get container's vertical padding
                const containerStyle = window.getComputedStyle(container);
                const containerPaddingTop = parseFloat(containerStyle.paddingTop);
                const containerPaddingBottom = parseFloat(containerStyle.paddingBottom);

                let calculatedHeight = 0;
                const cardsToMeasure = Math.min(steps.length, VISIBLE_CARDS);
                for (let i = 0; i < cardsToMeasure; i++) {
                    const child = container.children[i] as HTMLElement;
                    if (child) {
                        const childStyle = window.getComputedStyle(child);
                        const childMarginTop = i > 0 ? parseFloat(childStyle.marginTop) : 0; // space-y applies to non-first
                        const childMarginBottom = parseFloat(childStyle.marginBottom);
                        calculatedHeight += child.offsetHeight + childMarginTop + childMarginBottom;
                    }
                }
                // Remove the last card's bottom margin if it's part of space-y logic
                if (cardsToMeasure > 0 && container.children[cardsToMeasure - 1]) {
                    const lastVisibleCard = container.children[cardsToMeasure - 1] as HTMLElement;
                    const lastCardStyle = window.getComputedStyle(lastVisibleCard);
                    calculatedHeight -= parseFloat(lastCardStyle.marginBottom);
                }

                setScrollContainerMaxHeight(calculatedHeight + containerPaddingTop + containerPaddingBottom);
            }

            container.addEventListener("scroll", checkScrollPosition);
            checkScrollPosition(); // Initial check
            return () => container.removeEventListener("scroll", checkScrollPosition);
        }
    }, [steps]); // Rerun when steps change

    useEffect(() => {
        setCanScroll(steps.length > VISIBLE_CARDS);
        checkScrollPosition(); // Re-check scroll position if steps or visibility changes
    }, [steps, scrollContainerMaxHeight]);


    return (
        <main className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#1A0A1A] text-white pt-8 sm:pt-12 px-4 overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-xl"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-500/3 to-blue-500/3 rounded-full blur-2xl"
                />
            </div>

            {/* Enhanced Page Title with Mode Info */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-xl lg:max-w-7xl px-4 mt-12 sm:mt-16 mb-8 relative z-10"
            >
                <h2
                    className="text-5xl sm:text-6xl text-center bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4"
                    style={{ fontFamily: "'Caveat Brush', cursive" }}
                >
                    How to Play
                </h2>
                <p
                    className={`text-lg sm:text-xl text-center ${modeInfo.color} font-medium`}
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    {modeInfo.description}
                </p>

                {/* Mode Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex items-center justify-center mt-4"
                >
                    <span className={`flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-gradient-to-r ${modeInfo.gradientFrom} ${modeInfo.gradientTo} text-white text-sm font-bold`}>{modeInfo.name}</span>
                </motion.div>
            </motion.div>

            {/* Enhanced Steps Container */}
            <div
                ref={scrollContainerRef}
                className="w-full max-w-5xl space-y-6 px-4 pt-6 pb-4 overflow-y-auto scroll-smooth flex-grow relative z-10 custom-scrollbar"
                style={scrollContainerMaxHeight !== undefined ? {
                    maxHeight: `${scrollContainerMaxHeight}px`,
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
                } : {}}
            >
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.15 }}
                        className="group"
                    >
                        <div className="relative p-8 pt-12 rounded-3xl shadow-2xl transition-all duration-300 backdrop-blur-md border bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:from-white/15 hover:to-white/10 hover:shadow-2xl hover:scale-[1.02] transform">
                            {/* Enhanced Step Number Badge */}
                            <div className={`absolute -top-2 left-8 bg-gradient-to-r ${modeInfo.gradientFrom} ${modeInfo.gradientTo} text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg z-10 group-hover:scale-110 transition-transform duration-300`}>
                                <div className={`absolute inset-0 bg-gradient-to-r ${modeInfo.gradientFrom} ${modeInfo.gradientTo} rounded-full blur-sm opacity-50`}></div>
                                <span className="relative z-10">Step {step.stepNumber}</span>
                            </div>

                            <div className="flex items-start space-x-8 mt-2">
                                {/* Enhanced Icon Container */}
                                <div className={`flex-shrink-0 bg-gradient-to-br from-white/15 to-white/8 p-6 rounded-3xl border border-white/25 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <step.icon className={`text-5xl ${modeInfo.color} drop-shadow-lg`} />
                                </div>

                                {/* Enhanced Content */}
                                <div className="flex-1">
                                    <h3
                                        className="text-3xl text-white font-bold mb-4 group-hover:text-blue-200 transition-colors duration-300"
                                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                    >
                                        {step.title}
                                    </h3>
                                    <p
                                        className="text-neutral-300 leading-relaxed text-lg group-hover:text-neutral-200 transition-colors duration-300"
                                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                    >
                                        {step.description}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Line for non-last steps */}
                            {index < steps.length - 1 && (
                                <motion.div
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ duration: 0.5, delay: (index * 0.15) + 0.3 }}
                                    className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gradient-to-b ${modeInfo.gradientFrom} ${modeInfo.gradientTo} rounded-full origin-top opacity-60`}
                                />
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Enhanced Footer */}
            <div className="w-full mt-auto pt-8 pb-10 flex flex-col items-center relative z-10">
                {/* Scroll Indicator */}
                <motion.div
                    animate={{ opacity: canScroll && !isAtBottom ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-[-10px]"
                >
                    <FaChevronDown className="text-2xl text-white/40 animate-bounce" />
                </motion.div>

                {/* Enhanced Play Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <button
                        onClick={handlePlayGame}
                        className="relative group focus:outline-none"
                    >
                        {/* Enhanced Glowing Background */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${modeInfo.gradientFrom} ${modeInfo.gradientTo} rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300`} />

                        {/* Main Button */}
                        <div className={`relative bg-gradient-to-r ${modeInfo.gradientFrom} ${modeInfo.gradientTo} text-white font-bold py-6 px-20 rounded-3xl text-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border border-white/30 flex items-center gap-4`}
                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            <span className="relative z-10">เริ่มเล่น</span>
                            <FaPlay className="text-white text-xl" />
                        </div>
                    </button>
                </motion.div>
            </div>
        </main>
    );
}