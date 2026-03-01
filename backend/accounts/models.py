from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    username = None  # only if you want email login only

    email = models.EmailField(unique=True)

    is_admin = models.BooleanField(default=False)
    is_conservationist = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email
    

"""
Password already there since im inheriting from Abstract User
"""