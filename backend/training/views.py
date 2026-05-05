from django.shortcuts import render

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import TrainingJob
from .serializers import TrainingJobSerializer
from .trainer import start_training_thread
from model_management.permissions import IsSystemAdmin


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
@parser_classes([MultiPartParser, FormParser])
def start_training(request):
    serializer = TrainingJobSerializer(data=request.data)
    if serializer.is_valid():
        job = serializer.save(started_by=request.user)
        start_training_thread(job.id)
        return Response(TrainingJobSerializer(job).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def job_status(request, job_id):
    try:
        job = TrainingJob.objects.get(id=job_id)
    except TrainingJob.DoesNotExist:
        return Response({'error': 'Job not found'}, status=404)
    return Response(TrainingJobSerializer(job).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def list_jobs(request):
    jobs = TrainingJob.objects.all().order_by('-created_at')
    return Response(TrainingJobSerializer(jobs, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def cancel_training(request, job_id):
    try:
        job = TrainingJob.objects.get(id=job_id)
    except TrainingJob.DoesNotExist:
        return Response({'error': 'Job not found'}, status=404)
    
    if job.status != 'running':
        return Response({'error': 'Job is not currently running'}, status=400)
    
    job.is_cancelled = True
    job.save(update_fields=['is_cancelled'])
    return Response({'message': 'Cancellation requested. Training will stop after current epoch.'})