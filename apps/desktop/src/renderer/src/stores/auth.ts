/**
 * Auth Store - manages user authentication state
 */

import { create } from 'zustand'
import { toast } from '@multica/ui/components/ui/sonner'
import type { AuthUser } from '@multica/types'

export type { AuthUser }

interface AuthState {
  // State
  sid: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  loadAuth: () => Promise<void>
  saveAuth: (sid: string, user: AuthUser) => Promise<void>
  clearAuth: () => Promise<void>
  startLogin: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  sid: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Load auth data from local file
  loadAuth: async () => {
    set({ isLoading: true })
    try {
      const data = await window.electronAPI.auth.load()
      if (data?.sid && data?.user) {
        set({
          sid: data.sid,
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        })
        console.log('[AuthStore] Auth loaded:', data.user.name)
      } else {
        set({
          sid: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
        console.log('[AuthStore] No auth data found')
      }
    } catch (error) {
      console.error('[AuthStore] Failed to load auth:', error)
      set({
        sid: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  // Save auth data to local file
  saveAuth: async (sid: string, user: AuthUser) => {
    try {
      const success = await window.electronAPI.auth.save(sid, user)
      if (success) {
        set({
          sid,
          user,
          isAuthenticated: true,
        })
        console.log('[AuthStore] Auth saved:', user.name)
      }
    } catch (error) {
      console.error('[AuthStore] Failed to save auth:', error)
    }
  },

  // Clear auth data (logout)
  clearAuth: async () => {
    try {
      await window.electronAPI.auth.clear()
      set({
        sid: null,
        user: null,
        isAuthenticated: false,
      })
      toast('Signed out')
      console.log('[AuthStore] Auth cleared')
    } catch (error) {
      console.error('[AuthStore] Failed to clear auth:', error)
    }
  },

  // Start login flow (opens browser)
  startLogin: () => {
    console.log('[AuthStore] Starting login...')
    window.electronAPI.auth.startLogin()
  },
}))

/**
 * Setup auth callback listener
 * Call this once in App.tsx, returns cleanup function
 */
export function setupAuthCallbackListener(): () => void {
  window.electronAPI.auth.onAuthCallback(async (data) => {
    if (data.sid && data.user) {
      useAuthStore.setState({
        sid: data.sid,
        user: data.user,
        isAuthenticated: true,
      })
      // Use a fixed ID to prevent duplicate toasts
      toast.success(`Welcome back, ${data.user.name}`, { id: 'auth-welcome' })
    }
  })

  return () => {
    window.electronAPI.auth.offAuthCallback()
  }
}
