from django.urls import path
from .views import (
    CustomTokenObtainPairView, RegisterView,
    UserListCreateView, UserDetailView,
    ProfileView, ChangePasswordView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('token/',               CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/',       TokenRefreshView.as_view(),          name='token_refresh'),
    path('register/',            RegisterView.as_view(),               name='register'),
    path('users/',               UserListCreateView.as_view(),         name='user_list_create'),
    path('users/<int:user_id>/', UserDetailView.as_view(),             name='user_detail'),
    path('profile/',             ProfileView.as_view(),                name='profile'),
    path('change-password/',     ChangePasswordView.as_view(),         name='change_password'),
]