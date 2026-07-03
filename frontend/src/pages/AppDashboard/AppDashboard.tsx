import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '../../components/ui/ThemeToggle';
import AgentStudio from './AgentStudio';
import type { Metric, OverviewData, Playbook, SettingsProfile, TriggerRule } from './types';
import {
  IconActivity,
  IconAnalytics,
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconCpu,
  IconDashboard,
  IconDownload,
  IconGlobe,
  IconHeadset,
  IconLogOut,
  IconLogo,
  IconPhone,
  IconSearch,
  IconSettings,
  IconShield,
  IconTarget,
  IconUsers,
  IconWave,
} from '../../components/Icons/Icons';
import './AppDashboard.css';

/* ============ Navigation ============ */

const navSections = [
  {
    label: 'Operate',
    items: [
      { label: 'Command Center', path: '/app/dashboard', Icon: IconDashboard },
      { label: 'Call Review', path: '/app/activity', Icon: IconActivity },
    ],
  },
  {
    label: 'Build',
    items: [
      { label: 'Agent Studio', path: '/app/training', Icon: IconWave },
      { label: 'Settings', path: '/app/settings', Icon: IconSettings },
    ],
  },
];

const pageCopy = {
  dashboard: {
    eyebrow: 'Operate',
    title: 'Command Center',
    desc: 'Live calls, booking quality, and what needs your attention today.',
  },
  training: {
    eyebrow: 'Build',
    title: 'Agent Studio',
    desc: 'Choose Ava’s voice, teach her your business, and test before publishing.',
  },
  activity: {
    eyebrow: 'Operate',
    title: 'Call Review',
    desc: 'Every conversation with its transcript, outcome, and sentiment.',
  },
  settings: {
    eyebrow: 'Build',
    title: 'Workspace Settings',
    desc: 'Numbers, hours, integrations, and how calls escalate to your team.',
  },
};

const callBars = [
  { label: 'Mon', value: 62, calls: 38 },
  { label: 'Tue', value: 78, calls: 48 },
  { label: 'Wed', value: 70, calls: 43 },
  { label: 'Thu', value: 92, calls: 57 },
  { label: 'Fri', value: 100, calls: 62 },
  { label: 'Sat', value: 48, calls: 30 },
  { label: 'Sun', value: 36, calls: 22 },
];

const intentRows = [
  { label: 'Book a reservation', value: 38 },
  { label: 'Change or cancel', value: 24 },
  { label: 'Hours & questions', value: 18 },
  { label: 'Pricing', value: 12 },
  { label: 'Other', value: 8 },
];

/* ============ Demo fallback (backend offline) ============ */

