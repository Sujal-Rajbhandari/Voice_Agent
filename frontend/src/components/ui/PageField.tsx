import { lazy, Suspense } from 'react';
import { useScroll } from 'framer-motion';
import { useTheme } from '../../context/theme';

const VoiceField = lazy(() => import('./VoiceField'));

/** The live voice field, wired to page scroll and theme — drop into any page root. */
export default function PageField() {
  const { scrollYProgress } = useScroll();
  const { theme } = useTheme();

  return (
    <Suspense fallback={null}>
      <VoiceField scrollProgress={scrollYProgress} dark={theme === 'dark'} />
    </Suspense>
  );
}
