import { Toaster as Sonner } from 'sonner'

import { useTheme } from '@/components/theme-provider'

function Toaster(): React.JSX.Element {
  const { theme } = useTheme()

  const resolvedTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-md group-[.toaster]:rounded-lg group-[.toaster]:text-[13px]',
          description: 'group-[.toast]:text-muted-foreground group-[.toast]:text-[12px]',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:text-xs',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:text-xs'
        }
      }}
    />
  )
}

export { Toaster }
