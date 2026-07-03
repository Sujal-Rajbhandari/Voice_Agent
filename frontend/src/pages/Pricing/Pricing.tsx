import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Reveal from '../../components/ui/Reveal';
import PageField from '../../components/ui/PageField';
import { KineticTitle, HeroParallax, ScrollCue } from '../../components/ui/HeroKit';
import { IconArrowRight, IconCheck, IconChevronDown } from '../../components/Icons/Icons';
import './Pricing.css';

const plans = [
  {
    name: 'Front Desk',
    price: '$99',
    period: '/line · month',
    blurb: 'For one location that needs every call answered.',
    minutes: '300 talk minutes included',
    features: [
      'Inbound answering 24/7',
      'Reservations, changes, cancellations',
      'Calendar & booking sync',
      'Call transcripts & summaries',
      'SMS confirmations',
      'Email support',
    ],
    cta: 'Start with Front Desk',
    featured: false,
  },
  {
    name: 'Full Line',
    price: '$299',
    period: '/line · month',
    blurb: 'Inbound and outbound — the whole phone, handled.',
    minutes: '1,500 talk minutes included',
    features: [
      'Everything in Front Desk',
      'Outbound campaigns & follow-ups',
      'Speed-to-lead calling from your CRM',
      'Warm transfer to your team',
      'Sentiment & intent analytics',
      'Priority support',
    ],
    cta: 'Start with Full Line',
    featured: true,
  },
  {
    name: 'Switchboard',
    price: 'Custom',
    period: 'multi-location & volume',
    blurb: 'For groups, franchises, and call centers.',
    minutes: 'Pooled minutes across locations',
    features: [
      'Everything in Full Line',
      'Unlimited lines & shared knowledge',
      'SIP trunking & number porting',
      'SSO and role-based access',
      'Dedicated success engineer',
      'SLA with uptime guarantee',
    ],
    cta: 'Talk to sales',
    featured: false,
  },
];

const faqs = [
  {
    q: 'What happens if I use all my minutes?',
    a: 'Calls keep getting answered — overage is billed at $0.12 per minute, and we alert you at 80% so there are no surprises. You can also cap usage and route overflow to voicemail.',
  },
  {
    q: 'Can I keep my existing phone number?',
    a: 'Yes. Most businesses simply forward their current number, which takes about five minutes. You can also port the number in fully, or get a fresh local number from us.',
  },
  {
    q: 'How long does setup actually take?',
    a: 'Connecting a number takes minutes. Teaching the agent your business — hours, menu, booking rules — usually takes an afternoon, and you test with real calls before going live.',
  },
  {
    q: 'What does the agent do when it gets stuck?',
    a: 'It follows your escalation rules: transfer to a person with a summary, take a message, or schedule a callback. It never guesses at answers you haven’t approved.',
  },
  {
    q: 'Is outbound calling compliant?',
    a: 'Campaigns enforce calling windows, honor do-not-call lists, identify themselves honestly, and handle opt-outs automatically. You stay in control of every script.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  return (
    <div className={`faq-item ${open ? 'is-open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <IconChevronDown size={18} className="faq-chevron" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="faq-a-wrap"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="faq-a">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Pricing() {
  return (
    <div className="pricing">
      <PageField />

      <section className="pricing-hero page-hero">
        <HeroParallax className="container page-hero-inner field-scrim">
          <Reveal y={14}>
            <p className="eyebrow">Pricing</p>
          </Reveal>
          <KineticTitle
            className="page-hero-title"
            lines={[
              { text: 'Less than a shift.' },
              { text: 'On the line all month.', accent: true },
            ]}
          />
          <Reveal delay={0.55} y={18}>
            <p className="hero-oneliner">
              Per line, talk minutes included. No setup fee, cancel monthly.
            </p>
          </Reveal>
        </HeroParallax>
        <ScrollCue label="Three plans" />
      </section>

      <section className="plans">
        <div className="container">
          <div className="plans-grid">
            {plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.08}>
                <article className={`plan card ${plan.featured ? 'plan--featured' : ''}`}>
                  {plan.featured && <span className="plan-flag mono">Most popular</span>}
                  <h2 className="plan-name">{plan.name}</h2>
                  <p className="plan-blurb">{plan.blurb}</p>
                  <div className="plan-price">
                    <strong className="mono">{plan.price}</strong>
                    <span>{plan.period}</span>
                  </div>
                  <p className="plan-minutes mono">{plan.minutes}</p>
                  <ul className="plan-features">
                    {plan.features.map((f) => (
                      <li key={f}>
                        <IconCheck size={15} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <NavLink
                    to="/contact"
                    className={`btn ${plan.featured ? 'btn-green' : 'btn-ghost'} plan-cta`}
                  >
                    {plan.cta}
                    <IconArrowRight size={15} />
                  </NavLink>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <p className="plans-note">
              Talk minutes count connected time only — rings and voicemails are free.
              Overage at $0.12/minute, alerted at 80%.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pricing-faq">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Before you ask</p>
              <h2 className="section-title">Fair questions, straight answers</h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="faq-list">
              {faqs.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pricing-cta">
        <div className="container">
          <Reveal>
            <div className="pricing-cta-inner">
              <h2>Try it on your own number.</h2>
              <p>Book a demo and hear the agent answer your business — before you pay anything.</p>
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
