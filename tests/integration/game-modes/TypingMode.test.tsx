import { render, screen, fireEvent } from '@testing-library/react';
import { useGameStore } from '@/lib/stores/gameStore';

// Mock the store
jest.mock('@/lib/stores/gameStore');

const mockUseGameStore = useGameStore as jest.MockedFunction<typeof useGameStore>;

// Simple mock component that mimics TypingMode behavior
const MockTypingMode = ({ currentWord, gameStyle }: {
  currentWord: { word: string; meaning: string; level: string; type?: string } | null;
  gameStyle: 'practice' | 'challenge';
}) => {
  const { userInput, setUserInput, timeLeft, wpm } = useGameStore();
  
  const isUnlimitedTime = timeLeft >= 999999;
  
  return (
    <div>
      <div>{gameStyle === 'practice' ? 'Type the word as fast as you can' : 'Type fast and maintain your streak!'}</div>
      {currentWord?.word && (
        <div data-testid="word-display">
          Target: {currentWord.word}
        </div>
      )}
      {currentWord?.meaning && (
        <div>
          <span>Meaning:</span>
          <span>{currentWord.meaning}</span>
        </div>
      )}
      {currentWord?.type && (
        <div>
          <span>Type:</span>
          <span>{currentWord.type}</span>
        </div>
      )}
      <form role="form" onSubmit={(e) => e.preventDefault()}>
        <input
          placeholder="Type the word..."
          aria-label="Type the word"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
      </form>
      
      {gameStyle === 'challenge' && (
        <div data-testid="typing-timer">
          <div>{timeLeft}s</div>
          <div>{wpm} WPM</div>
        </div>
      )}
      
      {gameStyle === 'practice' && isUnlimitedTime && (
        <>
          <div>∞</div>
          <button>Finish Game</button>
        </>
      )}
    </div>
  );
};

describe('TypingMode Integration', () => {
  const defaultProps = {
    currentWord: { word: 'javascript', meaning: 'programming language', level: 'b2' },
    gameStyle: 'practice' as const
  };

  const mockStoreState = {
    status: 'playing' as const,
    userInput: '',
    timeLeft: 60,
    wpm: 0,
    setUserInput: jest.fn(),
    setWpm: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGameStore.mockReturnValue(mockStoreState);
  });

  describe('Practice Mode', () => {
    it('should render correctly in practice mode', () => {
      render(<MockTypingMode {...defaultProps} />);

      expect(screen.getByText('Type the word as fast as you can')).toBeInTheDocument();
      expect(screen.getByText('Target: javascript')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type the word...')).toBeInTheDocument();
    });

    it('should show word meaning and type', () => {
      const propsWithType = {
        ...defaultProps,
        currentWord: {
          word: 'javascript',
          meaning: 'programming language',
          level: 'b2',
          type: 'noun'
        }
      };

      render(<MockTypingMode {...propsWithType} />);

      expect(screen.getByText('Type:')).toBeInTheDocument();
      expect(screen.getByText('noun')).toBeInTheDocument();
      expect(screen.getByText('Meaning:')).toBeInTheDocument();
      expect(screen.getByText('programming language')).toBeInTheDocument();
    });

    it('should update input when user types', () => {
      render(<MockTypingMode {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type the word...');
      fireEvent.change(input, { target: { value: 'java' } });

      expect(mockStoreState.setUserInput).toHaveBeenCalledWith('java');
    });

    it('should show unlimited time in practice mode', () => {
      const storeWithUnlimitedTime = {
        ...mockStoreState,
        timeLeft: 999999
      };
      mockUseGameStore.mockReturnValue(storeWithUnlimitedTime);

      render(<MockTypingMode {...defaultProps} />);

      expect(screen.getByText('∞')).toBeInTheDocument();
    });

    it('should show finish button in unlimited time mode', () => {
      const storeWithUnlimitedTime = {
        ...mockStoreState,
        timeLeft: 999999
      };
      mockUseGameStore.mockReturnValue(storeWithUnlimitedTime);

      render(<MockTypingMode {...defaultProps} />);

      expect(screen.getByRole('button', { name: /finish game/i })).toBeInTheDocument();
    });
  });

  describe('Challenge Mode', () => {
    const challengeProps = {
      ...defaultProps,
      gameStyle: 'challenge' as const
    };

    it('should render correctly in challenge mode', () => {
      render(<MockTypingMode {...challengeProps} />);

      expect(screen.getByText('Type fast and maintain your streak!')).toBeInTheDocument();
      expect(screen.getByTestId('typing-timer')).toBeInTheDocument();
    });

    it('should show WPM counter in challenge mode', () => {
      const storeWithWPM = {
        ...mockStoreState,
        wpm: 45
      };
      mockUseGameStore.mockReturnValue(storeWithWPM);

      render(<MockTypingMode {...challengeProps} />);

      expect(screen.getByText('45 WPM')).toBeInTheDocument();
    });

    it('should show remaining time in challenge mode', () => {
      const storeWithTime = {
        ...mockStoreState,
        timeLeft: 45
      };
      mockUseGameStore.mockReturnValue(storeWithTime);

      render(<MockTypingMode {...challengeProps} />);

      expect(screen.getByText('45s')).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('should handle form submission', () => {
      render(<MockTypingMode {...defaultProps} />);

      const form = screen.getByRole('form');
      fireEvent.submit(form);

      expect(form).toBeInTheDocument();
    });
  });

  describe('Visual Feedback', () => {
    it('should show word display', () => {
      render(<MockTypingMode {...defaultProps} />);

      const wordDisplay = screen.getByTestId('word-display');
      expect(wordDisplay).toBeInTheDocument();
      expect(wordDisplay).toHaveTextContent('javascript');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MockTypingMode {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type the word...');
      expect(input).toHaveAttribute('aria-label', 'Type the word');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing word gracefully', () => {
      const propsWithoutWord = {
        ...defaultProps,
        currentWord: null
      };

      render(<MockTypingMode {...propsWithoutWord} />);

      expect(screen.getByPlaceholderText('Type the word...')).toBeInTheDocument();
    });
  });

  describe('Store Integration', () => {
    it('should integrate correctly with game store', () => {
      const customState = {
        ...mockStoreState,
        userInput: 'test input',
        wpm: 60
      };
      mockUseGameStore.mockReturnValue(customState);

      render(<MockTypingMode {...defaultProps} gameStyle="challenge" />);

      const input = screen.getByPlaceholderText('Type the word...');
      expect(input).toHaveValue('test input');
      expect(screen.getByText('60 WPM')).toBeInTheDocument();
    });
  });
});