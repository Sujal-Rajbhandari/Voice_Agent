from rest_framework import serializers
from .models import (
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

class MetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metric
        fields = '__all__'


class LiveCallSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveCall
        fields = '__all__'


class CallLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallLog
        fields = '__all__'


class TrainingTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingTask
        fields = '__all__'


class ScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scenario
        fields = '__all__'


class KnowledgeSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeSource
        fields = '__all__'


class TriggerRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TriggerRule
        fields = '__all__'


class OutputRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutputRule
        fields = '__all__'


class PlaybookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playbook
        fields = '__all__'


class SettingsProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SettingsProfile
        fields = '__all__'
