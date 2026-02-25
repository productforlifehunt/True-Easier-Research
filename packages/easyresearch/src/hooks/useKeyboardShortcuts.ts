import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'k',
      cmd: true,
      action: () => {
        // Open quick search
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        } else {
          toast('Quick search: ⌘K', { icon: '🔍' });
        }
      },
      description: 'Quick search'
    },
    {
      key: 'n',
      cmd: true,
      action: () => navigate('/humans-for-hire/booking'),
      description: 'New booking'
    },
    {
      key: 'm',
      cmd: true,
      action: () => navigate('/humans-for-hire/messages'),
      description: 'Messages'
    },
    {
      key: 'd',
      cmd: true,
      action: () => navigate('/humans-for-hire/dashboard'),
      description: 'Dashboard'
    },
    {
      key: 'b',
      cmd: true,
      action: () => navigate('/humans-for-hire/browse'),
      description: 'Browse helpers'
    },
    {
      key: ',',
      cmd: true,
      action: () => navigate('/humans-for-hire/settings'),
      description: 'Settings'
    },
    {
      key: '/',
      cmd: true,
      shift: true,
      action: () => {
        // Show keyboard shortcuts help
        showShortcutsHelp();
      },
      description: 'Show shortcuts'
    },
    {
      key: 'Escape',
      action: () => {
        // Close modals or go back
        const modal = document.querySelector('[data-modal="true"]');
        if (modal) {
          (modal as HTMLElement).click();
        } else {
          window.history.back();
        }
      },
      description: 'Close/Back'
    }
  ];

  const showShortcutsHelp = () => {
    const helpContent = shortcuts
      .map(s => {
        const keys = [];
        if (s.cmd) keys.push('⌘');
        if (s.ctrl) keys.push('Ctrl');
        if (s.alt) keys.push('⌥');
        if (s.shift) keys.push('⇧');
        keys.push(s.key.toUpperCase());
        return `${keys.join(' ')} - ${s.description}`;
      })
      .join('\n');

    // Create native-looking modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      max-width: 400px;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
    `;

    modal.innerHTML = `
      <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600;">Keyboard Shortcuts</h3>
      <div style="font-size: 14px; line-height: 1.8; color: #666;">
        ${helpContent.split('\n').map(line => `<div style="padding: 4px 0;">${line}</div>`).join('')}
      </div>
      <button onclick="this.parentElement.remove()" style="
        margin-top: 20px;
        padding: 8px 16px;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
      ">Close</button>
    `;

    document.body.appendChild(modal);

    // Close on click outside
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
      z-index: 9999;
    `;
    backdrop.onclick = () => {
      modal.remove();
      backdrop.remove();
    };
    document.body.appendChild(backdrop);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Check if user is typing in an input field
    const isTyping = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName);
    
    shortcuts.forEach(shortcut => {
      const isMatch = 
        e.key.toLowerCase() === shortcut.key.toLowerCase() &&
        (shortcut.cmd ? (e.metaKey || e.ctrlKey) : true) &&
        (shortcut.ctrl ? e.ctrlKey : !shortcut.ctrl || true) &&
        (shortcut.alt ? e.altKey : !shortcut.alt || true) &&
        (shortcut.shift ? e.shiftKey : !shortcut.shift || true);

      if (isMatch) {
        // Don't trigger shortcuts while typing (except for Escape)
        if (isTyping && shortcut.key !== 'Escape') return;
        
        e.preventDefault();
        shortcut.action();
      }
    });
  }, [navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts, showShortcutsHelp };
};

export default useKeyboardShortcuts;
