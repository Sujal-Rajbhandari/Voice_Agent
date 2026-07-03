import { NavLink } from 'react-router-dom';
import Reveal from '../../components/ui/Reveal';
import PageField from '../../components/ui/PageField';
import { KineticTitle, HeroParallax, ScrollCue } from '../../components/ui/HeroKit';
import {
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconCpu,
  IconGlobe,
  IconHeadset,
  IconShield,
  IconAnalytics,
  IconDialpad,
  IconMegaphone,
  IconClock,
} from '../../components/Icons/Icons';
import './Product.css';

const callFlow = [
  {
    time: '00:00.0',
    title: 'The phone rings',
    desc: 'A caller dials your number — the one on your door and your website. Nothing about it changes.',
  },
  {
    time: '00:01.8',
    title: 'Answered on the second ring',
    desc: 'The agent picks up with your greeting, in your tone. No menu, no “press 1”, no hold music.',
  },
  {
    time: '00:14.2',
    title: 'It understands the request',
    desc: 'Natural turn-taking, interruptions handled, accents understood. It asks only what it needs to.',
  },
  {
    time: '00:38.6',
    title: 'It takes the action',
    desc: 'Checks live availability, books the table, moves the appointment, or answers from your approved facts.',
  },
  {
    time: '00:51.0',
    title: 'It confirms',
    desc: 'The caller hears the confirmation and gets a text. Sensitive calls transfer warm to your team.',
  },
  {
    time: '00:55.4',
    title: 'Your team gets the record',
    desc: 'Transcript, outcome, sentiment, and next step — logged to your CRM before the line goes quiet.',
  },
];

const capabilities = [
  {
    Icon: IconCpu,
    title: 'A voice people stay on the line with',
    desc: 'Sub-second responses and natural pacing. Callers regularly finish the call without realizing they spoke to an agent.',
  },
  {
    Icon: IconGlobe,
    title: '50+ languages, one number',
    desc: 'It greets in your default language and switches the moment the caller does — mid-sentence if needed.',
  },
  {
    Icon: IconCalendar,
    title: 'Real actions, not notes',
    desc: 'Writes to your calendar, booking system, and CRM directly. A booked table is booked, not “requested”.',
  },
  {
    Icon: IconShield,
    title: 'Says only what you approved',
    desc: 'Answers come from your facts — menu, prices, policies. It never invents a discount or promises a refund.',
  },
  {
    Icon: IconHeadset,
    title: 'Knows when to hand off',
    desc: 'Complaints, emergencies, VIPs — your rules decide what transfers to a human, with a summary attached.',
  },
  {
    Icon: IconAnalytics,
    title: 'Every call becomes data',
    desc: 'Transcripts, intents, outcomes, and missed-demand trends, searchable in the dashboard the next second.',
  },
];

const outboundFeatures = [
  {
    Icon: IconMegaphone,
    title: 'Campaigns from a list',
    desc: 'Upload a CSV or sync your CRM segment. The agent dials, talks, books, and logs — at whatever pace you set.',
  },
  {
    Icon: IconClock,
    title: 'Speed-to-lead in minutes',
    desc: 'New signup on your website? It calls while your business is still on their mind — not three days later.',
  },
  {
    Icon: IconDialpad,
    title: 'Compliant by default',
    desc: 'Calling windows, do-not-call lists, opt-out handling, and local caller ID are enforced on every campaign.',
  },
];

const integrationGroups = [
  { label: 'Telephony', items: ['Twilio', 'Vonage', 'SIP trunking', 'Number porting'] },
  { label: 'Calendars & booking', items: ['Google Calendar', 'OpenTable', 'Calendly', 'Square Appointments'] },
  { label: 'CRM & support', items: ['HubSpot', 'Salesforce', 'Zendesk', 'Intercom'] },
  { label: 'Team & billing', items: ['Slack', 'Gmail', 'Stripe', 'Zapier'] },
];

export default function Product() {
  return (
    <div className="product">
      <PageField />

      {/* ---- Hero ---- */}
      <section className="product-hero page-hero">
        <HeroParallax className="container page-hero-inner field-scrim">
          <Reveal y={14}>
            <p className="eyebrow">Product</p>
          </Reveal>
          <KineticTitle
            className="page-hero-title"
            lines={[
              { text: 'One agent.' },
              { text: 'Both directions', accent: true },
              { text: 'of your line.', accent: true },
            ]}
          />
          <Reveal delay={0.55} y={18}>
            <p className="hero-oneliner">
              The front desk that never steps away — and the rep who actually calls back.
            </p>
          </Reveal>
          <Reveal delay={0.7} y={18}>
            <div className="page-hero-actions">
              <NavLink to="/contact" className="btn btn-ink">
                Book a demo <IconArrowRight size={16} />
              </NavLink>
              <NavLink to="/pricing" className="btn btn-ghost">
                See pricing
              </NavLink>
            </div>
          </Reveal>
        </HeroParallax>
        <ScrollCue label="The anatomy of a call" />
      </section>

      {/* ---- Anatomy of a call ---- */}
      <section className="callflow">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Anatomy of a call</p>
              <h2 className="section-title">Fifty-five seconds, start to logged</h2>
              <p className="section-sub">
                This is a real reservation call, step by step. The timestamps are typical,
                not best-case.
              </p>
            </div>
          </Reveal>

          <ol className="callflow-list">
            {callFlow.map((step, i) => (
              <Reveal key={step.time} delay={i * 0.06}>
                <li className="callflow-step">
                  <span className="callflow-time mono">{step.time}</span>
                  <span className="callflow-rail" aria-hidden="true" />
                  <div className="callflow-text">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Capabilities ---- */}
      <section className="capabilities">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Under the hood</p>
              <h2 className="section-title">Built to be trusted with your phone number</h2>
            </div>
          </Reveal>

          <div className="capabilities-grid">
            {capabilities.map((cap, i) => (
              <Reveal key={cap.title} delay={(i % 3) * 0.08}>
                <article className="capability card card-hover">
                  <span className="capability-icon">
                    <cap.Icon size={21} />
                  </span>
                  <h3>{cap.title}</h3>
                  <p>{cap.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Outbound band ---- */}
      <section className="product-outbound night-section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow eyebrow--night">Outbound</p>
              <h2 className="section-title">The dial tone works for you too</h2>
              <p className="section-sub product-outbound-sub">
                Reminders, reactivations, lead qualification — the calls your team means
                to make and never gets to.
              </p>
            </div>
          </Reveal>

          <div className="product-outbound-grid">
            {outboundFeatures.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <article className="product-outbound-card">
                  <span className="product-outbound-icon">
                    <f.Icon size={20} />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Integrations ---- */}
      <section className="product-integrations">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Integrations</p>
              <h2 className="section-title">Plugs into what you already run</h2>
            </div>
          </Reveal>

          <div className="integration-groups">
            {integrationGroups.map((group, i) => (
              <Reveal key={group.label} delay={i * 0.06}>
                <div className="integration-group">
                  <h3 className="mono-label">{group.label}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>
                        <IconCheck size={14} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="product-cta">
        <div className="container">
          <Reveal>
            <div className="product-cta-card card">
              <div>
                <h2>Hear it answer your business.</h2>
                <p>We’ll set up a live test line with your hours and menu before the demo call ends.</p>
              </div>
              <NavLink to="/contact" className="btn btn-ink">
                Book a demo <IconArrowRight size={16} />
              </NavLink>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
