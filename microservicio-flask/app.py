import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import requests
from datetime import datetime
from collections import Counter
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DB_URI', 'mysql+pymysql://root:@localhost/recomendaciones_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['API_KEY'] = os.getenv('API_KEY', 'miclave123')
app.config['DJANGO_MOVIE_SERVICE_URL'] = os.getenv('DJANGO_MOVIE_SERVICE_URL', 'http://127.0.0.1:8000/api/peliculas/')

db = SQLAlchemy(app)
migrate = Migrate(app, db)

class Interaction(db.Model):
    __tablename__ = 'interactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    movie_id = db.Column(db.Integer, nullable=False)
    interaction_type = db.Column(db.String(20), nullable=False)  # 'favorite', 'search', 'view'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

@app.before_request
def check_api_key():
    if request.endpoint == 'health' or request.endpoint == 'debug_config':
        return
    auth = request.headers.get('Authorization')
    if not auth or auth != app.config['API_KEY']:
        return jsonify({'error': 'Acceso no autorizado'}), 403

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/debug/config', methods=['GET'])
def debug_config():
    return jsonify({
        'api_key_configured': bool(app.config['API_KEY']),
        'django_url': app.config['DJANGO_MOVIE_SERVICE_URL'],
        'db_uri_prefix': app.config['SQLALCHEMY_DATABASE_URI'].split('@')[0] + '@...'
    })

@app.route('/interactions', methods=['POST'])
def add_interaction():
    data = request.get_json()
    user_id = data.get('user_id')
    movie_id = data.get('movie_id')
    interaction_type = data.get('type')
    
    if not all([user_id, movie_id, interaction_type]):
        return jsonify({'error': 'Faltan campos: user_id, movie_id, type'}), 400
    if interaction_type not in ['favorite', 'search', 'view']:
        return jsonify({'error': 'Tipo inválido'}), 400
    
    interaction = Interaction(
        user_id=user_id,
        movie_id=movie_id,
        interaction_type=interaction_type
    )
    db.session.add(interaction)
    db.session.commit()
    return jsonify({'message': 'Interaccion guardada'}), 201

@app.route('/recommendations/<int:user_id>', methods=['GET'])
def get_recommendations(user_id):
    favs = Interaction.query.filter_by(user_id=user_id, interaction_type='favorite').all()
    fav_movie_ids = [f.movie_id for f in favs]
    
    if not fav_movie_ids:
        return jsonify([])  
    
    headers = {'Authorization': app.config['API_KEY']}
    generos_favoritos = []
    for movie_id in fav_movie_ids:
        try:
            resp = requests.get(f"{app.config['DJANGO_MOVIE_SERVICE_URL']}{movie_id}/", headers=headers, timeout=2)
            if resp.status_code == 200:
                movie = resp.json()
                generos = movie.get('generos', [])
                generos_favoritos.extend(generos)
        except:
            continue
    
    contador = Counter(generos_favoritos)
    top_generos = [g for g, _ in contador.most_common(3)]
    
    if not top_generos:
        return jsonify([])
    
    todas = requests.get(app.config['DJANGO_MOVIE_SERVICE_URL'], headers=headers).json()
    recomendadas = []
    for pelicula in todas:
        if pelicula['id'] in fav_movie_ids:
            continue
        if any(g in pelicula.get('generos', []) for g in top_generos):
            recomendadas.append(pelicula['id'])
    
    return jsonify(recomendadas[:10])

if __name__ == '__main__':
    port = int(os.getenv('PORT'))
    app.run(port=port, debug=True)