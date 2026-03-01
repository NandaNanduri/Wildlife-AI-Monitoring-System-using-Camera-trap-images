from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['is_admin'] = self.user.is_admin
        data['is_conservationist'] = self.user.is_conservationist
        return data