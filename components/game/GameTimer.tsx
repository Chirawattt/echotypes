import { motion } from 'framer-motion';

interface GameTimerProps {
    modeId: string;
    currentTime: { minutes: number; seconds: number };
}

export default function GameTimer({ modeId, currentTime }: GameTimerProps) {
    if (modeId === 'typing') {
        return null; // Timer is handled in GameHeader for typing mode
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center items-center py-1 relative z-10 shrink-0"
            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-300 text-center"
            >
                {String(currentTime.minutes).padStart(2, '0')}:{String(currentTime.seconds).padStart(2, '0')}
            </motion.div>
        </motion.div>
    );
}
