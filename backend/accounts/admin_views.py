from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.models import User
from images.models import Image
from predictions.models import Prediction
from django.utils import timezone
from datetime import timedelta


class IsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.is_admin


class AdminStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        # Core stats
        total_users       = User.objects.count()
        total_images      = Image.objects.count()
        total_predictions = Prediction.objects.count()

        # Recent uploads (last 5)
        recent_images = Image.objects.select_related('uploaded_by').order_by('-uploaded_at')[:5]
        recent_uploads = [
            {
                'user':        img.uploaded_by.email,
                'uploaded_at': img.uploaded_at,
                'image_id':    img.id,
            }
            for img in recent_images
        ]

        # Recent predictions (last 5)
        recent_preds = Prediction.objects.select_related('image__uploaded_by', 'species').order_by('-predicted_at')[:5]
        recent_predictions = [
            {
                'user':         pred.image.uploaded_by.email,
                'species':      pred.species.species_name if pred.species else 'empty',
                'confidence':   round(pred.confidence_score * 100, 1),
                'is_empty':     pred.is_empty,
                'predicted_at': pred.predicted_at,
            }
            for pred in recent_preds
        ]

        return Response({
            'total_users':        total_users,
            'total_images':       total_images,
            'total_predictions':  total_predictions,
            'recent_uploads':     recent_uploads,
            'recent_predictions': recent_predictions,
        })