# David Duque Cardona  1055751648
1. Gateway (Laravel)
en el bash:
cd backend-laravel
cp .env.example .env   # editar credenciales y URLs de los microservicios
composer install
php artisan serve --port=8001
2. Microservicio Express (búsquedas guardadas)
en el bash:
cd microservicio-express
cp .env.example .env   # definir API_KEY, PORT, databaseURL de Firebase
npm install
node server.js
3. Microservicio Django (catálogo)
en bash:
cd microservicio-django
python3 -m venv venv ---> yo uso entorno virual en linux
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # definir DB_URI (PostgreSQL) y API_KEY
python manage.py migrate
python manage.py runserver 8000
4. Microservicio Flask (recomendaciones)
cd microservicio-flask-recomendaciones
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # definir DB_URI (MySQL), API_KEY, DJANGO_MOVIE_SERVICE_URL
flask db upgrade
python app.py
5. Microservicio Flask (favoritos y listas)
cd microservicio-flask-favoritos
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # definir DB_URI (MySQL), API_KEY
flask db upgrade
python app.py