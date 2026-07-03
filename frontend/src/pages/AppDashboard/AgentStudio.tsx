import { useEffect, useRef, useState } from 'react';
import type { OverviewData, Playbook } from './types';
import {
  IconArrowRight,
  IconBook,
  IconCheck,
  IconClock,
  IconDatabase,
  IconGlobe,
  IconHeadset,
  IconLink,
  IconPause,
  IconPhone,
  IconPlay,
  IconPlus,
  IconTrash,
  IconUpload,
  IconWave,
} from '../../components/Icons/Icons';

/* ============ Voice library ============ */

type StudioVoice = {
  id: string;
  name: string;
  gender: string;
  accent: string;
  style: string;
  tag: string;
  langCode: string;
  sample: string;
};

const voiceLibrary: StudioVoice[] = [
  {
    id: 'maple',
    name: 'Maple',
    gender: 'Female',
    accent: 'American',
    style: 'Warm · unhurried',
    tag: 'US',
    langCode: 'en-US',
    sample: 'Thanks for calling Meridian Bistro — how can I help you tonight?',
  },
  {
    id: 'ash',
    name: 'Ash',
    gender: 'Male',
    accent: 'British',
    style: 'Crisp · professional',
    tag: 'UK',
    langCode: 'en-GB',
    sample: 'Good evening, you’ve reached Meridian Bistro. What can I do for you?',
  },
  {
    id: 'iris',
    name: 'Iris',
    gender: 'Female',
    accent: 'Australian',
    style: 'Bright · upbeat',
    tag: 'AU',
    langCode: 'en-AU',
    sample: 'Hi there! Meridian Bistro, Iris speaking — how can I help?',
  },
  {
    id: 'sol',
    name: 'Sol',
    gender: 'Male',
    accent: 'Spanish bilingual',
    style: 'Friendly · steady',
    tag: 'ES',
    langCode: 'es-ES',
    sample: 'Gracias por llamar a Meridian Bistro, ¿en qué puedo ayudarle?',
  },
  {
    id: 'wren',
    name: 'Wren',
    gender: 'Female',
    accent: 'American',
    style: 'Calm · clinical',
    tag: 'US',
    langCode: 'en-US',
    sample: 'You’ve reached the front desk. I can book, move, or cancel an appointment.',
  },
  {
    id: 'koa',
    name: 'Koa',
    gender: 'Male',
    accent: 'Indian English',
    style: 'Polite · precise',
    tag: 'IN',
    langCode: 'en-IN',
    sample: 'Hello, thank you for calling. How may I assist you today?',
  },
];

const primaryLanguages = [
  'English (US)', 'English (UK)', 'Spanish', 'French', 'German',
  'Finnish', 'Swedish', 'Italian', 'Portuguese', 'Dutch',
];

const extraLanguages = ['Spanish', 'French', 'German', 'Mandarin', 'Hindi', 'Arabic', 'Finnish', 'Swedish'];

const patienceLevels = [
  { id: 'low', label: 'Quick', desc: 'Jumps in fast — good for short, transactional calls.' },
  { id: 'medium', label: 'Balanced', desc: 'Natural pauses — right for most businesses.' },
  { id: 'high', label: 'Patient', desc: 'Waits longer — good for older callers or complex requests.' },
];

/* ============ Knowledge state ============ */

type StudioFile = { id: number; name: string; size: string; status: 'Processing' | 'Ready' };
type FaqPair = { id: number; q: string; a: string };

const seedFiles: StudioFile[] = [
  { id: 1, name: 'Menu — Fall 2026.pdf', size: '1.2 MB', status: 'Ready' },
  { id: 2, name: 'House policies.docx', size: '64 KB', status: 'Ready' },
];

const seedFaqs: FaqPair[] = [
  { id: 1, q: 'Do you take walk-ins?', a: 'Yes — bar seating is first come, first served. Tables we hold for reservations.' },
  { id: 2, q: 'Is the patio dog-friendly?', a: 'Yes, leashed dogs are welcome on the patio.' },
];

