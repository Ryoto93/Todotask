import { useEffect } from 'react';

interface KeyboardShortcuts {
  onAddTask: () => void;
  onToggleCompleted: () => void;
  onDeleteTask: () => void;
  onNavigateUp: () => void;
  onNavigateDown: () => void;
  onToggleTheme: () => void;
  onShowCompleted: () => void;
}

export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcuts,
  isInputFocused: boolean = false
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (isInputFocused || (e.target as HTMLElement)?.tagName === 'INPUT') {
        return;
      }

      const { key, ctrlKey, metaKey } = e;
      const isModifierPressed = ctrlKey || metaKey;

      switch (key.toLowerCase()) {
        case 'a':
        case 'n':
          if (isModifierPressed) {
            e.preventDefault();
            shortcuts.onAddTask();
          }
          break;
        case 'd':
        case ' ':
          if (isModifierPressed) {
            e.preventDefault();
            shortcuts.onToggleCompleted();
          }
          break;
        case 'backspace':
          if (isModifierPressed) {
            e.preventDefault();
            shortcuts.onDeleteTask();
          }
          break;
        case 'arrowup':
          e.preventDefault();
          shortcuts.onNavigateUp();
          break;
        case 'arrowdown':
          e.preventDefault();
          shortcuts.onNavigateDown();
          break;
        case 't':
          if (isModifierPressed) {
            e.preventDefault();
            shortcuts.onToggleTheme();
          }
          break;
        case 'h':
          if (isModifierPressed) {
            e.preventDefault();
            shortcuts.onShowCompleted();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, isInputFocused]);
};