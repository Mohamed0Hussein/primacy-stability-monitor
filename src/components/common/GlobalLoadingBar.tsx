import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useTheme } from '../../hooks/useTheme'

// Lights up for every request to the backend — queries (getProducts, etc.)
// and mutations (insert/update product, add test result, login/signup) —
// with no per-call wiring needed. New API calls are covered automatically
// as long as they go through react-query.
export function GlobalLoadingBar() {
  const { theme } = useTheme()
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const active = isFetching > 0 || isMutating > 0

  if (!active) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-0.5 overflow-hidden"
      style={{ backgroundColor: `${theme.colors.primary}20` }}
      role="progressbar"
      aria-label="Loading"
    >
      <div
        className="h-full w-1/3 rounded-full animate-loading-bar"
        style={{ backgroundColor: theme.colors.primary }}
      />
    </div>
  )
}
