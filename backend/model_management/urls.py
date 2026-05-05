from django.urls import path
from . import views

urlpatterns = [
    path('models/', views.get_all_models),
    path('models/deployed/',                     views.get_deployed_model),
    path('models/<int:model_id>/', views.get_model_detail),
    path('models/<int:model_id>/toggle-status/', views.toggle_model_status),
    path('models/<int:model_id>/deploy/',        views.deploy_model),       # ← new
    path('models/deployed/',                     views.get_deployed_model),
    path('models/<int:model_id>/delete/',        views.delete_model),
]