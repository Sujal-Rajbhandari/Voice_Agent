from django.core.management.base import BaseCommand
from dashboard.models import (
    Metric,
    LiveCall,
    CallLog,
    TrainingTask,
    Scenario,
    KnowledgeSource,
    TriggerRule,
    OutputRule,
    Playbook,
    SettingsProfile
)

class Command(BaseCommand):
    help = 'Seed the database with initial mock data for the voice agent dashboard'

    def handle(self, *args, **options):
        # 1. Clear existing data
        self.stdout.write('Clearing existing database records...')
        Metric.objects.all().delete()
        LiveCall.objects.all().delete()
        CallLog.objects.all().delete()
        TrainingTask.objects.all().delete()
        Scenario.objects.all().delete()
        KnowledgeSource.objects.all().delete()
        TriggerRule.objects.all().delete()
        OutputRule.objects.all().delete()
        Playbook.objects.all().delete()
        SettingsProfile.objects.all().delete()

        # 2. Seed Metrics
        self.stdout.write('Seeding Metrics...')
        metrics = [
            {'label': 'Answer rate', 'value': '98.7%', 'change': '+2.4%', 'icon': 'IconPhone'},
            {'label': 'Bookings', 'value': '87', 'change': '+14%', 'icon': 'IconCalendar'},
            {'label': 'Qualified leads', 'value': '342', 'change': '+19%', 'icon': 'IconTarget'},
            {'label': 'Training score', 'value': '91%', 'change': '+6%', 'icon': 'IconCpu'},
        ]
        for m in metrics:
            Metric.objects.create(**m)

        # 3. Seed LiveCalls
        self.stdout.write('Seeding Live Calls...')
        live_calls = [
            {'caller': 'Olivia Carter', 'company': 'Northline Dental', 'status': 'Booking now', 'intent': 'Demo request', 'tone': 'positive'},
            {'caller': 'Marcus Flynn', 'company': 'Atlas Logistics', 'status': 'Qualifying', 'intent': 'Pricing', 'tone': 'neutral'},
            {'caller': 'Nina Patel', 'company': 'CityCare Clinic', 'status': 'Needs handoff', 'intent': 'Billing exception', 'tone': 'urgent'},
            {'caller': 'Leo Morris', 'company': 'RiverWorks', 'status': 'Follow-up set', 'intent': 'Integration question', 'tone': 'positive'},
        ]
        for lc in live_calls:
            LiveCall.objects.create(**lc)

        # 4. Seed CallLogs
        self.stdout.write('Seeding Call Logs...')
        call_logs = [
            {'time': '10:42 AM', 'caller': 'Olivia Carter', 'outcome': 'Booked demo', 'sentiment': 'Positive', 'review': 'Clean close, CRM updated'},
            {'time': '10:31 AM', 'caller': 'Marcus Flynn', 'outcome': 'Needs pricing', 'sentiment': 'Neutral', 'review': 'Asked budget too late'},
            {'time': '10:18 AM', 'caller': 'Nina Patel', 'outcome': 'Human handoff', 'sentiment': 'Urgent', 'review': 'Correct escalation path'},
            {'time': '09:54 AM', 'caller': 'Leo Morris', 'outcome': 'Qualified lead', 'sentiment': 'Positive', 'review': 'Good integration summary'},
            {'time': '09:20 AM', 'caller': 'Priya Shah', 'outcome': 'Retry scheduled', 'sentiment': 'Neutral', 'review': 'Retry window captured'},
        ]
        for cl in call_logs:
            CallLog.objects.create(**cl)

        # 5. Seed TrainingTasks
        self.stdout.write('Seeding Training Tasks...')
        training_tasks = [
            {'title': 'Upload pricing FAQ', 'detail': 'The agent saw 26 pricing questions this week.', 'progress': 82},
            {'title': 'Improve competitor objection', 'detail': '9 calls asked how Nexus compares with Aircall.', 'progress': 68},
            {'title': 'Review handoff phrasing', 'detail': 'Two callers sounded frustrated before transfer.', 'progress': 74},
        ]
        for tt in training_tasks:
            TrainingTask.objects.create(**tt)

        # 6. Seed Scenarios
        self.stdout.write('Seeding Scenarios...')
        scenarios = [
            {'name': 'Inbound demo request', 'pass_rate': '94%', 'focus': 'Qualify budget and book'},
            {'name': 'Angry billing caller', 'pass_rate': '82%', 'focus': 'Escalate without arguing'},
            {'name': 'After-hours voicemail', 'pass_rate': '89%', 'focus': 'Capture intent and retry'},
        ]
        for s in scenarios:
            Scenario.objects.create(**s)

        # 7. Seed KnowledgeSources
        self.stdout.write('Seeding Knowledge Sources...')
        knowledge_sources = [
            {'name': 'Website pages', 'type_info': '12 pages', 'status': 'Synced'},
            {'name': 'Pricing FAQ', 'type_info': 'PDF', 'status': 'Needs review'},
            {'name': 'HubSpot deals', 'type_info': 'CRM fields', 'status': 'Connected'},
            {'name': 'Support macros', 'type_info': 'Zendesk', 'status': 'Synced'},
        ]
        for ks in knowledge_sources:
            KnowledgeSource.objects.create(**ks)

        # 8. Seed TriggerRules
        self.stdout.write('Seeding Trigger Rules...')
        trigger_rules = [
            {'title': "Every weekday at 8:45 AM", 'detail': "Warm up the agent with today's calendar, open deals, and new FAQs.", 'status': 'Active'},
            {'title': "Missed call detected", 'detail': "Call back within 90 seconds and capture the reason for calling.", 'status': 'Active'},
            {'title': "High-intent form submitted", 'detail': "Place an outbound qualification call and offer two meeting slots.", 'status': 'Active'},
            {'title': "Negative sentiment detected", 'detail': "Escalate to a human and attach transcript, caller tone, and next step.", 'status': 'Paused'},
            {'title': "New pricing document uploaded", 'detail': "Retrain answers that mention packaging, discounts, and contract terms.", 'status': 'Active'},
        ]
        for tr in trigger_rules:
            TriggerRule.objects.create(**tr)

        # 9. Seed OutputRules
        self.stdout.write('Seeding Output Rules...')
        output_rules = [
            {'title': 'CRM lead summary', 'detail': 'Push intent, budget, timeline, objections, and next step to HubSpot.'},
            {'title': 'Booking confirmation', 'detail': 'Send calendar invite, transcript summary, and prep notes to both sides.'},
            {'title': 'Human handoff packet', 'detail': 'Post urgent calls to Slack with call reason, sentiment, and transfer status.'},
            {'title': 'Training feedback item', 'detail': 'Create a review task when Ava gives a low-confidence answer.'},
        ]
        for oru in output_rules:
            OutputRule.objects.create(**oru)

        # 10. Seed Playbook singleton
        self.stdout.write('Seeding Playbook...')
        Playbook.objects.create(id=1)

        # 11. Seed SettingsProfile singleton
        self.stdout.write('Seeding Settings Profile...')
        SettingsProfile.objects.create(id=1)

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with mock dashboard data!'))
