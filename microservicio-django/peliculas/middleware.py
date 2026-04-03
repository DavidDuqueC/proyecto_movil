from django.http import JsonResponse
from django.conf import settings

class APIKeyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/admin/') or request.path.startswith('/api-auth/'):
            return self.get_response(request)
        
        auth_header = request.headers.get('Authorization')
        if auth_header != settings.API_KEY:
            return JsonResponse({'error': 'Acceso no autorizado'}, status=403)
        
        return self.get_response(request)