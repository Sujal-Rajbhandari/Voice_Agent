import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Reveal from '../../components/ui/Reveal';
import PageField from '../../components/ui/PageField';
import { KineticTitle, HeroParallax, ScrollCue } from '../../components/ui/HeroKit';
import {
  IconArrowRight,
  IconCheck,
  IconPhoneIncoming,
  IconPhoneOutgoing,
} from '../../components/Icons/Icons';
import './Solutions.css';

const industries = [
  {
    id: 'restaurants',
    label: 'Restaurants',
    headline: 'Friday, 7:40 PM. Three lines ringing. Nobody free.',
    pain: 'Every missed call during service is a table that books somewhere else.',
    handles: [
      'Takes reservations against your real floor plan and turn times',
      'Moves and cancels bookings, then refills the freed slot from the waitlist',
      'Answers the eternal questions — hours, parking, “do you do gluten-free?”',
      'Calls no-shows from last week with a win-back offer',
    ],
    sample: '“Party of six on Saturday — I have 6:30 or 9:00. The 9:00 comes with the patio.”',
    metric: { value: '+40', label: 'covers per week recovered, typical' },
  },
  {
    id: 'clinics',
    label: 'Clinics & studios',
    headline: 'Patients call to reschedule at 10 PM. Your desk closes at 5.',
    pain: 'After-hours calls become voicemails, and voicemails become no-shows.',
    handles: [
      'Books, moves, and cancels appointments around provider calendars',
      'Runs reminder calls the day before — confirmed, moved, or flagged',
      'Answers insurance, prep, and location questions from your approved facts',
      'Escalates anything clinical straight to your on-call line',
    ],
    sample: '“I can move your cleaning to Thursday at 2:00 with Dr. Osei. You’ll get a text to confirm.”',
    metric: { value: '-38%', label: 'fewer no-shows after reminder campaigns' },
  },
  {
    id: 'services',
    label: 'Home services',
    headline: 'You’re under a sink. The phone rings. That call was worth $400.',
    pain: 'Trades lose jobs to whoever answers first — usually a competitor’s office.',
    handles: [
      'Answers every call while your crew is on the job',
      'Qualifies the work, quotes your standard rates, books the slot',
      'Dispatches urgent jobs to the right tech with an address and summary',
      'Follows up on estimates that went quiet',
    ],
    sample: '“A leak under the kitchen sink — I can have someone there tomorrow between 9 and 11.”',
    metric: { value: '92%', label: 'of calls answered that used to ring out' },
  },
  {
    id: 'sales',
    label: 'Sales teams',
    headline: 'Your SDRs make 40 dials a day. The agent makes 400.',
    pain: 'Speed-to-lead decides deals, and human follow-up always slips.',
    handles: [
      'Calls inbound leads within two minutes of the form submit',
      'Qualifies with your questions and books meetings on reps’ calendars',
      'Works reactivation lists your team will never get to',
      'Logs every conversation to the CRM with outcome and next step',
    ],
    sample: '“Sounds like the Growth plan fits. Does Thursday at 2 work for a demo with Sam?”',
    metric: { value: '9%', label: 'of cold list converted to booked meetings' },
  },
];

const directions = [
  {
    Icon: IconPhoneIncoming,
    title: 'Inbound — never miss demand',
    points: [
      'Answers in two rings, 24/7, in 50+ languages',
      'Books, reschedules, answers, escalates',
      'Your greeting, your tone, your rules',
    ],
  },
  {
    Icon: IconPhoneOutgoing,
    title: 'Outbound — create demand',
    points: [
      'Campaigns from lists or CRM segments',
      'Reminders, win-backs, lead qualification',
      'Compliant calling windows and opt-outs',
    ],
  },
];

export default function Solutions() {
  const [active, setActive] = useState(industries[0]);
  const reduced = useReducedMotion();

  return (
    <div className="solutions">
      <PageField />

      {/* ---- Hero ---- */}
      <section className="solutions-hero page-hero">
        <HeroParallax className="container page-hero-inner field-scrim">
          <Reveal y={14}>
            <p className="eyebrow">Solutions</p>
          </Reveal>
          <KineticTitle
            className="page-hero-title"
            lines={[
              { text: 'Built for businesses' },
              { text: 'that live on the phone.', accent: true },
            ]}
          />
          <Reveal delay={0.55} y={18}>
            <p className="hero-oneliner">
              It learns your industry’s calls and handles them like your best front desk.
            </p>
          </Reveal>
        </HeroParallax>
        <ScrollCue label="Pick your industry" />
      </section>

      {/* ---- Industry switcher ---- */}
      <section className="industries">
        <div className="container">
          <div className="industry-tabs" role="tablist" aria-label="Industries">
            {industries.map((ind) => (
              <button
                key={ind.id}
                role="tab"
                aria-selected={active.id === ind.id}
                className={`industry-tab ${active.id === ind.id ? 'is-active' : ''}`}
                onClick={() => setActive(ind)}
              >
                {ind.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              className="industry-panel card"
              role="tabpanel"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="industry-main">
                <h2>{active.headline}</h2>
                <p className="industry-pain">{active.pain}</p>
                <ul className="industry-handles">
                  {active.handles.map((h) => (
                    <li key={h}>
                      <IconCheck size={15} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <aside className="industry-side">
                <div className="industry-sample">
                  <span className="mono-label">The agent, on a real call</span>
                  <p>{active.sample}</p>
                  <span className="eq industry-eq" aria-hidden="true">
                    <span /><span /><span /><span /><span />
                  </span>
                </div>
                <div className="industry-metric">
                  <strong className="mono">{active.metric.value}</strong>
                  <span>{active.metric.label}</span>
                </div>
              </aside>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ---- Both directions ---- */}
      <section className="directions night-section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow eyebrow--night">One line, two jobs</p>
              <h2 className="section-title">Catch the calls you get. Make the calls you don’t.</h2>
            </div>
          </Reveal>

          <div className="directions-grid">
            {directions.map((d, i) => (
              <Reveal key={d.title} delay={i * 0.1}>
                <article className="direction-card">
                  <span className="direction-icon">
                    <d.Icon size={22} />
                  </span>
                  <h3>{d.title}</h3>
                  <ul>
                    {d.points.map((p) => (
                      <li key={p}>
                        <IconCheck size={14} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="solutions-cta">
        <div className="container">
          <Reveal>
            <div className="solutions-cta-inner">
              <h2>Not on the list? It still answers.</h2>
              <p>
                If your business takes calls, the agent can learn it. Tell us what your
                phone sounds like on a busy day.
              </p>
              <NavLink to="/contact" className="btn btn-ink">
                Talk to us <IconArrowRight size={16} />
              </NavLink>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
