"use client";

import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    className?: string;
    style?: React.CSSProperties;
}

export default function AnimatedNumber({ value, duration = 0.8, className = "", style }: AnimatedNumberProps) {
    const motionValue = useMotionValue(value);
    const spring = useSpring(motionValue, {
        damping: 20,
        stiffness: 100,
        duration: duration * 1000 // Convert to milliseconds
    });
    
    const displayValue = useTransform(spring, (current) => Math.round(current));

    useEffect(() => {
        motionValue.set(value);
    }, [value, motionValue]);

    return (
        <motion.span 
            className={className}
            style={style}
        >
            <motion.span>
                {displayValue}
            </motion.span>
        </motion.span>
    );
}