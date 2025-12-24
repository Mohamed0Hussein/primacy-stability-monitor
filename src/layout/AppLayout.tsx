import { StatusBar } from '../components/common/StatusBar'
import { ToastContainer } from '../components/common/ToastContainer'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme()
  const { toasts, removeToast } = useToast()

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
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  )
}
