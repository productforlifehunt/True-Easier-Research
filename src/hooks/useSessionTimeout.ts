// Session timeout hook - DISABLED
// This was adding 6 event listeners (mousedown, mousemove, keypress, scroll, touchstart, click)
// that fired on every user interaction for no purpose (timeout was already disabled).
// Removed to eliminate unnecessary overhead.

export function useSessionTimeout() {
  return {
    extendSession: () => {},
    getTimeRemaining: () => Infinity,
    isSessionActive: () => true,
    resetTimeout: () => {}
  }
}
