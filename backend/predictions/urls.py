from django.urls import path
from .views import (
    UploadAndPredictView, MyPredictionsView, EditPredictionView,
    InsightsView, ClearPredictionsView, InsightSettingsView,
    AdminClearView, UploadZipAndPredictView,
)

urlpatterns = [
    path('upload/', UploadAndPredictView.as_view(), name='upload_predict'),
    path('upload-zip/', UploadZipAndPredictView.as_view(), name='upload_zip_predict'),
    path('my-predictions/', MyPredictionsView.as_view(), name='my_predictions'),
    path('<int:prediction_id>/edit/', EditPredictionView.as_view(), name='edit_prediction'),
    path('insights/', InsightsView.as_view(), name='insights'),
    path('clear/', ClearPredictionsView.as_view(), name='clear_predictions'),
    path('admin-clear/', AdminClearView.as_view(), name='admin_clear'),
    path('insight-settings/', InsightSettingsView.as_view(), name='insight_settings'),
]