from django.db import models
from images.models import Image
from django.conf import settings


class Species(models.Model):
    species_name = models.CharField(max_length=100)
    scientific_name = models.CharField(max_length=150)
    category = models.CharField(max_length=100)

    def __str__(self):
        return self.species_name
    
class AIModel(models.Model):
    model_name = models.CharField(max_length=100)
    version = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.model_name
    

class Prediction(models.Model):
    image = models.ForeignKey(Image, on_delete=models.CASCADE, related_name="predictions")
    species = models.ForeignKey(Species, on_delete=models.SET_NULL, null=True, blank=True)
    model_used = models.ForeignKey(AIModel, on_delete=models.SET_NULL, null=True)

    confidence_score = models.FloatField()
    is_empty = models.BooleanField(default=False)
    time_of_day = models.CharField(max_length=20, blank=True, default='unknown')
    site = models.CharField(max_length=100, blank=True, default='unknown')
    is_corrected = models.BooleanField(default=False)
    notes = models.TextField(blank=True, default='')
    predicted_at = models.DateTimeField(auto_now_add=True)
    captured_at = models.DateTimeField(null=True, blank=True)
    is_hidden = models.BooleanField(default=False)

    def __str__(self):
        return f"Prediction for Image {self.image.id}"
    

class Dataset(models.Model):
    dataset_name = models.CharField(max_length=100)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'is_admin': True}
    )
    model_linked = models.ForeignKey(AIModel, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.dataset_name
    


class InsightSettings(models.Model):
    # Numeric thresholds
    predator_threshold        = models.IntegerField(default=3)
    empty_frame_threshold     = models.FloatField(default=0.4)
    nocturnal_threshold       = models.FloatField(default=0.7)
    low_confidence_threshold  = models.FloatField(default=50.0)
    min_detections_nocturnal  = models.IntegerField(default=3)
    biodiversity_threshold    = models.FloatField(default=0.6)

    # Species classifications (stored as comma-separated strings)
    predator_species          = models.TextField(default='lion,leopard,cheetah,hyenaspotted')
    prey_species              = models.TextField(default='zebra,wildebeest,impala,giraffe')
    rare_species              = models.TextField(default='leopard,cheetah')
    diurnal_species           = models.TextField(default='cheetah,impala,giraffe,zebra,wildebeest')
    nocturnal_species         = models.TextField(default='leopard,hyenaspotted')

    class Meta:
        verbose_name = 'Insight Settings'

    def get_predators(self):
        return set(s.strip() for s in self.predator_species.split(',') if s.strip())

    def get_prey(self):
        return set(s.strip() for s in self.prey_species.split(',') if s.strip())

    def get_rare(self):
        return set(s.strip() for s in self.rare_species.split(',') if s.strip())

    def get_diurnal(self):
        return set(s.strip() for s in self.diurnal_species.split(',') if s.strip())

    def get_nocturnal(self):
        return set(s.strip() for s in self.nocturnal_species.split(',') if s.strip())
