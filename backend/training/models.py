from django.db import models

class TrainingJob(models.Model):
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('running',   'Running'),
        ('completed', 'Completed'),
        ('failed',    'Failed'),
    ]
    MODEL_CHOICES = [
        ('resnet',       'ResNet50'),
        ('efficientnet', 'EfficientNetB3'),
    ]

    model_architecture = models.CharField(max_length=20, choices=MODEL_CHOICES)
    epochs             = models.IntegerField()
    batch_size         = models.IntegerField()
    learning_rate      = models.FloatField()
    is_cancelled = models.BooleanField(default=False)
    custom_name = models.CharField(max_length=100, blank=True)
    val_split          = models.FloatField(default=0.2)
    warmup_epochs      = models.IntegerField(default=3)
    focal_loss_gamma   = models.FloatField(default=2.0)
    notes              = models.TextField(blank=True)

    dataset_zip        = models.FileField(upload_to='training_datasets/')
    output_pth         = models.CharField(max_length=300, blank=True)

    status             = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    log                = models.TextField(blank=True)
    created_at         = models.DateTimeField(auto_now_add=True)
    completed_at       = models.DateTimeField(null=True, blank=True)
    started_by         = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.model_architecture} job #{self.id} ({self.status})"

