from django.contrib import admin
from .models import MLModel, TrainingConfig, PerformanceMetric, ModelArtifact

admin.site.register(MLModel)
admin.site.register(TrainingConfig)
admin.site.register(PerformanceMetric)
admin.site.register(ModelArtifact)
