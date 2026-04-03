from django.db import models

from django.contrib.postgres.fields import ArrayField

class Pelicula(models.Model):
    titulo = models.CharField(max_length=200)
    anio = models.IntegerField()
    director = models.CharField(max_length=100)
    sinopsis = models.TextField()
    generos = ArrayField(models.CharField(max_length=50), blank=True, default=list)
    poster_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.titulo} ({self.anio})"