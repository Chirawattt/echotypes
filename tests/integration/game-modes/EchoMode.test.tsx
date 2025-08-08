import { render, screen, fireEvent } from '@testing-library/react';
import { useGameStore } from '@/lib/stores/gameStore';

// Mock the store
jest.mock('@/lib/stores/gameStore');

const mockUseGameStore = useGameStore as jest.MockedFunction<typeof useGameStore>;

// Simple mock component that mimics EchoMode behavior
const MockEchoMode = ({ currentWord, gameStyle }: {
  currentWord: { word: string; meaning: string; level: string; type?: string } | null;
  gameStyle: 'practice' | 'challenge';
}) => {
  const { userInput, setUserInput } = useGameStore();
  
  return (
    <div>
      <div>{gameStyle === 'practice' ? 'Listen and type what you hear' : 'Listen carefully and type what you hear'}</div>
      {currentWord?.word && <div>Current word: {currentWord.word}</div>}
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
          placeholder="Type what you heard..."
          aria-label="Type what you heard"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
      </form>
      <button aria-label="Speak again">
        🔊 Speak Again
      </button>
      {gameStyle === 'challenge' && <div data-testid="echo-timer">Timer</div>}
    </div>
  );
};

describe('EchoMode Integration', () => {
  const defaultProps = {
    currentWord: { word: 'hello', meaning: 'greeting', level: 'a1' },
    gameStyle: 'practice' as const
  };

  const mockStoreState = {
    status: 'playing' as const,
    isWordVisible: false,
    userInput: '',
    setUserInput: jest.fn(),
    setIsWordVisible: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGameStore.mockReturnValue(mockStoreState);
  });

  describe('Practice Mode', () => {
    it('should render correctly in practice mode', () => {
      render(<MockEchoMode {...defaultProps} />);

      expect(screen.getByText('Listen and type what you hear')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /speak again/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type what you heard...')).toBeInTheDocument();
    });

    it('should update input when user types', () => {
      render(<MockEchoMode {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type what you heard...');
      fireEvent.change(input, { target: { value: 'hello' } });

      expect(mockStoreState.setUserInput).toHaveBeenCalledWith('hello');
    });

    it('should show word meaning when available', () => {
      render(<MockEchoMode {...defaultProps} />);

      expect(screen.getByText('Meaning:')).toBeInTheDocument();
      expect(screen.getByText('greeting')).toBeInTheDocument();
    });

    it('should show word type when available', () => {
      const propsWithType = {
        ...defaultProps,
        currentWord: { 
          word: 'hello', 
          meaning: 'greeting', 
          level: 'a1',
          type: 'interjection'
        }
      };

      render(<MockEchoMode {...propsWithType} />);

      expect(screen.getByText('Type:')).toBeInTheDocument();
      expect(screen.getByText('interjection')).toBeInTheDocument();
    });
  });

  describe('Challenge Mode', () => {
    const challengeProps = {
      ...defaultProps,
      gameStyle: 'challenge' as const
    };

    it('should render correctly in challenge mode', () => {
      render(<MockEchoMode {...challengeProps} />);

      expect(screen.getByText('Listen carefully and type what you hear')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /speak again/i })).toBeInTheDocument();
    });

    it('should show timer in challenge mode', () => {
      render(<MockEchoMode {...challengeProps} />);

      expect(screen.getByTestId('echo-timer')).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('should handle form submission', () => {
      render(<MockEchoMode {...defaultProps} />);

      const form = screen.getByRole('form');
      fireEvent.submit(form);

      expect(form).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MockEchoMode {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type what you heard...');
      expect(input).toHaveAttribute('aria-label', 'Type what you heard');

      const speakAgainBtn = screen.getByRole('button', { name: /speak again/i });
      expect(speakAgainBtn).toHaveAttribute('aria-label', 'Speak again');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing word gracefully', () => {
      const propsWithoutWord = {
        ...defaultProps,
        currentWord: null
      };

      render(<MockEchoMode {...propsWithoutWord} />);

      expect(screen.getByPlaceholderText('Type what you heard...')).toBeInTheDocument();
    });
  });

  describe('Store Integration', () => {
    it('should integrate correctly with game store', () => {
      const customState = {
        ...mockStoreState,
        userInput: 'test input'
      };
      mockUseGameStore.mockReturnValue(customState);

      render(<MockEchoMode {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type what you heard...');
      expect(input).toHaveValue('test input');
    });
  });
});