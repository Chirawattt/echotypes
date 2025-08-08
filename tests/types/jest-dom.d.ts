import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveValue(value: string | number): R;
      toBeVisible(): R;
      toBeEnabled(): R;
      toBeDisabled(): R;
      toHaveClass(className: string): R;
      toHaveStyle(style: Record<string, unknown>): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveAccessibleName(name: string | RegExp): R;
      toHaveAccessibleDescription(description: string | RegExp): R;
      toBeValidWord(): R;
      toBeValidGameState(): R;
    }
  }
}