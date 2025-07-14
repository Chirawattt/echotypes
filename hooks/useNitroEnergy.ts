import { useState, useEffect, useCallback, useRef } from 'react';

interface UseNitroEnergyProps {
    isTypingMode: boolean;
    isGameActive: boolean;
    onEnergyDepleted: () => void;
    energyDecayInterval?: number; // For overdrive system
}

export function useNitroEnergy({ isTypingMode, isGameActive, onEnergyDepleted, energyDecayInterval = 1000 }: UseNitroEnergyProps) {
    const [energy, setEnergy] = useState(10); // Start with 10 points
    const [maxEnergy] = useState(15); // Maximum energy cap at 15 points
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = useRef(false); // Flag to prevent early game over

    // Energy decreases based on overdrive interval when game is active
    useEffect(() => {
        if (isTypingMode && isGameActive && energy > 0) {
            // Mark as initialized when game becomes active
            isInitializedRef.current = true;
            
            intervalRef.current = setInterval(() => {
                setEnergy(prev => {
                    const newEnergy = prev - 1; // ลดลง 1 แต้มทุกๆ interval
                    return Math.max(0, newEnergy); // ป้องกันไม่ให้ติดลบ
                });
            }, energyDecayInterval); // ใช้ interval จาก overdrive system

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
    }, [isTypingMode, isGameActive, energy, energyDecayInterval]);

    // Handle energy depletion in separate useEffect to avoid setState during render
    // Only trigger game over if game has been properly initialized
    useEffect(() => {
        if (energy <= 0 && isTypingMode && isGameActive && isInitializedRef.current) {
            onEnergyDepleted();
        }
    }, [energy, isTypingMode, isGameActive, onEnergyDepleted]);

    // Add energy for correct answers
    const addEnergy = useCallback((wordLength: number) => {
        if (!isTypingMode) return;

        let energyBonus = 1.5; // Base bonus points
        
        // Calculate bonus based on word length
        if (wordLength >= 7) {
            energyBonus = 2.5;
        } else if (wordLength >= 5) {
            energyBonus = 2.0;
        } else if (wordLength >= 3) {
            energyBonus = 1.5;
        }

        setEnergy(prev => Math.min(prev + energyBonus, maxEnergy));
    }, [isTypingMode, maxEnergy]);

    // Remove energy for wrong answers
    const removeEnergy = useCallback(() => {
        if (!isTypingMode) return;

        setEnergy(prev => {
            const newEnergy = prev - 3; // ลด 3 แต้ม
            return Math.max(0, newEnergy); // ป้องกันไม่ให้ติดลบ
        });
    }, [isTypingMode]);

    // Reset energy
    const resetEnergy = useCallback(() => {
        setEnergy(10); // Reset to 10 points
        isInitializedRef.current = false; // Reset initialization flag
    }, []);

    // Check if energy is low (less than 3 points)
    const isLowEnergy = energy < 3 && energy > 0;

    return {
        energy,
        maxEnergy,
        isLowEnergy,
        addEnergy,
        removeEnergy,
        resetEnergy
    };
}
