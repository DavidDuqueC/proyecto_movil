import requests
from django.core.management.base import BaseCommand
from peliculas.models import Pelicula

OMDB_API_KEY = 'ed07482e'  # Tu clave de OMDB
OMDB_URL = 'https://www.omdbapi.com/'

class Command(BaseCommand):
    help = 'Actualiza los posters de las películas usando OMDB'

    def handle(self, *args, **options):
        peliculas = Pelicula.objects.all()
        for pelicula in peliculas:
            self.stdout.write(f"Procesando: {pelicula.titulo}")
            params = {
                't': pelicula.titulo,
                'apikey': OMDB_API_KEY
            }
            try:
                resp = requests.get(OMDB_URL, params=params, timeout=5)
                data = resp.json()
                if data.get('Response') == 'True' and data.get('Poster') and data['Poster'] != 'N/A':
                    pelicula.poster_url = data['Poster']
                    pelicula.save(update_fields=['poster_url'])
                    self.stdout.write(self.style.SUCCESS(f"  Poster actualizado: {pelicula.poster_url}"))
                else:
                    self.stdout.write(self.style.WARNING(f"  No se encontró poster para {pelicula.titulo}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  Error con {pelicula.titulo}: {e}"))