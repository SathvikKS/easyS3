import { createContext, useContext, useEffect, useState } from 'react'

import { getSettingsSync, setTheme as persistTheme } from '@/lib/settings'
import type { ThemeMode } from '@/lib/settings'

type ThemeProviderState = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

function resolveAppliedTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function applyThemeClass(theme: ThemeMode): void {
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolveAppliedTheme(theme))
}

type ThemeProviderProps = {
  children: React.ReactNode
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps): React.JSX.Element {
  const [theme, setThemeState] = useState<ThemeMode>(() => getSettingsSync().theme)

  useEffect(() => {
    applyThemeClass(theme)

    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (): void => applyThemeClass('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = (next: ThemeMode): void => {
    setThemeState(next)
    void persistTheme(next)
  }

  return (
    <ThemeProviderContext.Provider {...props} value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
