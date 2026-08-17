import { StatusBar } from '../components/common/StatusBar'
import { GlobalLoadingBar } from '../components/common/GlobalLoadingBar'
import { useTheme } from '../hooks/useTheme'
import { UpdateNotifier } from '../components/UpdateNotifier'

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
      <GlobalLoadingBar />
      <StatusBar />
      <main className="flex-1 flex flex-col relative">
        {children}
      </main>
      <UpdateNotifier />
    </div>
  )
}
