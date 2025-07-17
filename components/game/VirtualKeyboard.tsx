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
            "{space} {enter}",
          ],
          shift: [
            "Q W E R T Y U I O P",
            "A S D F G H J K L",
            "{shift} Z X C V B N M {bksp}",
            "{space} {enter}",
          ],
        }}
        display={{
          '{bksp}': '⌫',
          '{enter}': '📤 Submit',
          '{shift}': '⇧',
          '{space}': 'Space',
        }}
        buttonTheme={[
          {
            class: "hg-enter-button",
            buttons: "{enter}"
          },
          {
            class: "hg-space-button", 
            buttons: "{space}"
          }
        ]}
        theme={"hg-theme-default my-keyboard-theme"} // Add a custom class for styling
      />
    </div>
  );
};

export default VirtualKeyboard;
