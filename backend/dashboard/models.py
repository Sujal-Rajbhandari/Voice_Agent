from django.db import models

class Metric(models.Model):
    label = models.CharField(max_length=100)
    value = models.CharField(max_length=50)
    change = models.CharField(max_length=50)
    icon = models.CharField(max_length=50, default='IconPhone')

    def __str__(self):
        return self.label


class LiveCall(models.Model):
    caller = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    status = models.CharField(max_length=100)
    intent = models.CharField(max_length=100)
    tone = models.CharField(max_length=50)  # e.g., positive, neutral, urgent

    def __str__(self):
        return f"{self.caller} ({self.company})"


class CallLog(models.Model):
    time = models.CharField(max_length=50)  # matching frontend time representation (e.g. 10:42 AM)
    caller = models.CharField(max_length=100)
    outcome = models.CharField(max_length=100)
    sentiment = models.CharField(max_length=50)
    review = models.TextField()

    def __str__(self):
        return f"{self.time} - {self.caller}"


class TrainingTask(models.Model):
    title = models.CharField(max_length=200)
    detail = models.TextField()
    progress = models.IntegerField()  # percentage 0 to 100

    def __str__(self):
        return self.title


class Scenario(models.Model):
    name = models.CharField(max_length=200)
    pass_rate = models.CharField(max_length=50)
    focus = models.TextField()

    def __str__(self):
        return self.name


class KnowledgeSource(models.Model):
    name = models.CharField(max_length=200)
    type_info = models.CharField(max_length=100)  # e.g. 12 pages, PDF
    status = models.CharField(max_length=50)  # e.g. Synced, Needs review

    def __str__(self):
        return self.name


class TriggerRule(models.Model):
    title = models.CharField(max_length=200)
    detail = models.TextField()
    status = models.CharField(max_length=50, default='Active')  # e.g. Active, Paused

    def __str__(self):
        return self.title


class OutputRule(models.Model):
    title = models.CharField(max_length=200)
    detail = models.TextField()

    def __str__(self):
        return self.title


class Playbook(models.Model):
    greeting = models.TextField(default="Hi, this is Ava from Nexus. I can answer questions, qualify your request, or book a quick call with our team.")
    qualification = models.TextField(default="Ask for company size, current call volume, timeline, budget range, and preferred meeting time.")
    escalation = models.TextField(default="Transfer to a human for billing disputes, cancellation requests, legal questions, or high frustration.")

    def __str__(self):
        return "Voice Playbook"


class SettingsProfile(models.Model):
    company_name = models.CharField(max_length=200, default="Nexus Voice Demo")
    phone_number = models.CharField(max_length=50, default="+1 (415) 555-0198")
    business_hours = models.CharField(max_length=100, default="weekday")
    default_escalation = models.CharField(max_length=50, default="slack")
    send_booked_summary = models.BooleanField(default=True)
    alert_urgent_handoff = models.BooleanField(default=True)
    email_daily_digest = models.BooleanField(default=True)
    flag_negative_sentiment = models.BooleanField(default=False)

    def __str__(self):
        return self.company_name
