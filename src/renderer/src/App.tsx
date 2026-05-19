import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ThemeProvider, useTheme } from '@/components/theme-provider'

function ThemeToggle(): React.JSX.Element {
  const { theme, setTheme } = useTheme()

  const resolved =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

function HelloWorld(): React.JSX.Element {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Hello, shadcn</CardTitle>
          <CardDescription>
            easyS3 &middot; Tailwind v4 + shadcn/ui is wired up.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          If this card is styled with rounded corners, a subtle border, and the theme
          toggle in the corner flips colors, your setup is working.
        </CardContent>
        <CardFooter>
          <Button>Get started</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function App(): React.JSX.Element {
  return (
    <ThemeProvider defaultTheme="system" storageKey="easys3-ui-theme">
      <HelloWorld />
    </ThemeProvider>
  )
}

export default App
