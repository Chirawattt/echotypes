"use client";

import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaVolumeUp, FaKeyboard, FaPlay, FaChevronDown, FaBrain, FaMousePointer } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";

interface HowToPlayStep {
    stepNumber: string;
    title: string;
    description: string;
    icon: React.ElementType;
}

const steps: HowToPlayStep[] = [
    {
        stepNumber: "1",
        title: "ท่านจะได้ยินเสียงคำศัพท์",
        description: "อัตโนมัติหนึ่งรอบ หากฟังไม่ทันสามารถกดปุ่มลำโพงเพื่อฟังอีกรอบได้",
        icon: FaVolumeUp,
    },
    {
        stepNumber: "2",
        title: "พิมพ์คำศัพท์ตามที่ท่านได้ยิน",
        description: "เมื่อท่านมั่นใจในคำตอบแล้ว สามารถพิมพ์คำตอบและกด Enter หรือกดปุ่มส่งได้เลย",
        icon: FaKeyboard,
    },
    {
        stepNumber: "3",
        title: "จำคำศัพท์ที่ปรากฏ",
        description: "คำศัพท์จะแสดงขึ้นมาชั่วครู่ แล้วคุณจะต้องพิมพ์ตามความจำ",
        icon: FaBrain,
    },
    {
        stepNumber: "4",
        title: "คลิกเลือกคำตอบที่ถูกต้อง",
        description: "จะมีตัวเลือกคำศัพท์ปรากฏขึ้นมา ให้คลิกเลือกคำที่ได้ยิน",
        icon: FaMousePointer,
    },
    {
        stepNumber: "5",
        title: "ดูผลลัพธ์และคะแนน",
        description: "หลังจบเกมจะมีการสรุปผลคะแนนและคำที่ตอบถูก/ผิด",
        icon: FaPlay,
    },
];

const VISIBLE_CARDS = 3;

export default function HowToPlayPage() {
    const router = useRouter();
    const params = useParams();
    const modeId = params.modeId as string;
    const difficultyId = params.difficultyId as string;

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [steps]); // Rerun when steps change

    useEffect(() => {
        setCanScroll(steps.length > VISIBLE_CARDS);
        checkScrollPosition(); // Re-check scroll position if steps or visibility changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [steps, scrollContainerMaxHeight]);


    return (
        <main className="flex flex-col items-center justify-start min-h-screen bg-[#101010] text-white pt-8 sm:pt-12 px-4">

            {/* Page Title */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-xl lg:max-w-7xl px-4 mt-20 sm:mt-24 mb-8 sm:mb-10" // Existing class
            >
                <h2 className="text-5xl text-center opacity-80" style={{ fontFamily: "'Caveat Brush', cursive" }}>How to Play the Game.</h2>
            </motion.div >

            {/* Scrollable How to Play Steps Container */}
            <div
                ref={scrollContainerRef}
                className="w-full max-w-4xl space-y-6 pl-2 pr-6 sm:pl-0 sm:pr-4 overflow-y-auto custom-scrollbar-preline snap-y snap-mandatory scroll-smooth flex-grow" // Existing classes + overflow & scrollbar
                style={scrollContainerMaxHeight !== undefined ? { maxHeight: `${scrollContainerMaxHeight}px` } : {}} // Dynamic maxHeight
            >
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.15 + 0.4 }}
                        // Existing card classes - ensure they are consistent with your original design
                        className="flex items-center space-x-4 sm:space-x-6 relative border border-neutral-700 bg-neutral-800 px-8 py-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 snap-start" // Added snap-start
                    >
                        {/* Step Number */}
                        <div
                            className="text-8xl sm:text-9xl text-white/80 font-bold flex-shrink-0"
                            style={{ fontFamily: "'Caveat Brush', cursive", lineHeight: '1' }}
                        >
                            {step.stepNumber}
                        </div>

                        {/* Step Details */}
                        <div className="flex-1 pt-2 sm:pt-3 border-l border-neutral-700 pl-4 sm:pl-6">
                            <h3
                                className="text-2xl sm:text-3xl text-white/90 font-semibold mb-1 sm:mb-1.5"
                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                            >
                                {step.title}
                            </h3>
                            <p className="text-sm sm:text-base text-white/70" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                {step.description}
                            </p>
                        </div>

                        {/* Icon */}
                        <div className="flex flex-col items-center h-full pt-2 sm:pt-3">
                            <div className="bg-white/70 p-3 sm:p-4 rounded-full shadow-md">
                                <step.icon className="text-5xl text-[#101010]" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer: Arrow Down and Play Button */}
            <div className="relative w-full mt-auto pt-8 pb-10 flex flex-col items-center">
                {/* Animated Scroll Down Arrow */}
                <motion.div
                    animate={{ opacity: canScroll && !isAtBottom ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-[-10px]"
                >
                    <FaChevronDown className="text-3xl text-white/50 animate-bounce" />
                </motion.div>

                {/* Play Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Button
                        onClick={handlePlayGame}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-10 rounded-lg text-2xl transition-all 
                        duration-300 ease-in-out shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/40 flex items-center 
                         transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50 cursor-pointer"
                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    >
                        <span>เริ่มเล่น</span>
                        <FaPlay className="text-white text-base transition-transform duration-300 group-hover:scale-110" />
                    </Button>
                </motion.div>
            </div>
        </main>
    );
}