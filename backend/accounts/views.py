from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import (
    CustomTokenObtainPairSerializer, RegisterSerializer,
    UserSerializer, CreateUserSerializer, UpdateUserSerializer
)
from .models import User


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Account created successfully. You can now log in."},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.is_admin


class UserListCreateView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        search = request.query_params.get('search', '')
        users = User.objects.all().order_by('-date_joined')
        if search:
            users = users.filter(email__icontains=search)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    permission_classes = [IsAdmin]

    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    def get(self, request, user_id):
        user = self.get_user(user_id)
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserSerializer(user).data)

    def put(self, request, user_id):
        user = self.get_user(user_id)
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        if user == request.user and not request.data.get('is_admin', True):
            return Response(
                {'error': 'You cannot remove your own admin status.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = UpdateUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
        user = self.get_user(user_id)
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        if user == request.user:
            return Response(
                {'error': 'You cannot delete your own account.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.delete()
        return Response({'message': 'User deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


# ── Profile endpoints ────────────────────────────────────────────────────────

class ProfileView(APIView):
    """Get and update the logged-in user's own profile (name only)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'email':      user.email,
            'first_name': user.first_name,
            'last_name':  user.last_name,
        })

    def put(self, request):
        user = request.user
        first_name = request.data.get('first_name', user.first_name)
        last_name  = request.data.get('last_name',  user.last_name)
        user.first_name = first_name
        user.last_name  = last_name
        user.save()
        return Response({
            'message':    'Profile updated successfully.',
            'first_name': user.first_name,
            'last_name':  user.last_name,
        })


class ChangePasswordView(APIView):
    """Change the logged-in user's own password."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password', '')
        new_password     = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')

        if not user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if len(new_password) < 8:
            return Response(
                {'error': 'New password must be at least 8 characters.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if new_password != confirm_password:
            return Response(
                {'error': 'New passwords do not match.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully.'})