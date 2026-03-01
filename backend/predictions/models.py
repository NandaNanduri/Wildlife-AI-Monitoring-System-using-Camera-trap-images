from django.db import models

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
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    species = models.ForeignKey(Species, on_delete=models.SET_NULL, null=True)
    model_used = models.ForeignKey(AIModel, on_delete=models.SET_NULL, null=True)
    
    confidence_score = models.FloatField()
    is_empty = models.BooleanField(default=False)
    predicted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prediction for Image {self.image.id}"
