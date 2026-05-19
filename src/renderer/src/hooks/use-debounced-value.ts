import * as React from 'react'

/**
 * Returns a value that updates after `delayMs` of stability.
 * The input can update every render; filtering/API calls should use the debounced result.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    if (delayMs <= 0) {
      setDebouncedValue(value)
      return
    }

    const timer = window.setTimeout(() => setDebouncedValue(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debouncedValue
}
