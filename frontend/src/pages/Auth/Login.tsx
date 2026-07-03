import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Waveline from '../../components/ui/Waveline';
import {
  IconArrowRight,
  IconGoogle,
  IconLogo,
} from '../../components/Icons/Icons';
import './Login.css';

const transcript = [
  { who: 'CALLER', text: '…and can you do eight people on the patio?' },
  { who: 'AVA', text: 'Eight on the patio — done. Saturday at 7:30, under Priya.' },
];

export default function Login() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const completeLogin = () => {
    window.localStorage.setItem('nexusVoiceSession', 'active');
    navigate('/app/dashboard');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    completeLogin();
  };

  return (
    <main className="login">
      {/* ---- Brand panel ---- */}
      <section className="login-panel">
        <NavLink to="/" className="login-brand">
          <IconLogo size={32} />
          <span>
            Nexus<em>Voice</em>
          </span>
        </NavLink>

        <motion.div
          className="login-panel-body"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mono-label login-panel-label">Meanwhile, on your line</p>

          <div className="login-transcript">
            {transcript.map((line) => (
              <div key={line.text} className={`login-line ${line.who === 'AVA' ? 'is-agent' : ''}`}>
                <span className="mono">{line.who}</span>
                <p>{line.text}</p>
              </div>
            ))}
          </div>

          <div className="login-panel-stats mono">
            <div>
              <strong>23</strong>
              <span>calls today</span>
            </div>
            <div>
              <strong>9</strong>
              <span>bookings</span>
            </div>
            <div>
              <strong>0</strong>
              <span>missed</span>
            </div>
          </div>
        </motion.div>

        <div className="login-panel-wave">
          <Waveline height={28} color="var(--green-300)" opacity={0.4} />
        </div>
      </section>

      {/* ---- Form ---- */}
      <section className="login-form-side">
        <motion.div
          className="login-card"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="login-head">
            <h1>Back to the switchboard</h1>
            <p>Sign in to see what your agent has been up to.</p>
          </div>

          <button className="login-google" type="button" onClick={completeLogin}>
            <IconGoogle size={19} />
            Continue with Google
          </button>

          <div className="login-divider" role="separator">
            <span />
            <em>or</em>
            <span />
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Work email</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="form-field">
              <span>Password</span>
              <div className="login-password">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-show"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <div className="login-row">
              <label className="login-remember">
                <input type="checkbox" defaultChecked />
                Keep me signed in
              </label>
              <button type="button" className="login-forgot">
                Forgot password?
              </button>
            </div>

            <button className="btn btn-ink login-submit" type="submit">
              Sign in
              <IconArrowRight size={16} />
            </button>
          </form>

          <p className="login-foot">
            New to Nexus Voice? <NavLink to="/contact">Book a guided setup</NavLink>
          </p>
        </motion.div>
      </section>
    </main>
  );
}
