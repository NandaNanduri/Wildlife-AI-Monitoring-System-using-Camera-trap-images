from django.db import models

from django.db import models

class MLModel(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive'), ('deployed', 'Deployed' )]
    
    name = models.CharField(max_length=100)           # e.g. ResNet50
    model_type = models.CharField(max_length=100)     # e.g. CNN - Residual Network
    version = models.CharField(max_length=50)         # e.g. v1.0
    date_trained = models.DateField()
    dataset_used = models.CharField(max_length=200)   # e.g. Serengeti Camera Trap Dataset
    num_classes = models.IntegerField()               # 9
    total_training_images = models.IntegerField()
    total_validation_images = models.IntegerField()
    total_test_images = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inactive')
    weight_file = models.CharField(max_length=200)    # filename of .pth file
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.version})"


class TrainingConfig(models.Model):
    model = models.OneToOneField(MLModel, on_delete=models.CASCADE, related_name='training_config')
    epochs = models.IntegerField()
    batch_size = models.IntegerField()
    learning_rate = models.FloatField()
    optimizer = models.CharField(max_length=50)       # e.g. Adam
    loss_function = models.TextField()  # e.g. CrossEntropyLoss
    train_split = models.FloatField()                 # e.g. 0.7
    val_split = models.FloatField()                   # e.g. 0.15
    test_split = models.FloatField()                  # e.g. 0.15
    augmentation_used = models.TextField(blank=True)  # describe augmentations
    hardware = models.CharField(max_length=100, blank=True)  # e.g. GPU/CPU
    training_duration = models.CharField(max_length=100, blank=True)  # e.g. 2h 30m


class PerformanceMetric(models.Model):
    model = models.OneToOneField(MLModel, on_delete=models.CASCADE, related_name='metrics')
    accuracy = models.FloatField()
    macro_precision = models.FloatField()
    macro_recall = models.FloatField()
    macro_f1 = models.FloatField()
    weighted_precision = models.FloatField()
    weighted_recall = models.FloatField()
    weighted_f1 = models.FloatField()
    per_class_metrics = models.JSONField()  # store per-class as JSON


class ModelArtifact(models.Model):
    ARTIFACT_TYPES = [
        ('confusion_matrix', 'Confusion Matrix'),
        ('training_curves', 'Training Curves'),
        ('species_distribution', 'Species Distribution'),
        ('architecture_comparison', 'Architecture Comparison'),
    ]
    model = models.ForeignKey(MLModel, on_delete=models.CASCADE, related_name='artifacts')
    artifact_type = models.CharField(max_length=50, choices=ARTIFACT_TYPES)
    image_path = models.CharField(max_length=300)  # relative path to PNG
    label = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.model.name} - {self.artifact_type}"
