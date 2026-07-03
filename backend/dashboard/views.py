from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
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
from .serializers import (
    MetricSerializer,
    LiveCallSerializer,
    CallLogSerializer,
    TrainingTaskSerializer,
    ScenarioSerializer,
    KnowledgeSourceSerializer,
    TriggerRuleSerializer,
    OutputRuleSerializer,
    PlaybookSerializer,
    SettingsProfileSerializer
)

class MetricViewSet(viewsets.ModelViewSet):
    queryset = Metric.objects.all()
    serializer_class = MetricSerializer


class LiveCallViewSet(viewsets.ModelViewSet):
    queryset = LiveCall.objects.all()
    serializer_class = LiveCallSerializer


class CallLogViewSet(viewsets.ModelViewSet):
    queryset = CallLog.objects.all()
    serializer_class = CallLogSerializer


class TrainingTaskViewSet(viewsets.ModelViewSet):
    queryset = TrainingTask.objects.all()
    serializer_class = TrainingTaskSerializer


class ScenarioViewSet(viewsets.ModelViewSet):
    queryset = Scenario.objects.all()
    serializer_class = ScenarioSerializer


class KnowledgeSourceViewSet(viewsets.ModelViewSet):
    queryset = KnowledgeSource.objects.all()
    serializer_class = KnowledgeSourceSerializer


class TriggerRuleViewSet(viewsets.ModelViewSet):
    queryset = TriggerRule.objects.all()
    serializer_class = TriggerRuleSerializer


class OutputRuleViewSet(viewsets.ModelViewSet):
    queryset = OutputRule.objects.all()
    serializer_class = OutputRuleSerializer


class PlaybookViewSet(viewsets.ModelViewSet):
    queryset = Playbook.objects.all()
    serializer_class = PlaybookSerializer

    # Helper helper to get/update singleton
    def list(self, request, *args, **kwargs):
        playbook, created = Playbook.objects.get_or_create(id=1)
        serializer = self.get_serializer(playbook)
        return Response(serializer.data)


class SettingsProfileViewSet(viewsets.ModelViewSet):
    queryset = SettingsProfile.objects.all()
    serializer_class = SettingsProfileSerializer

    # Helper helper to get/update singleton
    def list(self, request, *args, **kwargs):
        settings_profile, created = SettingsProfile.objects.get_or_create(id=1)
        serializer = self.get_serializer(settings_profile)
        return Response(serializer.data)


@api_view(['GET'])
def dashboard_overview(request):
    """
    Consolidated endpoint to fetch all initial dashboard state in a single roundtrip.
    """
    metrics = Metric.objects.all()
    live_calls = LiveCall.objects.all()
    call_logs = CallLog.objects.all()
    training_tasks = TrainingTask.objects.all()
    scenarios = Scenario.objects.all()
    knowledge_sources = KnowledgeSource.objects.all()
    trigger_rules = TriggerRule.objects.all()
    output_rules = OutputRule.objects.all()
    playbook, _ = Playbook.objects.get_or_create(id=1)
    settings_profile, _ = SettingsProfile.objects.get_or_create(id=1)

    return Response({
        'metrics': MetricSerializer(metrics, many=True).data,
        'live_calls': LiveCallSerializer(live_calls, many=True).data,
        'call_logs': CallLogSerializer(call_logs, many=True).data,
        'training_tasks': TrainingTaskSerializer(training_tasks, many=True).data,
        'scenarios': ScenarioSerializer(scenarios, many=True).data,
        'knowledge_sources': KnowledgeSourceSerializer(knowledge_sources, many=True).data,
        'trigger_rules': TriggerRuleSerializer(trigger_rules, many=True).data,
        'output_rules': OutputRuleSerializer(output_rules, many=True).data,
        'playbook': PlaybookSerializer(playbook).data,
        'settings_profile': SettingsProfileSerializer(settings_profile).data,
    })
