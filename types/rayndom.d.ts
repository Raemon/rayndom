export {}
declare global {
  interface Window {
    rayndom?: { focusMainWindow?: () => Promise<void> }
  }
}
