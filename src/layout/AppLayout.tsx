import { ThemeToggle } from '../components/common/ThemeToggle'

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ThemeToggle variant="default" />
      {children}
    </>
  )
}