const demoData: OverviewData = {
  metrics: [
    { label: 'Calls handled today', value: '47', change: '+12% vs last Tue', icon: 'IconPhone' },
    { label: 'Bookings made', value: '18', change: '+5 vs last Tue', icon: 'IconCalendar' },
    { label: 'Avg. call length', value: '1:42', change: '-8s vs last week', icon: 'IconTarget' },
    { label: 'Resolved without staff', value: '94%', change: '+2.1 pts', icon: 'IconCpu' },
  ],
  live_calls: [
    { id: 1, caller: 'Priya Sharma', company: '(628) 555-0107', intent: 'Table for 6, Saturday', status: 'Booking', tone: 'calm' },
    { id: 2, caller: 'Tom Okafor', company: '(415) 555-0173', intent: 'Move 7:00 to 8:30', status: 'Rescheduling', tone: 'calm' },
    { id: 3, caller: 'Dana Liu', company: '(510) 555-0148', intent: 'Allergy question', status: 'Answering', tone: 'warm' },
  ],
  training_tasks: [
    { id: 1, title: 'Add Thanksgiving hours', detail: 'Callers are asking about holiday availability.', progress: 20 },
    { id: 2, title: 'Review patio rain policy', detail: '3 calls escalated on this last week.', progress: 60 },
    { id: 3, title: 'Wine list refresh', detail: 'New menu uploaded — approve the answers.', progress: 85 },
  ],
  scenarios: [
    { id: 1, name: 'Friday rush booking', focus: 'Double-booking pressure', pass_rate: '98%' },
    { id: 2, name: 'Angry caller handoff', focus: 'Escalation tone', pass_rate: '95%' },
    { id: 3, name: 'Large party + deposit', focus: 'Policy explanation', pass_rate: '91%' },
    { id: 4, name: 'Spanish-language booking', focus: 'Language switch', pass_rate: '97%' },
  ],
  trigger_rules: [
    { id: 1, title: 'After-hours calls', detail: 'Answer 24/7, flag urgent issues to on-call phone.', status: 'Active' },
    { id: 2, title: 'VIP caller list', detail: 'Transfer regulars directly to the manager.', status: 'Active' },
    { id: 3, title: 'Press & partnerships', detail: 'Take a message, never improvise.', status: 'Paused' },
  ],
  knowledge_sources: [
    { id: 1, name: 'Menu — Fall 2026', type_info: 'PDF · synced 2 days ago', status: 'Active' },
    { id: 2, name: 'Website FAQ', type_info: 'Crawled weekly', status: 'Active' },
    { id: 3, name: 'Holiday hours doc', type_info: 'Google Doc', status: 'Needs review' },
  ],
  output_rules: [
    { id: 1, title: 'Booking → Google Calendar', detail: 'Creates the event with party size and notes.' },
    { id: 2, title: 'Summary → Slack #frontdesk', detail: 'Posts after every escalated call.' },
    { id: 3, title: 'Transcript → CRM', detail: 'Attached to the matching contact.' },
  ],
  playbook: {
    greeting: 'Thanks for calling Meridian Bistro, this is Ava. How can I help?',
    qualification: 'Party size, date and time, seating preference, occasion.',
    escalation: 'Transfer complaints, press, and anything medical to a manager immediately.',
  },
  call_logs: [
    { id: 1, time: '14:32', caller: '(415) 555-0182', outcome: 'Reservation booked', sentiment: 'Positive', review: 'Patio, party of 4, 8:15 PM.' },
    { id: 2, time: '13:58', caller: '(628) 555-0140', outcome: 'Question answered', sentiment: 'Neutral', review: 'Corkage fee policy.' },
    { id: 3, time: '13:21', caller: '(510) 555-0166', outcome: 'Escalated to manager', sentiment: 'Negative', review: 'Billing dispute — handled by Maria.' },
    { id: 4, time: '12:47', caller: '(415) 555-0117', outcome: 'Cancellation processed', sentiment: 'Neutral', review: 'Slot refilled from waitlist.' },
    { id: 5, time: '12:05', caller: '(925) 555-0199', outcome: 'Reservation booked', sentiment: 'Positive', review: 'Anniversary note added.' },
  ],
  settings_profile: {
    company_name: 'Meridian Bistro',
    phone_number: '(415) 555-0100',
    business_hours: 'always',
    default_escalation: 'phone',
    send_booked_summary: true,
    alert_urgent_handoff: true,
    email_daily_digest: true,
    flag_negative_sentiment: true,
  },
};

function getView(pathname: string) {
  if (pathname.includes('/training') || pathname.includes('/voice-agent')) return 'training' as const;
  if (pathname.includes('/activity')) return 'activity' as const;
  if (pathname.includes('/settings')) return 'settings' as const;
  return 'dashboard' as const;
}

/* ============ Shared bits ============ */

function LiveEq() {
  return (
    <span className="eq" aria-hidden="true">
      <span /><span /><span /><span /><span />
    </span>
  );
}

const metricIcons: Record<string, typeof IconPhone> = {
  IconPhone,
  IconCalendar: IconCalendar,
  IconTarget,
  IconCpu,
};