function formatSize(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

const studioTabs = ['Overview', 'Voice & Speech', 'Knowledge', 'Automations', 'Test Lab'] as const;
type StudioTab = typeof studioTabs[number];

type AgentStudioProps = {
  data: OverviewData;
  onUpdatePlaybook: (payload: Playbook) => Promise<void>;
  onToggleTriggerRule: (id: number, status: string) => Promise<void>;
};

export default function AgentStudio({ data, onUpdatePlaybook, onToggleTriggerRule }: AgentStudioProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>('Overview');
  const { scenarios, trigger_rules, knowledge_sources, output_rules, playbook } = data;

  /* ---- Voice & speech ---- */
  const [voiceId, setVoiceId] = useState('maple');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [primaryLang, setPrimaryLang] = useState('English (US)');
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [activeLangs, setActiveLangs] = useState<string[]>(['Spanish', 'Finnish']);
  const [pace, setPace] = useState(100);
  const [warmth, setWarmth] = useState(65);
  const [formality, setFormality] = useState(40);
  const [patience, setPatience] = useState('medium');
  const [toneNotes, setToneNotes] = useState(
    'Sound genuinely pleased when a caller books. Slow down when reading back numbers, dates, or addresses.'
  );

  const selectedVoice = voiceLibrary.find((v) => v.id === voiceId) ?? voiceLibrary[0];

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const previewVoice = (voice: StudioVoice) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (playingId === voice.id) {
      setPlayingId(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(voice.sample);
    utterance.lang = voice.langCode;
    utterance.rate = pace / 100;
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);
    setPlayingId(voice.id);
    window.speechSynthesis.speak(utterance);
  };

  const toggleLang = (lang: string) => {
    setActiveLangs((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]));
  };

  /* ---- Knowledge ---- */
  const [files, setFiles] = useState<StudioFile[]>(seedFiles);
  const [dragOver, setDragOver] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawled, setCrawled] = useState<string[]>(['meridianbistro.com — 14 pages, synced weekly']);
  const [faqs, setFaqs] = useState<FaqPair[]>(seedFaqs);
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const nextId = useRef(100);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const added: StudioFile[] = Array.from(list).map((f) => ({
      id: nextId.current++,
      name: f.name,
      size: formatSize(f.size),
      status: 'Processing',
    }));
    setFiles((prev) => [...added, ...prev]);
    added.forEach((file) => {
      setTimeout(() => {
        setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: 'Ready' } : f)));
      }, 1800);
    });
  };

  const addCrawl = () => {
    const url = crawlUrl.trim().replace(/^https?:\/\//, '');
    if (!url) return;
    setCrawled((prev) => [`${url} — crawling…`, ...prev]);
    setCrawlUrl('');
    setTimeout(() => {
      setCrawled((prev) => prev.map((c) => (c.startsWith(`${url} —`) ? `${url} — 9 pages, synced just now` : c)));
    }, 2000);
  };

  const addFaq = () => {
    if (!faqQ.trim() || !faqA.trim()) return;
    setFaqs((prev) => [{ id: nextId.current++, q: faqQ.trim(), a: faqA.trim() }, ...prev]);
    setFaqQ('');
    setFaqA('');
  };

  /* ---- Playbook (API-backed) ---- */
  const [greeting, setGreeting] = useState(playbook.greeting);
  const [qualification, setQualification] = useState(playbook.qualification);
  const [escalation, setEscalation] = useState(playbook.escalation);
  const [savingPlaybook, setSavingPlaybook] = useState(false);

  useEffect(() => {
    setGreeting(playbook.greeting);
    setQualification(playbook.qualification);
    setEscalation(playbook.escalation);
  }, [playbook]);

  const handlePlaybookSave = async () => {
    setSavingPlaybook(true);
    await onUpdatePlaybook({ greeting, qualification, escalation });
    setSavingPlaybook(false);
  };

  /* ---- Test lab ---- */
  const [testPhone, setTestPhone] = useState('');
  const [testCallState, setTestCallState] = useState<'idle' | 'calling' | 'queued'>('idle');

  const startTestCall = () => {
    if (!testPhone.trim()) return;
    setTestCallState('calling');
    setTimeout(() => setTestCallState('queued'), 1500);
  };

  return (
    <div className="view-stack">
      {/* ---- Studio head ---- */}
      <section className="studio-head">
        <div className="studio-agent">
          <span className="studio-avatar">
            <IconWave size={26} />
          </span>
          <div>
            <div className="studio-agent-row">
              <h2>Ava</h2>
              <span className="chip chip--idle">Draft ready</span>
            </div>
            <p>
              Voice: {selectedVoice.name} · {selectedVoice.accent} · {primaryLang}
              {activeLangs.length > 0 && ` +${activeLangs.length} languages`}
            </p>
          </div>
        </div>

        <div className="studio-readiness">
          <div
            className="readiness-ring"
            style={{ ['--pct' as string]: 91 }}
            role="img"
            aria-label="Readiness 91 percent"
          >
            <strong className="mono">91%</strong>
          </div>
          <div className="readiness-text">
            <span>Readiness</span>
            <p>3 tests should pass before publishing.</p>
          </div>
        </div>

        <div className="studio-actions">
          <button className="app-btn app-btn--ghost" type="button">
            <IconPhone size={15} /> Run test call
          </button>
          <button className="app-btn app-btn--primary" type="button">Publish changes</button>
        </div>
      </section>

      <nav className="studio-tabs" aria-label="Agent studio sections">
        {studioTabs.map((tab) => (
          <button
            key={tab}
            className={`studio-tab ${activeTab === tab ? 'is-active' : ''}`}
            type="button"
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* ============ OVERVIEW ============ */}
      {activeTab === 'Overview' && (
        <section className="panel-grid panel-grid--upper">
          <div className="panel">
            <header className="panel-head">
              <div>
                <span className="panel-eyebrow">Scenario testing</span>
                <h3>Simulation results</h3>
              </div>
              <button className="panel-action" type="button">Run all</button>
            </header>
            <ul className="scenario-list">
              {scenarios.map((scenario) => (
                <li className="scenario-row" key={scenario.id || scenario.name}>
                  <div>
                    <strong>{scenario.name}</strong>
                    <p>{scenario.focus}</p>
                  </div>
                  <span className="scenario-rate mono">{scenario.pass_rate}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <header className="panel-head">
              <div>
                <span className="panel-eyebrow">Guardrails</span>
                <h3>Rules before deployment</h3>
              </div>
            </header>
            <div className="guardrail-list">
              {[
                'Never promise custom pricing without approval',
                'Escalate HIPAA, legal, and billing disputes',
                'Confirm timezone before booking a meeting',
                'Summarize next steps into the CRM after each call',
              ].map((rule) => (
                <label className="guardrail-row" key={rule}>
                  <input type="checkbox" defaultChecked />
                  <span>{rule}</span>
                </label>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ VOICE & SPEECH ============ */}
      {activeTab === 'Voice & Speech' && (
        <section className="panel-grid panel-grid--voice">
          <div className="panel">
            <header className="panel-head">
              <div>
                <span className="panel-eyebrow">Voice</span>
                <h3>How Ava sounds on the line</h3>
              </div>
              <span className="panel-sync mono">Previews use your device voice</span>
            </header>

            <div className="voice-grid" role="radiogroup" aria-label="Agent voice">
              {voiceLibrary.map((voice) => (
                <div
                  key={voice.id}
                  role="radio"
                  aria-checked={voiceId === voice.id}
                  tabIndex={0}
                  className={`voice-card ${voiceId === voice.id ? 'is-selected' : ''}`}
                  onClick={() => setVoiceId(voice.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setVoiceId(voice.id);
                    }
                  }}
                >
                  <div className="voice-card-top">
                    <strong>{voice.name}</strong>
                    <span className="voice-tag mono">{voice.tag}</span>
                  </div>
                  <span className="voice-meta">{voice.gender} · {voice.accent}</span>
                  <span className="voice-style">{voice.style}</span>
                  <button
                    type="button"
                    className={`voice-play ${playingId === voice.id ? 'is-playing' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      previewVoice(voice);
                    }}
                    aria-label={playingId === voice.id ? `Stop ${voice.name} preview` : `Preview ${voice.name}`}
                  >
                    {playingId === voice.id ? (
                      <>
                        <span className="eq voice-eq" aria-hidden="true"><span /><span /><span /><span /><span /></span>
                        Stop
                      </>
                    ) : (
                      <>
                        <IconPlay size={11} />
                        Preview
                      </>
                    )}
                  </button>
                  {voiceId === voice.id && (
                    <span className="voice-selected" aria-hidden="true">
                      <IconCheck size={13} />
                    </span>
                  )}
                </div>
              ))}
            </div>

            <p className="voice-clone-note">
              Want the agent to sound like someone on your team? <button type="button" className="panel-action voice-clone-link">Clone a voice from a 60-second sample</button>
            </p>
          </div>

          <div className="panel-stack">
            <div className="panel">
              <header className="panel-head">
                <div>
                  <span className="panel-eyebrow">Language</span>
                  <h3>What Ava speaks</h3>
                </div>
              </header>

              <div className="lang-fields">
                <label className="app-field">
                  <span>Primary language</span>
                  <select value={primaryLang} onChange={(e) => setPrimaryLang(e.target.value)}>
                    {primaryLanguages.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </label>

                <label className="toggle-row lang-auto">
                  <span>Switch languages automatically when the caller does</span>
                  <span className="switch">
                    <input type="checkbox" checked={autoSwitch} onChange={(e) => setAutoSwitch(e.target.checked)} />
                    <span className="switch-track" aria-hidden="true" />
                  </span>
                </label>

                <div className="lang-extra">
                  <span className="mono-label">Also answer in</span>
                  <div className="lang-chips">
                    {extraLanguages.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        className={`lang-chip ${activeLangs.includes(lang) ? 'is-active' : ''}`}
                        onClick={() => toggleLang(lang)}
                        aria-pressed={activeLangs.includes(lang)}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="panel">
              <header className="panel-head">
                <div>
                  <span className="panel-eyebrow">Delivery</span>
                  <h3>Tone and pacing</h3>
                </div>
              </header>

              <div className="slider-list">
                <label className="slider-row">
                  <div className="slider-meta">
                    <span>Speaking pace</span>
                    <span className="mono">{pace}%</span>
                  </div>
                  <input
                    type="range"
                    min={80}
                    max={120}
                    value={pace}
                    onChange={(e) => setPace(Number(e.target.value))}
                  />
                  <div className="slider-ends mono"><span>Slower</span><span>Faster</span></div>
                </label>

                <label className="slider-row">
                  <div className="slider-meta">
                    <span>Warmth</span>
                    <span className="mono">{warmth}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={warmth}
                    onChange={(e) => setWarmth(Number(e.target.value))}
                  />
                  <div className="slider-ends mono"><span>Steady</span><span>Expressive</span></div>
                </label>

                <label className="slider-row">
                  <div className="slider-meta">
                    <span>Formality</span>
                    <span className="mono">{formality}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formality}
                    onChange={(e) => setFormality(Number(e.target.value))}
                  />
                  <div className="slider-ends mono"><span>Casual</span><span>Formal</span></div>
                </label>
              </div>

              <div className="patience-block">
                <span className="mono-label">Patience on the line</span>
                <div className="segmented" role="radiogroup" aria-label="Patience level">
                  {patienceLevels.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      role="radio"
                      aria-checked={patience === level.id}
                      className={`segment ${patience === level.id ? 'is-active' : ''}`}
                      onClick={() => setPatience(level.id)}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
                <p className="patience-desc">
                  {patienceLevels.find((l) => l.id === patience)?.desc}
                </p>
              </div>

              <label className="app-field tone-notes">
                <span>Tone notes</span>
                <textarea
                  rows={3}
                  value={toneNotes}
                  onChange={(e) => setToneNotes(e.target.value)}
                  placeholder="e.g. Sound genuinely pleased when a caller books. Slow down when reading numbers."
                />
              </label>
            </div>
          </div>
        </section>
      )}

      {/* ============ KNOWLEDGE ============ */}
      {activeTab === 'Knowledge' && (
        <>
          <section className="panel-grid panel-grid--upper">
            <div className="panel">
              <header className="panel-head">
                <div>
                  <span className="panel-eyebrow">Documents</span>
                  <h3>Teach Ava from your files</h3>
                </div>
              </header>

              <div
                className={`dropzone ${dragOver ? 'is-over' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  addFiles(e.dataTransfer.files);
                }}
              >
                <IconUpload size={22} />
                <p>
                  Drop menus, price lists, policies, or service docs here — or{' '}
                  <button type="button" className="dropzone-browse" onClick={() => fileInput.current?.click()}>
                    browse files
                  </button>
                </p>
                <span className="mono dropzone-hint">PDF · DOCX · TXT · MD — up to 25 MB each</span>
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md"
                  hidden
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>

              <ul className="file-list">
                {files.map((file) => (
                  <li className="file-row" key={file.id}>
                    <span className="file-icon"><IconBook size={15} /></span>
                    <div className="file-id">
                      <strong>{file.name}</strong>
                      <span className="mono">{file.size}</span>
                    </div>
                    <span className={`chip ${file.status === 'Ready' ? 'chip--live' : 'chip--ringing'}`}>
                      {file.status}
                    </span>
                    <button
                      type="button"
                      className="file-remove"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => setFiles((prev) => prev.filter((f) => f.id !== file.id))}
                    >
                      <IconTrash size={15} />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="crawl-block">
                <span className="mono-label">Or learn from your website</span>
                <div className="crawl-row">
                  <div className="crawl-input">
                    <IconLink size={15} />
                    <input
                      value={crawlUrl}
                      onChange={(e) => setCrawlUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCrawl()}
                      placeholder="yourbusiness.com"
                      aria-label="Website to crawl"
                    />
                  </div>
                  <button type="button" className="app-btn app-btn--ghost" onClick={addCrawl}>
                    Crawl site
                  </button>
                </div>
                <ul className="crawl-list">
                  {crawled.map((c) => (
                    <li key={c} className="mono">
                      <IconGlobe size={13} /> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="panel">
              <header className="panel-head">
                <div>
                  <span className="panel-eyebrow">Call playbook</span>
                  <h3>How Ava should talk</h3>
                </div>
              </header>
              <div className="playbook-fields">
                <label className="app-field">
                  <span>Greeting</span>
                  <textarea value={greeting} onChange={(e) => setGreeting(e.target.value)} rows={2} />
                </label>
                <label className="app-field">
                  <span>Qualification questions</span>
                  <textarea value={qualification} onChange={(e) => setQualification(e.target.value)} rows={2} />
                </label>
                <label className="app-field">
                  <span>Escalation rules</span>
                  <textarea value={escalation} onChange={(e) => setEscalation(e.target.value)} rows={2} />
                </label>
                <button
                  type="button"
                  className="app-btn app-btn--primary playbook-save"
                  onClick={handlePlaybookSave}
                  disabled={savingPlaybook}
                >
                  {savingPlaybook ? 'Saving…' : 'Save playbook'}
                </button>
              </div>

              <div className="sources-block">
                <span className="mono-label">Connected sources</span>
                <ul className="source-list">
                  {knowledge_sources.map((source) => (
                    <li className="source-row" key={source.id || source.name}>
                      <span className="source-icon"><IconDatabase size={15} /></span>
                      <div>
                        <strong>{source.name}</strong>
                        <p className="mono">{source.type_info}</p>
                      </div>
                      <span className={`chip ${source.status === 'Needs review' ? 'chip--ringing' : 'chip--live'}`}>
                        {source.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="panel">
            <header className="panel-head">
              <div>
                <span className="panel-eyebrow">Quick answers</span>
                <h3>Questions with exact answers</h3>
              </div>
              <span className="panel-sync mono">Ava says these word for word</span>
            </header>

            <div className="faq-add">
              <input
                value={faqQ}
                onChange={(e) => setFaqQ(e.target.value)}
                placeholder="Question — e.g. Do you have parking?"
                aria-label="New question"
              />
              <input
                value={faqA}
                onChange={(e) => setFaqA(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFaq()}
                placeholder="Exact answer Ava should give"
                aria-label="New answer"
              />
              <button type="button" className="app-btn app-btn--primary" onClick={addFaq}>
                <IconPlus size={15} /> Add
              </button>
            </div>

            <ul className="qa-list">
              {faqs.map((faq) => (
                <li className="qa-row" key={faq.id}>
                  <div className="qa-text">
                    <strong>{faq.q}</strong>
                    <p>{faq.a}</p>
                  </div>
                  <button
                    type="button"
                    className="file-remove"
                    aria-label={`Remove question: ${faq.q}`}
                    onClick={() => setFaqs((prev) => prev.filter((f) => f.id !== faq.id))}
                  >
                    <IconTrash size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* ============ AUTOMATIONS ============ */}
      {activeTab === 'Automations' && (
        <>
          <section className="panel">
            <header className="panel-head">
              <div>
                <span className="panel-eyebrow">Triggers</span>
                <h3>When Ava changes behavior</h3>
              </div>
            </header>
            <div className="trigger-grid trigger-grid--flat">
              {trigger_rules.map((trigger) => (
                <article className="trigger-card trigger-card--flat" key={trigger.id || trigger.title}>
                  <span className="trigger-icon"><IconClock size={17} /></span>
                  <div className="trigger-text">
                    <strong>{trigger.title}</strong>
                    <p>{trigger.detail}</p>
                  </div>
                  <button
                    type="button"
                    className={`chip ${trigger.status === 'Paused' ? 'chip--idle' : 'chip--live'} trigger-toggle`}
                    title="Toggle status"
                    onClick={() => onToggleTriggerRule(trigger.id, trigger.status === 'Active' ? 'Paused' : 'Active')}
                  >
                    {trigger.status}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <header className="panel-head">
              <div>
                <span className="panel-eyebrow">Outputs</span>
                <h3>Where every call lands</h3>
              </div>
            </header>
            <div className="trigger-grid trigger-grid--flat">
              {output_rules.map((output) => (
                <article className="trigger-card trigger-card--flat" key={output.id || output.title}>
                  <span className="trigger-icon"><IconArrowRight size={17} /></span>
                  <div className="trigger-text">
                    <strong>{output.title}</strong>
                    <p>{output.detail}</p>
                  </div>
                  <span className="chip chip--live">On</span>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ============ TEST LAB ============ */}
      {activeTab === 'Test Lab' && (
        <section className="panel-grid panel-grid--upper">
          <div className="panel studio-workspace">
            <header className="panel-head">
              <div>
                <span className="panel-eyebrow">Rehearsal</span>
                <h3>Role-play with Ava</h3>
              </div>
            </header>
            <div className="workspace-message">
              <span className="workspace-ava"><IconWave size={16} /></span>
              <p>
                Hi, I’m Ava. I can role-play calls, test handoffs, rewrite answers, and check
                whether my training is ready for real callers.
              </p>
            </div>
            <div className="workspace-suggestions">
              {['Role-play a pricing call', 'Test urgent handoff', 'Try an angry caller', 'Check CRM summary'].map((item) => (
                <button type="button" key={item}>{item}</button>
              ))}
            </div>
            <div className="workspace-input">
              <input placeholder="Ask Ava to test or improve a call flow…" aria-label="Message to Ava" />
              <button className="app-btn app-btn--primary" type="button">Send</button>
            </div>
          </div>

          <div className="panel-stack">
            <div className="panel testcall-panel">
              <header className="panel-head">
                <div>
                  <span className="panel-eyebrow">Real call</span>
                  <h3>Hear Ava on your own phone</h3>
                </div>
              </header>
              <p className="testcall-copy">
                The fastest way to judge a voice agent is to be the caller. Ava will ring
                you with the current draft — voice, tone, knowledge, everything.
              </p>
              <div className="testcall-row">
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="(415) 555-0123"
                  aria-label="Your phone number"
                  className="mono"
                />
                <button
                  type="button"
                  className="app-btn app-btn--primary"
                  onClick={startTestCall}
                  disabled={testCallState === 'calling'}
                >
                  <IconHeadset size={15} />
                  {testCallState === 'calling' ? 'Dialing…' : 'Call me now'}
                </button>
              </div>
              {testCallState === 'queued' && (
                <p className="testcall-status chip chip--live">Test call queued — your phone rings in a moment</p>
              )}
            </div>

            <div className="panel">
              <header className="panel-head">
                <div>
                  <span className="panel-eyebrow">Before you publish</span>
                  <h3>Pre-flight checks</h3>
                </div>
              </header>
              <ul className="preflight-list">
                {[
                  { label: 'Greeting uses your business name', done: true },
                  { label: 'Knowledge covers your top 10 questions', done: true },
                  { label: 'Escalation path rings a real person', done: true },
                  { label: 'Large-party deposit policy passes simulation', done: false },
                ].map((check) => (
                  <li key={check.label} className={check.done ? 'is-done' : ''}>
                    <span className="preflight-mark">
                      {check.done ? <IconCheck size={13} /> : <IconPause size={13} />}
                    </span>
                    {check.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
