import { NavLink } from 'react-router-dom';
import Reveal from '../../components/ui/Reveal';
import PageField from '../../components/ui/PageField';
import { KineticTitle, HeroParallax, ScrollCue } from '../../components/ui/HeroKit';
import { IconArrowRight } from '../../components/Icons/Icons';
import './About.css';

const principles = [
  {
    num: '01',
    title: 'The caller comes first',
    desc: 'If a conversation is better handled by a human, the agent hands it over — fast, warm, and with context. We optimize for resolved calls, not deflected ones.',
  },
  {
    num: '02',
    title: 'Never invent an answer',
    desc: 'The agent speaks only from facts a business has approved. An “I’ll have someone confirm that” beats a confident guess, every single time.',
  },
  {
    num: '03',
    title: 'The record is the product',
    desc: 'A call that isn’t transcribed, summarized, and logged might as well not have happened. Every conversation leaves a clean trail your team can act on.',
  },
];

const milestones = [
  { year: '2024', event: 'Founded after our co-founder’s family restaurant missed 31 calls in one weekend' },
  { year: '2025', event: 'First 100 businesses live; outbound campaigns launched' },
  { year: '2026', event: '1,400+ lines answered, 11 million minutes on the phone' },
];

export default function About() {
  return (
    <div className="about">
      <PageField />

      <section className="about-hero page-hero">
        <HeroParallax className="container page-hero-inner field-scrim">
          <Reveal y={14}>
            <p className="eyebrow">About</p>
          </Reveal>
          <KineticTitle
            className="page-hero-title"
            lines={[
              { text: 'We started with a phone' },
              { text: 'that wouldn’t stop ringing.', accent: true },
            ]}
          />
          <Reveal delay={0.55} y={18}>
            <p className="hero-oneliner">
              Thirty-one missed calls in one Saturday service. That’s where this company comes from.
            </p>
          </Reveal>
        </HeroParallax>
        <ScrollCue label="The story" />
      </section>

      <section className="about-story">
        <div className="container">
          <Reveal>
            <p className="about-story-text">
              Our co-founder’s family runs a restaurant. One Saturday they counted the calls
              that rang out during service: <em>thirty-one</em>. Each one was a booking, a
              question, or a cancellation that never landed. Nexus Voice exists so that number
              is zero — for every business that lives on its phone line.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="principles">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">How we build</p>
              <h2 className="section-title">Three rules we don’t bend</h2>
            </div>
          </Reveal>

          <div className="principles-grid">
            {principles.map((p, i) => (
              <Reveal key={p.num} delay={i * 0.08}>
                <article className="principle">
                  <span className="principle-num mono">{p.num}</span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="milestones night-section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow eyebrow--night">So far</p>
              <h2 className="section-title">A short history of answered calls</h2>
            </div>
          </Reveal>

          <div className="milestones-list">
            {milestones.map((m, i) => (
              <Reveal key={m.year} delay={i * 0.08}>
                <div className="milestone">
                  <span className="milestone-year mono">{m.year}</span>
                  <p>{m.event}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="container">
          <Reveal>
            <div className="about-cta-inner">
              <h2>Help us answer the next million calls.</h2>
              <p>
                We’re a small team of telephony nerds, voice engineers, and ex-restaurant
                people. If that sounds like home, we’d like to hear from you.
              </p>
              <div className="about-cta-actions">
                <NavLink to="/contact" className="btn btn-ink">
                  Get in touch <IconArrowRight size={16} />
                </NavLink>
                <NavLink to="/product" className="btn btn-ghost">
                  See the product
                </NavLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
