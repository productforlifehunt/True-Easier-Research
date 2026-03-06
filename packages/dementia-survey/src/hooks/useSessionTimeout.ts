// Session timeout hook - DISABLED
// Removed unnecessary event listeners that fired on every user interaction.

export function useSessionTimeout() {
  return {
    extendSession: () => {},
    getTimeRemaining: () => Infinity,
    isSessionActive: () => true,
    resetTimeout: () => {}
  }
}
