from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from api.models import Member, Message, Token


class MemberSerializer(serializers.ModelSerializer):
    """Serializer for Member model - excludes password from output"""
    
    class Meta:
        model = Member
        fields = ['id', 'username', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for member registration"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=6,
        max_length=128,
        style={'input_type': 'password'}
    )
    username = serializers.CharField(
        required=True,
        min_length=3,
        max_length=150
    )
    
    class Meta:
        model = Member
        fields = ['username', 'password']
    
    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


class LoginSerializer(serializers.Serializer):
    """Serializer for member login"""
    username = serializers.CharField(
        required=True,
        max_length=150
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )


class MessageMemberSerializer(serializers.ModelSerializer):
    """Nested serializer for member details in messages"""
    
    class Meta:
        model = Member
        fields = ['id', 'username']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model with member details"""
    member = MessageMemberSerializer(read_only=True)
    content = serializers.CharField(source='text', max_length=5000)
    
    class Meta:
        model = Message
        fields = ['id', 'member', 'content', 'created_at']
        read_only_fields = ['id', 'member', 'created_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages - only text field"""
    content = serializers.CharField(source='text', max_length=5000, required=True)
    
    class Meta:
        model = Message
        fields = ['content']
