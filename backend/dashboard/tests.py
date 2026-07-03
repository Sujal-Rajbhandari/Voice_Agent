from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
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

class DashboardAPITests(APITestCase):

    def setUp(self):
        # Set up initial test data
        self.metric = Metric.objects.create(label='Test Metric', value='10%', change='+1%', icon='IconPhone')
        self.live_call = LiveCall.objects.create(caller='Test Caller', company='Test Corp', status='Active', intent='Help', tone='neutral')
        self.call_log = CallLog.objects.create(time='10:00 AM', caller='Old Caller', outcome='Resolved', sentiment='Positive', review='Good')
        self.task = TrainingTask.objects.create(title='Test Task', detail='Task Details', progress=50)
        self.scenario = Scenario.objects.create(name='Test Sim', pass_rate='90%', focus='Focus on help')
        self.source = KnowledgeSource.objects.create(name='Test Source', type_info='PDF', status='Synced')
        self.trigger = TriggerRule.objects.create(title='Test Trigger', detail='Trigger Details', status='Active')
        self.output = OutputRule.objects.create(title='Test Output', detail='Output Details')
        self.playbook = Playbook.objects.create(id=1, greeting='Hello', qualification='Ask size', escalation='Transfer')
        self.settings = SettingsProfile.objects.create(id=1, company_name='Test Company', phone_number='12345')

    def test_dashboard_overview(self):
        url = reverse('dashboard-overview')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('metrics', response.data)
        self.assertIn('live_calls', response.data)
        self.assertIn('settings_profile', response.data)
        self.assertIn('playbook', response.data)
        self.assertEqual(response.data['metrics'][0]['label'], 'Test Metric')

    def test_playbook_singleton_get_and_patch(self):
        url = '/api/playbook/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Note: DRF ViewSet mapped to list returns details in list representation. We custom-implemented
        # list to return the singleton object directly.
        self.assertEqual(response.data['greeting'], 'Hello')

        # Patch playbook fields
        detail_url = '/api/playbook/1/'
        patch_response = self.client.patch(detail_url, {'greeting': 'Welcome to Nexus'}, format='json')
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.data['greeting'], 'Welcome to Nexus')
        
        # Verify persistence
        self.assertEqual(Playbook.objects.get(id=1).greeting, 'Welcome to Nexus')

    def test_settings_singleton_get_and_patch(self):
        url = '/api/settings-profile/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['company_name'], 'Test Company')

        # Patch settings fields
        detail_url = '/api/settings-profile/1/'
        patch_response = self.client.patch(detail_url, {'company_name': 'Updated Company'}, format='json')
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.data['company_name'], 'Updated Company')
        
        # Verify persistence
        self.assertEqual(SettingsProfile.objects.get(id=1).company_name, 'Updated Company')

    def test_trigger_rule_patch(self):
        detail_url = f'/api/trigger-rules/{self.trigger.id}/'
        patch_response = self.client.patch(detail_url, {'status': 'Paused'}, format='json')
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.data['status'], 'Paused')
        
        # Verify persistence
        self.assertEqual(TriggerRule.objects.get(id=self.trigger.id).status, 'Paused')
