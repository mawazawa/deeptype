/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Module: Test Setup                                                                             ║
 * ║ Description: Setup file for configuring the test environment                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers)

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver

// Mock ResizeObserver
const mockResizeObserver = vi.fn()
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.ResizeObserver = mockResizeObserver

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock window.scrollTo
window.scrollTo = vi.fn()

// Mock console methods to catch errors
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return
  }
  originalConsoleError.call(console, ...args)
}

console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: React.createFactory()')
  ) {
    return
  }
  originalConsoleWarn.call(console, ...args)
}

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })