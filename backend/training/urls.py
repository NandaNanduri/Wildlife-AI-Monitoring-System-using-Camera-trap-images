from django.urls import path
from . import views

urlpatterns = [
    path('start/',         views.start_training),
    path('jobs/',          views.list_jobs),
    path('jobs/<int:job_id>/', views.job_status),
    path('jobs/<int:job_id>/cancel/', views.cancel_training),
]
