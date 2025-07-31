import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onNewTask?: () => void;
  onSearch?: () => void;
  onToggleView?: () => void;
  onEscape?: () => void;
}

export const useKeyboardShortcuts = ({
  onNewTask,
  onSearch,
  onToggleView,
  onEscape
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + N: Yeni görev
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        onNewTask?.();
      }
      
      // Ctrl/Cmd + K: Arama
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        onSearch?.();
      }
      
      // Ctrl/Cmd + V: View toggle
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        onToggleView?.();
      }
      
      // Escape: Modal kapat
      if (event.key === 'Escape') {
        onEscape?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNewTask, onSearch, onToggleView, onEscape]);
}; 