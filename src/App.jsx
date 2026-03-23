import { MotionConfig } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PREMIUM_SPRING } from './lib/motion';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <MotionConfig transition={PREMIUM_SPRING} reducedMotion="never">
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
