/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useLayoutEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import ThemeToggle from '../ui/ThemeToggle';
import { IconLogo, IconMenu, IconX, IconArrowRight } from '../Icons/Icons';
import './Navbar.css';

const navLinks = [
  { label: 'Product', path: '/product' },
  { label: 'Solutions', path: '/solutions' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'About', path: '/about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const reduced = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useLayoutEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <motion.header
      className={`navbar ${scrolled ? 'is-scrolled' : ''}`}
      initial={reduced ? false : { y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav className="navbar-inner" aria-label="Main">
        <NavLink to="/" className="navbar-brand">
          <IconLogo size={30} />
          <span className="navbar-wordmark">
            Nexus<em>Voice</em>
          </span>
        </NavLink>

        <div className="navbar-links">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `navbar-link ${isActive ? 'is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <ThemeToggle className="navbar-theme" />

        <div className="navbar-actions">
          <NavLink to="/login" className="navbar-signin">
            Sign in
          </NavLink>
          <NavLink to="/contact" className="btn btn-ink btn-sm navbar-cta">
            Book a demo
            <IconArrowRight size={15} />
          </NavLink>
        </div>

        <button
          className="navbar-burger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <IconX size={22} /> : <IconMenu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar-sheet"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="navbar-sheet-inner">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => `navbar-sheet-link ${isActive ? 'is-active' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink to="/contact" className="navbar-sheet-link">
                Contact
              </NavLink>
              <div className="navbar-sheet-actions">
                <NavLink to="/login" className="btn btn-ghost">
                  Sign in
                </NavLink>
                <NavLink to="/contact" className="btn btn-ink">
                  Book a demo
                </NavLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