function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <section className="metric-grid" aria-label="Voice agent metrics">
      {metrics.map((metric, index) => {
        const Icon = metricIcons[metric.icon] ?? IconPhone;
        const negative = String(metric.change || '').startsWith('-');
        return (
          <motion.article
            className="metric-card"
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            <div className="metric-top">
              <span className="metric-label">{metric.label}</span>
              <span className="metric-icon"><Icon size={16} /></span>
            </div>
            <strong className="metric-value mono">{metric.value}</strong>
            <span className={`metric-change mono ${negative ? 'is-down' : 'is-up'}`}>
              {metric.change}
            </span>
          </motion.article>
        );
      })}
    </section>
  );
}

/* ============ Command Center ============ */

function DashboardView({ data }: { data: OverviewData }) {
  const { metrics, live_calls, training_tasks } = data;
  const maxBar = Math.max(...callBars.map((b) => b.value));

  return (
    <div className="view-stack">
      <section className="ops-banner">
        <div className="ops-banner-status">
          <LiveEq />
          <div>
            <h2>Ava is on the line</h2>
            <p>{live_calls.length} active conversations · no compliance alerts in 24h</p>
          </div>
        </div>
        <div className="ops-banner-actions">
          <button className="app-btn app-btn--ghost" type="button">Open live monitor</button>
          <NavLink className="app-btn app-btn--primary" to="/app/training">Train agent</NavLink>
        </div>
      </section>

      <MetricGrid metrics={metrics} />

      <section className="panel-grid panel-grid--upper">
        <div className="panel">
          <header className="panel-head">
            <div>
              <span className="panel-eyebrow">This week</span>
              <h3>Calls handled</h3>
            </div>
            <button className="panel-action" type="button">
              Export <IconDownload size={14} />
            </button>
          </header>
          <div className="bar-chart" role="img" aria-label="Calls handled per day this week, peaking Friday at 62">
            {callBars.map((bar) => (
              <div className="bar-col" key={bar.label}>
                <span className="bar-count mono">{bar.calls}</span>
                <div className="bar-track">
                  <motion.span
                    className="bar-fill"
                    initial={{ height: 0 }}
                    animate={{ height: `${(bar.value / maxBar) * 100}%` }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <span className="bar-day mono">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <header className="panel-head">
            <div>
              <span className="panel-eyebrow">Live queue</span>
              <h3>On the line now</h3>
            </div>
            <span className="chip chip--live">Live</span>
          </header>
          <ul className="queue-list">
            {live_calls.map((call) => (
              <li className="queue-row" key={call.id || call.caller}>
                <span className="queue-avatar">{String(call.caller).slice(0, 1)}</span>
                <div className="queue-id">
                  <strong>{call.caller}</strong>
                  <span className="mono">{call.company}</span>
                </div>
                <span className="queue-intent">{call.intent}</span>
                <span className="chip chip--live">{call.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel-grid panel-grid--lower">
        <div className="panel">
          <header className="panel-head">
            <div>
              <span className="panel-eyebrow">Training gaps</span>
              <h3>Ava needs to learn</h3>
            </div>
            <NavLink className="panel-action" to="/app/training">
              Resolve <IconArrowRight size={14} />
            </NavLink>
          </header>
          <ul className="task-list">
            {training_tasks.map((task) => (
              <li className="task-row" key={task.id || task.title}>
                <div className="task-text">
                  <strong>{task.title}</strong>
                  <p>{task.detail}</p>
                </div>
                <div className="task-progress">
                  <div className="task-bar" aria-label={`${task.progress}% complete`}>
                    <span style={{ width: `${task.progress}%` }} />
                  </div>
                  <span className="mono">{task.progress}%</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <header className="panel-head">
            <div>
              <span className="panel-eyebrow">Quality signals</span>
              <h3>What changed today</h3>
            </div>
          </header>
          <ul className="signal-list">
            <li><IconAnalytics size={16} /> Pricing questions rose 16% after the campaign email.</li>
            <li><IconUsers size={16} /> Morning calls convert best when Ava offers two slots.</li>
            <li><IconShield size={16} /> No restricted claims detected in reviewed calls.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

/* ============ Call Review ============ */

const sentimentChip: Record<string, string> = {
  positive: 'chip--live',
  neutral: 'chip--idle',
  negative: 'chip--missed',
};

function ActivityView({ data }: { data: OverviewData }) {
  const { call_logs } = data;

  return (
    <div className="view-stack">
      <section className="review-toolbar">
        <div className="review-search">
          <IconSearch size={16} />
          <input placeholder="Search calls, numbers, outcomes…" aria-label="Search calls" />
        </div>
        <select defaultValue="today" aria-label="Date range" className="review-range">
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>
        <button className="app-btn app-btn--ghost" type="button">
          <IconDownload size={15} /> CSV
        </button>
      </section>

      <section className="panel-grid panel-grid--review">
        <div className="panel">
          <header className="panel-head">
            <div>
              <span className="panel-eyebrow">Call review</span>
              <h3>Latest conversations</h3>
            </div>
            <span className="panel-sync mono">Synced 1 min ago</span>
          </header>

          <div className="call-table" role="table" aria-label="Call review">
            <div className="call-table-head" role="row">
              <span role="columnheader">Time</span>
              <span role="columnheader">Caller</span>
              <span role="columnheader">Outcome</span>
              <span role="columnheader">Sentiment</span>
              <span role="columnheader">Note</span>
            </div>
            {call_logs.map((row) => (
              <div className="call-table-row" role="row" key={row.id || `${row.time}-${row.caller}`}>
                <time className="mono" role="cell">{row.time}</time>
                <strong className="mono" role="cell">{row.caller}</strong>
                <span role="cell">{row.outcome}</span>
                <span role="cell">
                  <span className={`chip ${sentimentChip[String(row.sentiment).toLowerCase()] ?? 'chip--idle'}`}>
                    {row.sentiment}
                  </span>
                </span>
                <p role="cell">{row.review}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <header className="panel-head">
            <div>
              <span className="panel-eyebrow">Intent mix</span>
              <h3>Why people called</h3>
            </div>
          </header>
          <ul className="intent-list">
            {intentRows.map((intent) => (
              <li className="intent-row" key={intent.label}>
                <div className="intent-meta">
                  <span>{intent.label}</span>
                  <span className="mono">{intent.value}%</span>
                </div>
                <div className="intent-track">
                  <span style={{ width: `${intent.value}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

/* ============ Settings ============ */

function SettingsView({
  data,
  onUpdateSettings,
}: {
  data: OverviewData;
  onUpdateSettings: (payload: SettingsProfile) => Promise<void>;
}) {
  const settings = data.settings_profile;
  const [companyName, setCompanyName] = useState(settings.company_name);
  const [phoneNumber, setPhoneNumber] = useState(settings.phone_number);
  const [businessHours, setBusinessHours] = useState(settings.business_hours);
  const [defaultEscalation, setDefaultEscalation] = useState(settings.default_escalation);
  const [sendBookedSummary, setSendBookedSummary] = useState(settings.send_booked_summary);
  const [alertUrgentHandoff, setAlertUrgentHandoff] = useState(settings.alert_urgent_handoff);
  const [emailDailyDigest, setEmailDailyDigest] = useState(settings.email_daily_digest);
  const [flagNegativeSentiment, setFlagNegativeSentiment] = useState(settings.flag_negative_sentiment);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    setCompanyName(settings.company_name);
    setPhoneNumber(settings.phone_number);
    setBusinessHours(settings.business_hours);
    setDefaultEscalation(settings.default_escalation);
    setSendBookedSummary(settings.send_booked_summary);
    setAlertUrgentHandoff(settings.alert_urgent_handoff);
    setEmailDailyDigest(settings.email_daily_digest);
    setFlagNegativeSentiment(settings.flag_negative_sentiment);
  }, [settings]);

  const handleSettingsSave = async () => {
    setSavingSettings(true);
    await onUpdateSettings({
      company_name: companyName,
      phone_number: phoneNumber,
      business_hours: businessHours,
      default_escalation: defaultEscalation,
      send_booked_summary: sendBookedSummary,
      alert_urgent_handoff: alertUrgentHandoff,
      email_daily_digest: emailDailyDigest,
      flag_negative_sentiment: flagNegativeSentiment,
    });
    setSavingSettings(false);
  };

  const toggles = [
    { label: 'Send booked meeting summaries', checked: sendBookedSummary, set: setSendBookedSummary },
    { label: 'Alert team on urgent handoffs', checked: alertUrgentHandoff, set: setAlertUrgentHandoff },
    { label: 'Email daily call digest', checked: emailDailyDigest, set: setEmailDailyDigest },
    { label: 'Flag negative sentiment calls', checked: flagNegativeSentiment, set: setFlagNegativeSentiment },
  ];

  return (
    <div className="view-stack">
      <section className="panel-grid panel-grid--settings">
        <div className="panel">
          <header className="panel-head">
            <div>
              <span className="panel-eyebrow">Business profile</span>
              <h3>Call handling</h3>
            </div>
          </header>
          <div className="settings-fields">
            <label className="app-field">
              <span>Company name</span>
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </label>
            <label className="app-field">
              <span>Main phone number</span>
              <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="mono" />
            </label>
            <label className="app-field">
              <span>Business hours</span>
              <select value={businessHours} onChange={(e) => setBusinessHours(e.target.value)}>
                <option value="weekday">Mon to Fri, 9 AM to 6 PM</option>
                <option value="always">24/7</option>
                <option value="custom">Custom schedule</option>
              </select>
            </label>
            <label className="app-field">
              <span>Default escalation</span>
              <select value={defaultEscalation} onChange={(e) => setDefaultEscalation(e.target.value)}>
                <option value="slack">Slack handoff channel</option>
                <option value="phone">Live phone transfer</option>
                <option value="email">Email summary</option>
              </select>
            </label>
          </div>
        </div>

        <div className="panel">
          <header className="panel-head">
            <div>
              <span className="panel-eyebrow">Channels</span>
              <h3>Connected tools</h3>
            </div>
          </header>
          <ul className="channel-list">
            {[
              { Icon: IconPhone, name: 'Twilio Voice', detail: 'Inbound and outbound calling' },
              { Icon: IconCalendar, name: 'Google Calendar', detail: 'Availability and booking' },
              { Icon: IconGlobe, name: 'HubSpot CRM', detail: 'Leads, transcripts, and tasks' },
            ].map((item) => (
              <li className="channel-row" key={item.name}>
                <span className="channel-icon"><item.Icon size={16} /></span>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.detail}</p>
                </div>
                <span className="chip chip--live">Connected</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <header className="panel-head">
            <div>
              <span className="panel-eyebrow">Notifications</span>
              <h3>Alerts</h3>
            </div>
          </header>
          <div className="toggle-list">
            {toggles.map((t) => (
              <label className="toggle-row" key={t.label}>
                <span>{t.label}</span>
                <span className="switch">
                  <input
                    type="checkbox"
                    checked={t.checked}
                    onChange={(e) => t.set(e.target.checked)}
                  />
                  <span className="switch-track" aria-hidden="true" />
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="panel save-panel">
          <span className="save-icon"><IconCheck size={20} /></span>
          <div>
            <h3>Workspace rules are ready</h3>
            <p>Settings sync to your database the moment you save.</p>
          </div>
          <button
            type="button"
            className="app-btn app-btn--primary"
            onClick={handleSettingsSave}
            disabled={savingSettings}
          >
            {savingSettings ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </section>
    </div>
  );
}

/* ============ Shell ============ */

export default function AppDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const view = getView(location.pathname);
  const copy = pageCopy[view];

  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/overview/');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const json = await res.json();
      setData(json);
      setOffline(false);
    } catch (err) {
      console.error(err);
      setData(demoData);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleUpdateSettings = async (settingsPayload: SettingsProfile) => {
    if (offline) {
      setData((prev) => prev && { ...prev, settings_profile: { ...prev.settings_profile, ...settingsPayload } });
      return;
    }
    try {
      const res = await fetch('/api/settings-profile/1/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsPayload),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      const updatedSettings: SettingsProfile = await res.json();
      setData((prev) => prev && { ...prev, settings_profile: updatedSettings });
    } catch (err) {
      console.error(err);
      alert('Could not save settings — check that the backend is running, then try again.');
    }
  };

  const handleUpdatePlaybook = async (playbookPayload: Playbook) => {
    if (offline) {
      setData((prev) => prev && { ...prev, playbook: { ...prev.playbook, ...playbookPayload } });
      return;
    }
    try {
      const res = await fetch('/api/playbook/1/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playbookPayload),
      });
      if (!res.ok) throw new Error('Failed to update playbook');
      const updatedPlaybook: Playbook = await res.json();
      setData((prev) => prev && { ...prev, playbook: updatedPlaybook });
    } catch (err) {
      console.error(err);
      alert('Could not save the playbook — check that the backend is running, then try again.');
    }
  };

  const handleToggleTriggerRule = async (id: number, status: string) => {
    if (offline) {
      setData((prev) => prev && {
        ...prev,
        trigger_rules: prev.trigger_rules.map((tr) => (tr.id === id ? { ...tr, status } : tr)),
      });
      return;
    }
    try {
      const res = await fetch(`/api/trigger-rules/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update trigger');
      const updatedTrigger: TriggerRule = await res.json();
      setData((prev) => prev && {
        ...prev,
        trigger_rules: prev.trigger_rules.map((tr) => (tr.id === id ? updatedTrigger : tr)),
      });
    } catch (err) {
      console.error(err);
      alert('Could not update the trigger — check that the backend is running, then try again.');
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('nexusVoiceSession');
    navigate('/login');
  };

  if (loading || !data) {
    return (
      <div className="app-shell app-shell--loading">
        <div className="app-loading">
          <motion.span
            className="app-loading-ring"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
          />
          <p>Connecting to the switchboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Workspace navigation">
        <NavLink to="/" className="app-brand">
          <IconLogo size={30} />
          <span>
            Nexus<em>Voice</em>
          </span>
        </NavLink>

        <nav className="app-nav">
          {navSections.map((section) => (
            <div className="app-nav-section" key={section.label}>
              <span className="app-nav-label mono">{section.label}</span>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `app-nav-link ${isActive ? 'is-active' : ''}`}
                >
                  <item.Icon size={17} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="app-sidebar-status">
          <div className="app-status-head">
            <LiveEq />
            <strong>Ava is live</strong>
          </div>
          <p>3 active calls · 91% readiness</p>
        </div>

        <button type="button" className="app-logout" onClick={handleLogout}>
          <IconLogOut size={16} />
          Sign out
        </button>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="app-topbar-copy">
            <span className="app-eyebrow mono">{copy.eyebrow}</span>
            <h1>{copy.title}</h1>
            <p>{copy.desc}</p>
          </div>
          <div className="app-topbar-actions">
            {offline && (
              <button
                className="chip chip--ringing app-offline"
                onClick={fetchOverview}
                title="Backend unreachable — showing demo data. Click to retry."
              >
                Demo data · retry
              </button>
            )}
            <ThemeToggle />
            <button className="app-btn app-btn--ghost" type="button">
              <IconHeadset size={15} />
              Test call
            </button>
            <NavLink className="app-btn app-btn--primary" to="/app/training">
              Train agent
            </NavLink>
          </div>
        </header>

        <main className="app-content">
          {view === 'dashboard' && <DashboardView data={data} />}
          {view === 'training' && (
            <AgentStudio
              data={data}
              onUpdatePlaybook={handleUpdatePlaybook}
              onToggleTriggerRule={handleToggleTriggerRule}
            />
          )}
          {view === 'activity' && <ActivityView data={data} />}
          {view === 'settings' && <SettingsView data={data} onUpdateSettings={handleUpdateSettings} />}
        </main>
      </div>
    </div>
  );
}
