Interesting Feauter that can add to game.
- Gamification
    - Scoring System
    - Timer Challenge Mode
    - Streak System ✅ (Enhanced with 4-Tier system)
        - [Tier 1] - [2-4] - [WARMING UP!] - Yellow theme
        - [Tier 2] - [5-9] - [ON A ROLL!] - Red theme  
        - [Tier 3] - [10-19] - [IN THE ZONE!] - Orange theme with special effects
        - [Tier 4] - [20+] - [** UNSTOPPABLE! **] - Golden theme with crown and lightning
        - เหลือทำขอบจอให้เป็น effect
    - Achivements / Badges
- Learning Reinforcement
    - Display meaning and example Sentence
    - Review Mode (ทบทวนคำตอบที่ผิด) -> จบเกมอาจมีปุ่มทบทวนคำตอบที่ผิดโดยใช้แค่คำศัพท์จาก missedWords
    - Spaced Repetition System (SRS) -> หลักการคือ คำที่ตอบถูกจะถูกถามซ้ำในอีกระยะเวลาที่นานขึ้น ส่วนคำที่ตอบผิดจะถูกถามซ้ำเร็วขึ้นสามารถทำได้เมื่อมีระบบ User Account
- UX & Personalization
    - Settings Page
    - More Game Modes
- User Accounts


next: 
- applied challenge mode to each game mode. echo ✅, memory, meaning maybe same challenge logic but typing is not.
- applied scoring system into gameplay system.

- change the ui of difficulty to display only 2 items 1. Endless Mode 2. Selecting Difficulty (Display A1-C2 if user click to let them choose the difficult) ✅

Recent Updates:
- Enhanced Streak System with 4-Tier progression ✅
- Fixed Echo Mode timer system to stop when answer is submitted ✅
- Added comprehensive cleanup system for audio, timers, and speech synthesis ✅

Challenge Mode Concept:
- Applied Score System into each mode.
1. Echo Mode ✅: - can listening again only 1 times after that the speak again button will be disabled
                - there will be a timing for 5 seconds after finished speak to let user typed answer in time! ✅
                - timer stops immediately when answer is submitted ✅

2. Typing Mode: High-Speed Survival Run
                - There will have 15 seconds at the beginning and time will always decease every seconds
                - If user type correct they will get +2 seconds.
                - If user type wrong the will get -2 seoncs.
                - If ther's no time left or 0 seconds. the game will be over.

3. Memory Mode: (Precision Memory Under The Pressure)
                - Keep decreasing time of display vocab for each difficulty
                - After vocab disappear user will have countdown time for 5 seconds for each vocab
                - still have 3 lifes.

4. Meaning Match: (Filed of Deceptive Choices)
                - The will be a 4 choice instead of let user typing the answer.
                - The incorrect choice is three but it must be similar or confusing terms (words).
                - The will be 5 sec. to let user choose




COMPLETED ✅:
    1. timer system in echo mode ✅
    2. Enhanced 4-Tier Streak System ✅
    3. Comprehensive cleanup system ✅ 



next tomorrow:
    - แก้ไขส่วน ScoreBreakdownToast ให้เสร็จ
    - ทำให้ score เรืองแสงตามระดับ streak




*** ข้อเสนอแนะการปรับปรุง (sugguestion) ***
** High Priority **
- แยก useGameLogic: สร้าง custom hooks ย่อยๆ
- Add Error Boundaries: จัดการ error แบบ graceful
- Performance Optimization: ใช้ React.memo, useMemo, useCallback
- Mobile UX: ปรับปรุง touch experience
** Medium Priority **
- Testing: เพิ่ม unit tests สำหรับ game logic
- Bundle Optimization: ใช้ dynamic imports
- PWA Features: เพิ่มความสามารถ offline
- Analytics: ติดตาม user behavior
** Nice to Have **
- Storybook: สำหรับ component development
- E2E Testing: Playwright หรือ Cypress
- Performance Monitoring: Real User Monitoring
- Internationalization: รองรับภาษาอื่นๆ




*** ปัญหาใหญ่สำหรับ Mobile Devices ***

Objective: Implement a "Virtual Keyboard" for mobile devices to solve the native keyboard/zooming issue. We will use the react-simple-keyboard library as a "Portfolio-Ready" solution that balances high quality with reasonable implementation time.

