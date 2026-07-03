from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MetricViewSet,
    LiveCallViewSet,
    CallLogViewSet,
    TrainingTaskViewSet,
    ScenarioViewSet,
    KnowledgeSourceViewSet,
    TriggerRuleViewSet,
    OutputRuleViewSet,
    PlaybookViewSet,
    SettingsProfileViewSet,
    dashboard_overview
)

router = DefaultRouter()
router.register('metrics', MetricViewSet, basename='metric')
router.register('live-calls', LiveCallViewSet, basename='live-call')
router.register('call-logs', CallLogViewSet, basename='call-log')
router.register('training-tasks', TrainingTaskViewSet, basename='training-task')
router.register('scenarios', ScenarioViewSet, basename='scenario')
router.register('knowledge-sources', KnowledgeSourceViewSet, basename='knowledge-source')
router.register('trigger-rules', TriggerRuleViewSet, basename='trigger-rule')
router.register('output-rules', OutputRuleViewSet, basename='output-rule')
router.register('playbook', PlaybookViewSet, basename='playbook')
router.register('settings-profile', SettingsProfileViewSet, basename='settings-profile')

urlpatterns = [
    path('overview/', dashboard_overview, name='dashboard-overview'),
    path('', include(router.urls)),
]
