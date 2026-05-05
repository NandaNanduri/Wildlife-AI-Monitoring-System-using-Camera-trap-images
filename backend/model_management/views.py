from django.shortcuts import render

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .permissions import IsSystemAdmin
from rest_framework.response import Response
from rest_framework import status
from .models import MLModel
from django.db.models import Q
from .serializers import MLModelSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def get_all_models(request):
    models = MLModel.objects.all()
    serializer = MLModelSerializer(models, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def get_model_detail(request, model_id):
    try:
        ml_model = MLModel.objects.get(id=model_id)
    except MLModel.DoesNotExist:
        return Response({'error': 'Model not found'}, status=404)
    serializer = MLModelSerializer(ml_model)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def toggle_model_status(request, model_id):
    try:
        ml_model = MLModel.objects.get(id=model_id)
    except MLModel.DoesNotExist:
        return Response({'error': 'Model not found'}, status=404)
    ml_model.status = 'active' if ml_model.status == 'inactive' else 'inactive'
    ml_model.save()
    return Response({'status': ml_model.status})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def deploy_model(request, model_id):
    try:
        ml_model = MLModel.objects.get(id=model_id)
    except MLModel.DoesNotExist:
        return Response({'error': 'Model not found'}, status=404)

    # Un-deploy any currently deployed model first
    MLModel.objects.filter(status='deployed').update(status='inactive')

    ml_model.status = 'deployed'
    ml_model.save()
    return Response({'status': ml_model.status, 'name': ml_model.name})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_deployed_model(request):
    try:
        ml_model = MLModel.objects.get(status='deployed')
        return Response({
            'id':           ml_model.id,
            'name':         ml_model.name,
            'weight_file':  ml_model.weight_file,
            'model_type':   'resnet' if 'resnet' in ml_model.weight_file.lower() else 'efficientnet',
            'status':       ml_model.status,
        })
    except MLModel.DoesNotExist:
        return Response({'error': 'No model currently deployed'}, status=404)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def delete_model(request, model_id):
    try:
        ml_model = MLModel.objects.get(id=model_id)
    except MLModel.DoesNotExist:
        return Response({'error': 'Model not found'}, status=404)
    
    if ml_model.status == 'deployed':
        return Response(
            {'error': 'Cannot delete a deployed model. Deploy another model first.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    name = ml_model.name
    ml_model.delete()
    return Response({'message': f'{name} deleted successfully.'})
