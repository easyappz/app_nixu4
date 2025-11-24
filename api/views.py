from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import check_password
from api.models import Member, Message, Token
from api.serializers import (
    RegisterSerializer,
    LoginSerializer,
    MemberSerializer,
    MessageSerializer,
    MessageCreateSerializer
)
from api.authentication import TokenAuthentication


class RegisterView(APIView):
    """
    Register a new member and return authentication token.
    """
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            # Check if username already exists
            if Member.objects.filter(username=serializer.validated_data['username']).exists():
                return Response(
                    {'error': 'Username already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create member
            member = serializer.save()
            
            # Create token
            token = Token.objects.create(member=member)
            
            return Response(
                {
                    'token': token.key,
                    'member': {
                        'id': member.id,
                        'username': member.username
                    }
                },
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Authenticate member and return token.
    """
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            try:
                member = Member.objects.get(username=username)
            except Member.DoesNotExist:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if not member.check_password(password):
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get or create token
            token, created = Token.objects.get_or_create(member=member)
            
            return Response(
                {
                    'token': token.key,
                    'member': {
                        'id': member.id,
                        'username': member.username
                    }
                },
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    """
    Get or update current member profile.
    Requires authentication.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = MemberSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        member = request.user
        username = request.data.get('username')
        password = request.data.get('password')
        
        # Check if username is being changed and if it already exists
        if username and username != member.username:
            if Member.objects.filter(username=username).exists():
                return Response(
                    {'error': 'Username already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            member.username = username
        
        # Update password if provided
        if password:
            if len(password) < 6:
                return Response(
                    {'error': 'Password must be at least 6 characters'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            member.set_password(password)
        
        member.save()
        
        serializer = MemberSerializer(member)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MessageView(APIView):
    """
    Unified view for message operations.
    GET: Retrieve message history with pagination.
    POST: Create a new message.
    Requires authentication.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get all messages ordered by created_at.
        """
        limit = request.query_params.get('limit', 50)
        offset = request.query_params.get('offset', 0)
        
        try:
            limit = int(limit)
            offset = int(offset)
        except ValueError:
            return Response(
                {'error': 'Invalid limit or offset value'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if limit < 1 or limit > 100:
            limit = 50
        if offset < 0:
            offset = 0
        
        messages = Message.objects.select_related('member').all()[offset:offset + limit]
        total_count = Message.objects.count()
        
        serializer = MessageSerializer(messages, many=True)
        
        return Response(
            {
                'count': total_count,
                'results': serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    def post(self, request):
        """
        Create a new message.
        """
        serializer = MessageCreateSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.save(member=request.user)
            
            response_serializer = MessageSerializer(message)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
