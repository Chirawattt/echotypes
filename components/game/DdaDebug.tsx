// DDA Debug Component
// คอมโพเนนต์สำหรับแสดงข้อมูล DDA ใน development mode

import React from 'react';
import { mapLevelToDisplayName } from '@/lib/difficultyHelpers';

interface DdaDebugProps {
    currentDifficultyLevel: number;
    performanceScore: number;
    gameStyle: 'practice' | 'challenge';
    modeId: string;
    isVisible?: boolean;
}

export default function DdaDebug({ 
    currentDifficultyLevel, 
    performanceScore, 
    gameStyle, 
    modeId, 
    isVisible = true 
}: DdaDebugProps) {
    // Only show in development mode and for challenge mode (except meaning-match)
    const shouldShow = process.env.NODE_ENV === 'development' && 
                      isVisible && 
                      gameStyle === 'challenge' && 
                      modeId !== 'meaning-match';

    if (!shouldShow) return null;

    return (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-sm font-mono z-50 min-w-[200px]">
            <div className="text-yellow-400 font-bold mb-2">DDA Debug</div>
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span>Level:</span>
                    <span className="text-cyan-400">{mapLevelToDisplayName(currentDifficultyLevel)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Score:</span>
                    <span className={`${performanceScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {performanceScore}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>Mode:</span>
                    <span className="text-blue-400">{modeId}</span>
                </div>
                <div className="flex justify-between">
                    <span>Style:</span>
                    <span className="text-purple-400">{gameStyle}</span>
                </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
                DDA adjusts difficulty based on performance
            </div>
        </div>
    );
}
