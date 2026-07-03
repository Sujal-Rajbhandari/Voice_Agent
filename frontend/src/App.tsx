import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { ThemeProvider } from './context/theme';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Product from './pages/Product/Product';
import Solutions from './pages/Solutions/Solutions';
import Pricing from './pages/Pricing/Pricing';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Login from './pages/Auth/Login';
import AppDashboard from './pages/AppDashboard/AppDashboard';

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
  },
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

function AnimatedRoutes({ showFooter }: { showFooter: boolean }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/product" element={<Product />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/app/dashboard" element={<AppDashboard />} />
          <Route path="/app/training" element={<AppDashboard />} />
          <Route path="/app/voice-agent" element={<AppDashboard />} />
          <Route path="/app/activity" element={<AppDashboard />} />
          <Route path="/app/settings" element={<AppDashboard />} />
        </Routes>
        {showFooter && <Footer />}
      </motion.div>
    </AnimatePresence>
  );
}

function AppChrome() {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');
  const isAuthRoute = location.pathname === '/login';
  const showMarketingChrome = !isAppRoute && !isAuthRoute;

  return (
    <>
      {showMarketingChrome && <Navbar />}
      <ScrollToTop />
      <AnimatedRoutes showFooter={showMarketingChrome} />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppChrome />
      </BrowserRouter>
    </ThemeProvider>
  );
}