Context:
The application is a vocabulary game where users type answers. On mobile devices, the native on-screen keyboard covers the UI and causes the browser to zoom into the input field, creating a poor user experience. The goal is to replace this with an in-app virtual keyboard that only appears on touch-enabled devices.

Step-by-Step Implementation Guide:

1. Install the necessary library:

Please add react-simple-keyboard to the project's dependencies.

2. Create a Device Detection Hook:

Create a new file at hooks/useDeviceDetection.ts.

This hook should determine if the user is on a touch-enabled device. It should only perform the check once on component mount.

It should return an object, for example: { isMobile: true }.

TypeScript

// hooks/useDeviceDetection.ts
import { useState, useEffect } from 'react';

export const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsMobile(isTouchDevice);
  }, []);

  return { isMobile };
};
3. Create the <VirtualKeyboard /> Component:

Create a new component file at components/game/VirtualKeyboard.tsx.

This component will wrap the react-simple-keyboard library.

It should accept a prop onKeyPress which is a function that handles the logic when a key is pressed.

Import the necessary CSS from the library.

TypeScript

// components/game/VirtualKeyboard.tsx
import React from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

interface VirtualKeyboardProps {
  onKeyPress: (button: string) => void;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onKeyPress }) => {
  // The handleKeyboardPress function will be the interface to the parent component.
  const handleKeyboardPress = (button: string) => {
    // We can handle special keys here if needed, or pass them up.
    // For example, `{bksp}` for backspace, `{enter}` for enter.
    onKeyPress(button);
  };

  return (
    <div className="virtual-keyboard-container w-full">
      <Keyboard
        onKeyPress={handleKeyboardPress}
        layout={{
          default: [
            "q w e r t y u i o p",
            "a s d f g h j k l",
            "{shift} z x c v b n m {bksp}",
            "{space}",
          ],
          shift: [
            "Q W E R T Y U I O P",
            "A S D F G H J K L",
            "{shift} Z X C V B N M {bksp}",
            "{space}",
          ],
        }}
        display={{
          '{bksp}': '⌫',
          '{enter}': 'Enter',
          '{shift}': '⇧',
          '{space}': ' ',
        }}
        theme={"hg-theme-default my-keyboard-theme"} // Add a custom class for styling
      />
    </div>
  );
};

export default VirtualKeyboard;
4. Modify the Game Input Field:

In the component that renders the game's text input (likely components/game/GameInput.tsx or a similar file), modify the <input> tag by adding the readOnly attribute. This will prevent the native mobile keyboard from appearing.

5. Conditionally Render the Virtual Keyboard:

In the main game page component (e.g., app/play/[modeId]/dda/play/page.tsx), use the useDeviceDetection hook.

Render the <VirtualKeyboard /> component only if isMobile is true.

Create a handler function (handleVirtualKeyPress) to receive key presses from the VirtualKeyboard component and update the game's state (which is managed by Zustand).

TypeScript

// In the main game page component

// ... other imports
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import VirtualKeyboard from '@/components/game/VirtualKeyboard';
import { useGameStore } from '@/lib/stores/gameStore'; // Assuming this is your store hook

// ... inside the component function
const { isMobile } = useDeviceDetection();
const { setUserInput, submitAnswer } = useGameStore((state) => ({
  setUserInput: state.setUserInput,
  submitAnswer: state.submitAnswer, // Assuming you have an action for this
}));

const handleVirtualKeyPress = (button: string) => {
  if (button === '{bksp}') {
    // Logic to remove the last character from userInput state
    setUserInput(currentInput => currentInput.slice(0, -1));
  } else if (button === '{enter}') {
    // Logic to submit the answer
    submitAnswer();
  } else if (button === '{space}') {
    setUserInput(currentInput => currentInput + ' ');
  } else if (button !== '{shift}') {
    // Append regular characters
    setUserInput(currentInput => currentInput + button);
  }
};

// ... in the JSX return
return (
  <main>
    {/* ... Other game UI ... */}
    
    {isMobile && <VirtualKeyboard onKeyPress={handleVirtualKeyPress} />}
  </main>
);
Summary of requirements for the AI Agent:

Install react-simple-keyboard.

Create hooks/useDeviceDetection.ts.

Create components/game/VirtualKeyboard.tsx.

Instruct on how to modify the game's input field to be readOnly.

Show how to conditionally render the VirtualKeyboard and handle its events in the main game component.