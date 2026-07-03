import { NavLink } from 'react-router-dom';
import Waveline from '../ui/Waveline';
import { IconLogo, IconTwitter, IconLinkedin, IconGithub, IconYoutube } from '../Icons/Icons';
import './Footer.css';

const footerLinks = {
  Product: [
    { label: 'Inbound answering', path: '/product' },
    { label: 'Outbound campaigns', path: '/product' },
    { label: 'Call analytics', path: '/product' },
    { label: 'Integrations', path: '/product' },
  ],
  Solutions: [
    { label: 'Restaurants', path: '/solutions' },
    { label: 'Clinics & studios', path: '/solutions' },
    { label: 'Sales teams', path: '/solutions' },
    { label: 'Service businesses', path: '/solutions' },
  ],
  Company: [
    { label: 'About', path: '/about' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Contact', path: '/contact' },
    { label: 'Careers', path: '/about' },
  ],
};

const socials = [
  { Icon: IconTwitter, label: 'Twitter' },
  { Icon: IconLinkedin, label: 'LinkedIn' },
  { Icon: IconGithub, label: 'GitHub' },
  { Icon: IconYoutube, label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <NavLink to="/" className="footer-logo">
              <IconLogo size={34} />
              <span>
                Nexus<em>Voice</em>
              </span>
            </NavLink>
            <p className="footer-tagline">
              The AI agent that answers your phone, books the table, and makes the follow-up call.
            </p>
            <div className="footer-socials">
              {socials.map(({ Icon, label }) => (
                <a key={label} href="#" className="footer-social" aria-label={label}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-cols">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="footer-col">
                <h4 className="footer-col-title">{category}</h4>
                <ul>
                  {links.map((link) => (
                    <li key={link.label}>
                      <NavLink to={link.path} className="footer-link">
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-wave">
          <Waveline height={24} color="var(--green-300)" opacity={0.45} />
        </div>

        <div className="footer-bottom">
          <p>© 2026 Nexus Voice. All rights reserved.</p>
          <div className="footer-status">
            <span className="footer-status-dot" />
            <span className="mono">All lines operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
