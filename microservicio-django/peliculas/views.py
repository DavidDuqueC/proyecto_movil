from rest_framework import viewsets
from .models import Pelicula
from .serializers import PeliculaSerializer

class PeliculaViewSet(viewsets.ModelViewSet):
    queryset = Pelicula.objects.all().order_by('-anio')
    serializer_class = PeliculaSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar por imdb_id si se proporciona
        imdb_id = self.request.query_params.get('imdb_id', None)
        if imdb_id:
            queryset = queryset.filter(imdb_id=imdb_id)
        
        # Filtrar por título si se proporciona
        titulo = self.request.query_params.get('titulo', None)
        if titulo:
            queryset = queryset.filter(titulo__icontains=titulo)
        
        return queryset