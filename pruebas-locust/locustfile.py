from locust import HttpUser, task, between
import json
import random

class UsuarioUMBRACINEMA(HttpUser):
    wait_time = between(1, 3)  

    # IDs de recursos que se crearán dinámicamente
    saved_search_id = None
    list_id = None
    movie_id = 1  # ID de una película que existe en tu catálogo (ajústalo)

    def on_start(self):
        """Login y creación de datos de prueba al iniciar cada usuario simulado"""
        # 1. Login
        resp = self.client.post("/api/login", json={
            "email": "david@gmail.com",   
            "password": "password"
        })
        if resp.status_code == 200:
            self.token = resp.json()["token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
            print("Login exitoso")
        else:
            self.token = None
            print("Error en login")
            return

        # 2. Crear una búsqueda guardada para tener un ID que usar en GET/DELETE
        data_search = {
            "name": "Busqueda Locust",
            "searchType": "text",
            "filters": {"title": "blue"},
            "movieRefs": []
        }
        resp = self.client.post("/api/saved-searches", json=data_search, headers=self.headers)
        if resp.status_code == 201 or resp.status_code == 200:
            self.saved_search_id = resp.json().get("id")
            print(f"Búsqueda guardada creada con ID: {self.saved_search_id}")

        # 3. Crear una lista personalizada para usar en pruebas
        data_list = {"name": "Lista Locust", "description": "Prueba rendimiento"}
        resp = self.client.post("/api/lists", json=data_list, headers=self.headers)
        if resp.status_code == 201 or resp.status_code == 200:
            self.list_id = resp.json().get("id")
            print(f"Lista creada con ID: {self.list_id}")

    # ------------------------------------------------------------
    # Tareas con diferentes pesos (los números indican frecuencia)
    # ------------------------------------------------------------

    @task(5)
    def listar_peliculas(self):
        """GET /api/peliculas - Muy frecuente"""
        if self.token:
            self.client.get("/api/peliculas", headers=self.headers)

    @task(4)
    def obtener_pelicula(self):
        """GET /api/peliculas/{id} - Frecuente"""
        if self.token:
            self.client.get(f"/api/peliculas/{self.movie_id}", headers=self.headers)

    @task(3)
    def listar_favoritos(self):
        """GET /api/favorites - Frecuente"""
        if self.token:
            self.client.get("/api/favorites", headers=self.headers)

    @task(2)
    def agregar_favorito(self):
        """POST /api/favorites - Moderado"""
        if self.token:
            data = {"movie_id": self.movie_id}
            self.client.post("/api/favorites", json=data, headers=self.headers)

    @task(2)
    def eliminar_favorito(self):
        """DELETE /api/favorites/{movieId} - Moderado (requiere que exista)"""
        if self.token:
            # Usamos el mismo movie_id para que sea probable que exista
            self.client.delete(f"/api/favorites/{self.movie_id}", headers=self.headers)

    @task(3)
    def listar_busquedas_guardadas(self):
        """GET /api/saved-searches - Frecuente"""
        if self.token:
            self.client.get("/api/saved-searches", headers=self.headers)

    @task(2)
    def obtener_busqueda_por_id(self):
        """GET /api/saved-searches/{id} - Moderado (usa el ID creado)"""
        if self.token and self.saved_search_id:
            self.client.get(f"/api/saved-searches/{self.saved_search_id}", headers=self.headers)

    @task(1)
    def crear_busqueda(self):
        """POST /api/saved-searches - Baja frecuencia (crea nueva)"""
        if self.token:
            data = {
                "name": f"Busqueda_{random.randint(1,10000)}",
                "searchType": "genre",
                "filters": {"genre": "Drama", "year": 2020},
                "movieRefs": []
            }
            self.client.post("/api/saved-searches", json=data, headers=self.headers)

    @task(1)
    def eliminar_busqueda(self):
        """DELETE /api/saved-searches/{id} - Baja frecuencia (elimina la creada al inicio)"""
        if self.token and self.saved_search_id:
            self.client.delete(f"/api/saved-searches/{self.saved_search_id}", headers=self.headers)
            # Después de eliminar, no volvemos a usar ese ID (pero puede dar 404 si se repite)
            self.saved_search_id = None

    @task(3)
    def obtener_recomendaciones(self):
        """GET /api/recommendations - Frecuente"""
        if self.token:
            self.client.get("/api/recommendations", headers=self.headers)

    @task(1)
    def registrar_interaccion(self):
        """POST /api/interactions - Baja frecuencia (para recomendaciones)"""
        if self.token:
            data = {
                "movie_id": self.movie_id,
                "type": "view"  # o "favorite" (pero ya hay favorito aparte)
            }
            self.client.post("/api/interactions", json=data, headers=self.headers)

    @task(2)
    def listar_listas(self):
        """GET /api/lists - Moderado"""
        if self.token:
            self.client.get("/api/lists", headers=self.headers)

    @task(1)
    def crear_lista(self):
        """POST /api/lists - Baja frecuencia (crea nueva lista)"""
        if self.token:
            data = {
                "name": f"Lista_{random.randint(1,10000)}",
                "description": "Creada durante prueba"
            }
            self.client.post("/api/lists", json=data, headers=self.headers)

    @task(2)
    def agregar_pelicula_a_lista(self):
        """POST /api/lists/{listId}/movies - Moderado (usa la lista creada)"""
        if self.token and self.list_id:
            data = {"movie_id": self.movie_id}
            self.client.post(f"/api/lists/{self.list_id}/movies", json=data, headers=self.headers)

    @task(2)
    def obtener_peliculas_de_lista(self):
        """GET /api/lists/{listId}/movies - Moderado"""
        if self.token and self.list_id:
            self.client.get(f"/api/lists/{self.list_id}/movies", headers=self.headers)

    @task(1)
    def eliminar_pelicula_de_lista(self):
        """DELETE /api/lists/{listId}/movies/{movieId} - Baja frecuencia"""
        if self.token and self.list_id:
            self.client.delete(f"/api/lists/{self.list_id}/movies/{self.movie_id}", headers=self.headers)

    @task(1)
    def eliminar_lista(self):
        """DELETE /api/lists/{listId} - Baja frecuencia (elimina la lista creada)"""
        if self.token and self.list_id:
            self.client.delete(f"/api/lists/{self.list_id}", headers=self.headers)
            self.list_id = None

    # ------------------------------------------------------------
    # Operaciones administrativas (con menor peso o comentadas)
    # ------------------------------------------------------------
    @task(0)  # peso 0 = no se ejecuta a menos que lo actives
    def crear_pelicula(self):
        """POST /api/peliculas - Solo admin, no se usa en pruebas normales"""
        if self.token:
            data = {
                "titulo": "Pelicula Test",
                "anio": 2025,
                "director": "Locust",
                "sinopsis": "Creada durante prueba de rendimiento",
                "generos": ["Acción"]
            }
            self.client.post("/api/peliculas", json=data, headers=self.headers)

    @task(0)
    def actualizar_pelicula(self):
        """PUT /api/peliculas/{id} - Solo admin"""
        if self.token:
            data = {"titulo": "Actualizada"}
            self.client.put(f"/api/peliculas/{self.movie_id}", json=data, headers=self.headers)

    @task(0)
    def eliminar_pelicula(self):
        """DELETE /api/peliculas/{id} - Solo admin"""
        if self.token:
            self.client.delete(f"/api/peliculas/{self.movie_id}", headers=self.headers)