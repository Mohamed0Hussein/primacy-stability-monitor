import { StatusBar } from '../components/common/StatusBar'

import { useTheme } from '../hooks/useTheme'

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme()

  return (
    <div 
      className="min-h-screen w-full flex flex-col transition-colors duration-300"
      style={{ 
        backgroundColor: theme.colors.background,
        color: theme.colors.text
      }}
    >
      <StatusBar />
      <main className="flex-1 flex flex-col relative">
        {children}
      </main>
    </div>
  )
}
