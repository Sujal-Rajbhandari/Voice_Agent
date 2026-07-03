/* Shapes served by the Django API (/api/overview/ and PATCH endpoints) */

export type Metric = { label: string; value: string; change: string; icon: string };
export type LiveCall = { id?: number; caller: string; company: string; intent: string; status: string; tone?: string };
export type TrainingTask = { id?: number; title: string; detail: string; progress: number };
export type Scenario = { id?: number; name: string; focus: string; pass_rate: string };
export type TriggerRule = { id: number; title: string; detail: string; status: string };
export type KnowledgeSource = { id?: number; name: string; type_info: string; status: string };
export type OutputRule = { id?: number; title: string; detail: string };
export type Playbook = { greeting: string; qualification: string; escalation: string };
export type CallLog = { id?: number; time: string; caller: string; outcome: string; sentiment: string; review: string };

export type SettingsProfile = {
  company_name: string;
  phone_number: string;
  business_hours: string;
  default_escalation: string;
  send_booked_summary: boolean;
  alert_urgent_handoff: boolean;
  email_daily_digest: boolean;
  flag_negative_sentiment: boolean;
};

export type OverviewData = {
  metrics: Metric[];
  live_calls: LiveCall[];
  training_tasks: TrainingTask[];
  scenarios: Scenario[];
  trigger_rules: TriggerRule[];
  knowledge_sources: KnowledgeSource[];
  output_rules: OutputRule[];
  playbook: Playbook;
  call_logs: CallLog[];
  settings_profile: SettingsProfile;
};
