from rest_framework import serializers
from .models import MLModel, TrainingConfig, PerformanceMetric, ModelArtifact

class TrainingConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingConfig
        exclude = ['model']

class PerformanceMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceMetric
        exclude = ['model']

class ModelArtifactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelArtifact
        fields = '__all__'

class MLModelSerializer(serializers.ModelSerializer):
    training_config = TrainingConfigSerializer(read_only=True)
    metrics = PerformanceMetricSerializer(read_only=True)
    artifacts = ModelArtifactSerializer(many=True, read_only=True)

    class Meta:
        model = MLModel
        fields = '__all__'