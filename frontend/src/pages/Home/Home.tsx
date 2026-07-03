import { lazy, Suspense, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, useScroll, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/theme';
import Reveal from '../../components/ui/Reveal';
import { KineticTitle, HeroParallax, ScrollCue } from '../../components/ui/HeroKit';

const VoiceField = lazy(() => import('../../components/ui/VoiceField'));
import {
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconClock,
  IconHeadset,
  IconPhoneIncoming,
  IconPhoneOutgoing,
  IconChat,
} from '../../components/Icons/Icons';
import './Home.css';

/* ---- Hero live call ---- */

const callScript = [
  { who: 'caller', text: 'Hi — do you have anything for four people around eight tonight?' },
  { who: 'agent', text: 'We do. I have 8:15 on the patio or 8:30 inside — which works better?' },
  { who: 'caller', text: 'Patio sounds great.' },
  { who: 'agent', text: 'Done — table for four at 8:15 on the patio. You’ll get a text confirmation in a moment.' },
] as const;

function LiveCallCard() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(reduced ? callScript.length + 1 : 0);

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => {
      setStep((s) => (s >= callScript.length + 2 ? 0 : s + 1));
    }, 2100);
    return () => clearInterval(interval);
  }, [reduced]);

  const visibleLines = callScript.slice(0, Math.min(step, callScript.length));
  const showResult = step > callScript.length;
  const agentSpeaking = step > 0 && step <= callScript.length && callScript[step - 1].who === 'agent';

  return (
    <div className="live-call card" role="img" aria-label="Example of the agent answering a reservation call">
      <div className="live-call-head">
        <span className="chip chip--live">On the line</span>
        <span className="mono live-call-number">(415) 555-0182</span>
        <span className="mono live-call-timer">
          <IconClock size={13} />
          00:{String(12 + Math.min(step, callScript.length) * 9).padStart(2, '0')}
        </span>
      </div>

      <div className="live-call-body">
        <AnimatePresence initial={false}>
          {visibleLines.map((line, i) => (
            <motion.div
              key={i}
              className={`call-line call-line--${line.who}`}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="call-line-who mono">{line.who === 'agent' ? 'AVA' : 'CALLER'}</span>
              <p>{line.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>

        {showResult && (
          <motion.div
            className="call-result"
            initial={reduced ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <IconCheck size={15} />
            <span className="mono">Reservation created · Patio · 8:15 PM · 4 guests</span>
          </motion.div>
        )}
      </div>

      <div className="live-call-foot">
        <span className={`eq ${agentSpeaking ? '' : 'eq--idle'}`} aria-hidden="true">
          <span /><span /><span /><span /><span />
        </span>
        <span className="mono-label">Ava · answering for Meridian Bistro</span>
      </div>
    </div>
  );
}

/* ---- Page data ---- */

const tickerEvents = [
  { tag: 'ANSWERED', text: '00:42 · reservation booked — patio, 8:15 PM' },
  { tag: 'OUTBOUND', text: '02:13 · demo scheduled, Thursday 2:00 PM' },
  { tag: 'ANSWERED', text: '00:18 · hours question resolved' },
  { tag: 'RESCHEDULED', text: '01:05 · moved 7:00 → 8:30, slot refilled' },
  { tag: 'WIN-BACK', text: '00:51 · callback message left' },
  { tag: 'ESCALATED', text: '01:48 · billing dispute → Maria, with summary' },
  { tag: 'ANSWERED', text: '00:33 · booked in Spanish, confirmation sent' },
];

const readout = [
  { value: '2 rings', label: 'to answer, day or night' },
  { value: '98%', label: 'of calls resolved without staff' },
  { value: '50+', label: 'languages spoken fluently' },
  { value: '24/7', label: 'on the line, including holidays' },
];

const inboundRows = [
  {
    Icon: IconCalendar,
    title: 'Reservations & bookings',
    desc: 'Checks real availability, books the slot, and confirms by text — while the caller is still on the line.',
    sample: 'Table for four at eight — booked in 14 seconds.',
  },
  {
    Icon: IconClock,
    title: 'Changes & cancellations',
    desc: 'Reschedules and cancels without phone tag, and frees the slot for the next caller.',
    sample: 'Moved 7:00 to 8:30 — confirmation sent.',
  },
  {
    Icon: IconChat,
    title: 'Everyday questions',
    desc: 'Answers from your hours, menu, prices, and policies. It only says what you’ve approved.',
    sample: '“Yes, the patio is dog-friendly.”',
  },
  {
    Icon: IconHeadset,
    title: 'Human handoff',
    desc: 'Senses when a call needs a person and transfers it warm — with a summary, not a cold start.',
    sample: 'Transferred to Maria with a three-line brief.',
  },
];

const campaignRows = [
  { name: 'Priya Sharma', number: '(628) 555-0107', status: 'connected', detail: 'Asking about Tuesday slots' },
  { name: 'Tom Okafor', number: '(415) 555-0173', status: 'booked', detail: 'Demo booked · Thu 2:00 PM' },
  { name: 'Dana Liu', number: '(510) 555-0148', status: 'ringing', detail: 'Second attempt' },
  { name: 'Sam Whitfield', number: '(925) 555-0121', status: 'voicemail', detail: 'Left callback message' },
];

const steps = [
  {
    num: '01',
    title: 'Connect your number',
    desc: 'Forward your existing line or pick a new one. No hardware, nothing to install — calls just start routing.',
  },
  {
    num: '02',
    title: 'Teach it your business',
    desc: 'Hours, menu, booking rules, tone of voice. It reads your site and docs, and you approve every answer.',
  },
  {
    num: '03',
    title: 'Put it on the line',
    desc: 'Run test calls until it sounds right. Go live when you’re ready — and listen in whenever you want.',
  },
];

const integrations = [
  'Twilio', 'Google Calendar', 'OpenTable', 'HubSpot', 'Salesforce',
  'Slack', 'Zendesk', 'Calendly', 'Stripe', 'Gmail',
];

const testimonials = [
  {
    quote: 'We seat about forty more covers a week now — all calls that used to ring out during Friday service.',
    author: 'Dana Cho',
    role: 'Owner, Meridian Bistro · San Francisco',
  },
  {
    quote: 'Patients reschedule at 10 PM and nobody stays late. The morning list is just… already done.',
    author: 'Dr. Lena Osei',
    role: 'Director, Fairview Dental Clinic',
  },
  {
    quote: 'It called 600 cold leads in a week. My two reps only spoke to the nine percent who picked up and wanted to talk.',
    author: 'Marcus Reyes',
    role: 'Founder, Northbeam Realty',
  },
];

const statusLabel: Record<string, { chip: string; text: string }> = {
  connected: { chip: 'chip--live', text: 'Connected' },
  booked: { chip: 'chip--live', text: 'Booked' },
  ringing: { chip: 'chip--ringing', text: 'Ringing' },
  voicemail: { chip: 'chip--idle', text: 'Voicemail' },
};

export default function Home() {
  const { scrollYProgress } = useScroll();
  const { theme } = useTheme();

  return (
    <div className="home">
      <Suspense fallback={null}>
        <VoiceField scrollProgress={scrollYProgress} dark={theme === 'dark'} />
      </Suspense>

      {/* ============ HERO ============ */}
      <section className="hero">
        <HeroParallax className="container hero-grid">
          <div className="hero-copy">
            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              AI voice agent for business phone lines
            </motion.p>

            <KineticTitle
              className="hero-title"
              lines={[
                { text: 'Every call answered.' },
                { text: 'Every lead called.', accent: true },
              ]}
            />

            <motion.p
              className="hero-oneliner"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              An AI agent on your real number — it books, reschedules, and makes
              the follow-up calls your team never gets to.
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.6 }}
            >
              <NavLink to="/contact" className="btn btn-ink">
                Book a demo
                <IconArrowRight size={16} />
              </NavLink>
              <NavLink to="/product" className="btn btn-ghost">
                See how it works
              </NavLink>
            </motion.div>
          </div>

          <motion.div
            className="hero-demo"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <LiveCallCard />
          </motion.div>
        </HeroParallax>
        <ScrollCue />
      </section>

      {/* ============ LIVE TICKER ============ */}
      <section className="ticker" aria-label="Recent calls handled by the agent">
        <div className="ticker-track">
          {[...tickerEvents, ...tickerEvents].map((event, i) => (
            <span className="ticker-item mono" key={i} aria-hidden={i >= tickerEvents.length}>
              <strong>{event.tag}</strong>
              {event.text}
            </span>
          ))}
        </div>
      </section>

      {/* ============ READOUT STRIP ============ */}
      <section className="readout">
        <div className="container">
          <Reveal>
            <dl className="readout-row">
              {readout.map((item) => (
                <div className="readout-item" key={item.value}>
                  <dt className="readout-value mono">{item.value}</dt>
                  <dd className="readout-label">{item.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ============ LINE 01 / INBOUND ============ */}
      <section className="inbound">
        <div className="container inbound-grid">
          <div className="inbound-intro">
            <Reveal>
              <p className="eyebrow">Line 01 / Inbound</p>
              <h2 className="section-title">The front desk that never steps away</h2>
              <p className="section-sub">
                Your callers get a calm, capable voice that knows your business — not a phone
                tree. It resolves the call or hands it to the right person with context.
              </p>
              <NavLink to="/solutions" className="inbound-link">
                See it in your industry <IconArrowRight size={15} />
              </NavLink>
            </Reveal>
          </div>

          <div className="inbound-rows">
            {inboundRows.map((row, i) => (
              <Reveal key={row.title} delay={i * 0.07}>
                <article className="inbound-row card card-hover">
                  <span className="inbound-row-icon">
                    <row.Icon size={21} />
                  </span>
                  <div className="inbound-row-text">
                    <h3>{row.title}</h3>
                    <p>{row.desc}</p>
                    <span className="inbound-sample mono">→ {row.sample}</span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WINDOW — the line, live ============ */}
      <div className="line-window" aria-hidden="true">
        <span className="mono-label line-window-label">The line is live — listening, speaking, booking</span>
      </div>

      {/* ============ LINE 02 / OUTBOUND ============ */}
      <section className="outbound night-section">
        <div className="container outbound-grid">
          <div className="outbound-intro">
            <Reveal>
              <p className="eyebrow eyebrow--night">Line 02 / Outbound</p>
              <h2 className="section-title">Follow-ups that actually happen</h2>
              <p className="section-sub outbound-sub">
                Point it at a list and it dials — warm leads within minutes of signing up,
                no-show reminders the day before, win-back calls to customers gone quiet.
                Your team only joins when someone says yes.
              </p>
              <ul className="outbound-points">
                {[
                  'Calls new leads while they’re still on your website',
                  'Reminders that cut no-shows before they happen',
                  'Every conversation logged to your CRM, automatically',
                ].map((point) => (
                  <li key={point}>
                    <IconCheck size={15} />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="outbound-console-wrap">
            <div className="outbound-console">
              <div className="console-head">
                <div>
                  <span className="mono-label console-eyebrow">Campaign</span>
                  <strong>October reactivation</strong>
                </div>
                <span className="chip chip--live">Running</span>
              </div>

              <div className="console-stats mono">
                <div><strong>412</strong><span>dialed</span></div>
                <div><strong>38%</strong><span>connected</span></div>
                <div><strong>64</strong><span>booked</span></div>
              </div>

              <ul className="console-rows">
                {campaignRows.map((row) => (
                  <li className="console-row" key={row.name}>
                    <div className="console-row-id">
                      <strong>{row.name}</strong>
                      <span className="mono">{row.number}</span>
                    </div>
                    <span className="console-row-detail">{row.detail}</span>
                    <span className={`chip ${statusLabel[row.status].chip}`}>
                      {statusLabel[row.status].text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="how">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">From signup to first call</p>
              <h2 className="section-title">Live in an afternoon, not a quarter</h2>
            </div>
          </Reveal>

          <div className="how-steps">
            {steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 0.1}>
                <article className="how-step">
                  <span className="how-num mono">{step.num}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <div className="integrations">
              <span className="mono-label">Works with</span>
              <ul className="integrations-list">
                {integrations.map((name) => (
                  <li key={name} className="mono">{name}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="voices">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">From the call logs</p>
              <h2 className="section-title">Teams that stopped missing calls</h2>
            </div>
          </Reveal>

          <div className="voices-grid">
            {testimonials.map((t, i) => (
              <Reveal key={t.author} delay={i * 0.09}>
                <figure className="voice-card card">
                  <blockquote>“{t.quote}”</blockquote>
                  <figcaption>
                    <strong>{t.author}</strong>
                    <span>{t.role}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA WINDOW ============ */}
      <section className="cta-window">
        <div className="container">
          <Reveal>
            <div className="cta-inner">
              <h2 className="cta-title">Put your line to work.</h2>
              <p className="cta-sub">
                Fifteen minutes with our team, and you’ll hear your own business answered
                by the agent — live, on a real call.
              </p>
              <div className="cta-actions">
                <NavLink to="/contact" className="btn btn-ink">
                  Book a demo
                  <IconArrowRight size={16} />
                </NavLink>
                <NavLink to="/login" className="btn btn-ghost">
                  Sign in
                </NavLink>
              </div>
              <div className="cta-meta">
                <span><IconPhoneIncoming size={14} /> Inbound answering</span>
                <span><IconPhoneOutgoing size={14} /> Outbound campaigns</span>
                <span><IconCheck size={14} /> Keep your number</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
