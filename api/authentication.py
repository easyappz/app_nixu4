from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from api.models import Token


class TokenAuthentication(BaseAuthentication):
    """
    Custom token-based authentication.
    Clients should authenticate by passing the token in the Authorization header.
    """
    keyword = 'Bearer'

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            return None
        
        parts = auth_header.split()
        
        if len(parts) == 0:
            return None
        
        if parts[0].lower() != self.keyword.lower():
            return None
        
        if len(parts) == 1:
            raise AuthenticationFailed('Invalid token header. No credentials provided.')
        elif len(parts) > 2:
            raise AuthenticationFailed('Invalid token header. Token string should not contain spaces.')
        
        try:
            token = parts[1]
        except UnicodeError:
            raise AuthenticationFailed('Invalid token header. Token string should not contain invalid characters.')
        
        return self.authenticate_credentials(token)
    
    def authenticate_credentials(self, key):
        try:
            token = Token.objects.select_related('member').get(key=key)
        except Token.DoesNotExist:
            raise AuthenticationFailed('Invalid token.')
        
        return (token.member, token)
    
    def authenticate_header(self, request):
        return self.keyword
