from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Image as ImageModel
from .serializers import ImageSerializer


class ImageUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        """Upload one or multiple images."""
        files = request.FILES.getlist('files')  # batch upload support
        if not files:
            # fallback for single file field named 'file'
            single = request.FILES.get('file')
            if single:
                files = [single]
        if not files:
            return Response({'error': 'No files provided.'}, status=status.HTTP_400_BAD_REQUEST)

        created = []
        for f in files:
            img = ImageModel.objects.create(file=f, uploaded_by=request.user)
            created.append(ImageSerializer(img).data)

        return Response({'uploaded': created}, status=status.HTTP_201_CREATED)
