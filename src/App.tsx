import ThemeProvider from './contexts/ThemeContext';
import { AuthComponent } from './components/AuthComponent';
import { AnimatedBackground } from './components/AnimatedBackground';

function App() {
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <AuthComponent />
    </ThemeProvider>
  );
}

export default App;