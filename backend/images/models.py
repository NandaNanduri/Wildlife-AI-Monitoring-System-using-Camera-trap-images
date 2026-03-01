from django.db import models

from django.conf import settings

class Image(models.Model):
    file = models.ImageField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'conservationist'}
    )

    def __str__(self):
        return f"Image {self.id}"
