from rest_framework import serializers
from .models import TrainingJob

class TrainingJobSerializer(serializers.ModelSerializer):
    class Meta:
        model  = TrainingJob
        fields = '__all__'
        read_only_fields = ['status', 'log', 'created_at', 'completed_at', 'started_by', 'output_pth']
