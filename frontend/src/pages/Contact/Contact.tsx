import { useState } from 'react';
import Reveal from '../../components/ui/Reveal';
import PageField from '../../components/ui/PageField';
import {
  IconCheck,
  IconPhone,
  IconMail,
  IconClock,
} from '../../components/Icons/Icons';
import './Contact.css';

const interests = ['Inbound answering', 'Outbound campaigns', 'Both directions'];

const nextSteps = [
  {
    Icon: IconPhone,
    title: 'We call you',
    desc: 'Within one business day — and yes, our own agent makes that call.',
  },
  {
    Icon: IconClock,
    title: '15-minute walkthrough',
    desc: 'You describe a busy day on your phone; we show how the agent would handle it.',
  },
  {
    Icon: IconCheck,
    title: 'Hear your own demo line',
    desc: 'We set up a test number with your hours and menu so you can call it yourself.',
  },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [interest, setInterest] = useState(interests[2]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    setSubmitted(true);
  };

  return (
    <div className="contact">
      <PageField />

      <section className="contact-main">
        <div className="container contact-grid">
          <div className="contact-intro field-scrim">
            <Reveal>
              <p className="eyebrow">Contact</p>
              <h1 className="contact-title">
                Tell us what your phone
                <span> sounds like on a busy day.</span>
              </h1>
              <p className="contact-sub">
                Missed reservations? Follow-up calls that never happen? Describe it and
                we’ll show you exactly how the agent would take it off your hands.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="contact-steps">
                <span className="mono-label">What happens next</span>
                {nextSteps.map((step) => (
                  <div className="contact-step" key={step.title}>
                    <span className="contact-step-icon">
                      <step.Icon size={17} />
                    </span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="contact-direct">
                <span className="mono-label">Prefer to talk right now?</span>
                <a href="tel:+14155550100" className="contact-phone mono">
                  <IconPhone size={16} />
                  (415) 555-0100
                </a>
                <p>Our agent answers this line. Ask it anything about the product.</p>
                <a href="mailto:hello@nexusvoice.ai" className="contact-email">
                  <IconMail size={15} />
                  hello@nexusvoice.ai
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="contact-form-wrap">
            {submitted ? (
              <div className="contact-done card">
                <span className="contact-done-icon">
                  <IconCheck size={26} />
                </span>
                <h2>Got it — expect our call.</h2>
                <p>
                  We’ll ring you within one business day. If you booked a specific time,
                  the calendar invite is already on its way.
                </p>
                <button className="btn btn-ghost" onClick={() => setSubmitted(false)}>
                  Send another message
                </button>
              </div>
            ) : (
              <form className="contact-form card" onSubmit={handleSubmit}>
                <div className="form-row">
                  <label className="form-field">
                    <span>Name <em aria-hidden="true">*</em></span>
                    <input type="text" name="name" autoComplete="name" required placeholder="Dana Cho" />
                  </label>
                  <label className="form-field">
                    <span>Work email <em aria-hidden="true">*</em></span>
                    <input type="email" name="email" autoComplete="email" required placeholder="dana@meridianbistro.com" />
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-field">
                    <span>Company</span>
                    <input type="text" name="company" autoComplete="organization" placeholder="Meridian Bistro" />
                  </label>
                  <label className="form-field">
                    <span>Phone</span>
                    <input type="tel" name="phone" autoComplete="tel" placeholder="(415) 555-0182" />
                  </label>
                </div>

                <fieldset className="form-field">
                  <legend>I’m interested in</legend>
                  <div className="interest-row">
                    {interests.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        className={`interest-chip ${interest === opt ? 'is-active' : ''}`}
                        onClick={() => setInterest(opt)}
                        aria-pressed={interest === opt}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="form-field">
                  <span>What does a busy day on your phone look like?</span>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Friday nights we miss 10–15 calls during service. Mostly reservations and 'are you open' questions…"
                  />
                </label>

                <button type="submit" className="btn btn-green contact-submit" disabled={sending}>
                  {sending ? 'Sending…' : 'Request a demo call'}
                </button>
                <p className="contact-form-note">
                  No spam, no sequence — one call from a person (well, mostly).
                </p>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
