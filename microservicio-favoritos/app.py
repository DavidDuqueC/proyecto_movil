import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
from dotenv import load_dotenv
import requests

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DB_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['API_KEY'] = os.getenv('API_KEY')

db = SQLAlchemy(app)
migrate = Migrate(app, db)

class UserFavorite(db.Model):
    __tablename__ = 'user_favorites'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    movie_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('user_id', 'movie_id', name='unique_favorite'),)

class UserList(db.Model):
    __tablename__ = 'user_lists'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ListMovie(db.Model):
    __tablename__ = 'list_movies'
    id = db.Column(db.Integer, primary_key=True)
    list_id = db.Column(db.Integer, db.ForeignKey('user_lists.id', ondelete='CASCADE'), nullable=False)
    movie_id = db.Column(db.Integer, nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('list_id', 'movie_id', name='unique_list_movie'),)


@app.before_request
def check_api_key():
    if request.endpoint == 'health':
        return
    auth = request.headers.get('Authorization')
    if not auth or auth != app.config['API_KEY']:
        return jsonify({'error': 'Acceso no autorizado'}), 403


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/favorites', methods=['POST'])
def add_favorite():
    data = request.get_json()
    user_id = data.get('user_id')
    movie_id = data.get('movie_id')
    if not user_id or not movie_id:
        return jsonify({'error': 'user_id y movie_id requeridos'}), 400
    existing = UserFavorite.query.filter_by(user_id=user_id, movie_id=movie_id).first()
    if existing:
        return jsonify({'message': 'Ya está en favoritos'}), 200
    fav = UserFavorite(user_id=user_id, movie_id=movie_id)
    db.session.add(fav)
    db.session.commit()
    return jsonify({'message': 'Favorito agregado'}), 201

@app.route('/favorites/<int:movie_id>', methods=['DELETE'])
def remove_favorite(movie_id):
    user_id = request.args.get('user_id') or (request.json.get('user_id') if request.json else None)
    if not user_id:
        return jsonify({'error': 'user_id requerido (query param o body)'}), 400
    fav = UserFavorite.query.filter_by(user_id=user_id, movie_id=movie_id).first()
    if not fav:
        return jsonify({'message': 'No existe en favoritos'}), 404
    db.session.delete(fav)
    db.session.commit()
    return jsonify({'message': 'Favorito eliminado'}), 200

@app.route('/favorites', methods=['GET'])
def get_favorites():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id requerido'}), 400
    
    favs = UserFavorite.query.filter_by(user_id=user_id).all()
    movie_ids = [f.movie_id for f in favs]
    
    if not movie_ids:
        return jsonify([])
    
    headers = {'Authorization': app.config['API_KEY']}
    detalles = []
    for mid in movie_ids:
        try:
            resp = requests.get(f"http://127.0.0.1:8000/api/peliculas/{mid}/", headers=headers, timeout=2)
            if resp.status_code == 200:
                detalles.append(resp.json())
        except Exception:
            continue
    return jsonify(detalles)

@app.route('/favorites/details', methods=['GET'])
def get_favorites_details():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id requerido'}), 400
    favs = UserFavorite.query.filter_by(user_id=user_id).all()
    movie_ids = [f.movie_id for f in favs]
    headers = {'Authorization': app.config['API_KEY']}
    detalles = []
    for mid in movie_ids:
        try:
            resp = requests.get(f"http://127.0.0.1:8000/api/peliculas/{mid}/", headers=headers, timeout=2)
            if resp.status_code == 200:
                detalles.append(resp.json())
        except:
            continue
    return jsonify(detalles)

@app.route('/lists', methods=['POST'])
def create_list():
    data = request.get_json()
    user_id = data.get('user_id')
    name = data.get('name')
    description = data.get('description', '')
    if not user_id or not name:
        return jsonify({'error': 'user_id y name requeridos'}), 400
    new_list = UserList(user_id=user_id, name=name, description=description)
    db.session.add(new_list)
    db.session.commit()
    return jsonify({'id': new_list.id, 'message': 'Lista creada'}), 201

@app.route('/lists', methods=['GET'])
def get_lists():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id requerido'}), 400
    lists = UserList.query.filter_by(user_id=user_id).all()
    result = [{'id': l.id, 'name': l.name, 'description': l.description, 'created_at': l.created_at} for l in lists]
    return jsonify(result)

@app.route('/lists/<int:list_id>/movies', methods=['POST'])
def add_movie_to_list(list_id):
    data = request.get_json()
    user_id = data.get('user_id')
    movie_id = data.get('movie_id')
    if not user_id or not movie_id:
        return jsonify({'error': 'user_id y movie_id requeridos'}), 400
    user_list = UserList.query.filter_by(id=list_id, user_id=user_id).first()
    if not user_list:
        return jsonify({'error': 'Lista no encontrada o no pertenece al usuario'}), 404
    existing = ListMovie.query.filter_by(list_id=list_id, movie_id=movie_id).first()
    if existing:
        return jsonify({'message': 'Pelicula ya en la lista'}), 200
    entry = ListMovie(list_id=list_id, movie_id=movie_id)
    db.session.add(entry)
    db.session.commit()
    return jsonify({'message': 'Pelicula agregada a la lista'}), 201

@app.route('/lists/<int:list_id>/movies/<int:movie_id>', methods=['DELETE'])
def remove_movie_from_list(list_id, movie_id):
    user_id = request.args.get('user_id') or (request.json.get('user_id') if request.json else None)
    if not user_id:
        return jsonify({'error': 'user_id requerido'}), 400
    user_list = UserList.query.filter_by(id=list_id, user_id=user_id).first()
    if not user_list:
        return jsonify({'error': 'Lista no encontrada'}), 404
    entry = ListMovie.query.filter_by(list_id=list_id, movie_id=movie_id).first()
    if not entry:
        return jsonify({'message': 'Pelicula no encontrada en la lista'}), 404
    db.session.delete(entry)
    db.session.commit()
    return jsonify({'message': 'Pelicula eliminada de la lista'}), 200

@app.route('/lists/<int:list_id>/movies', methods=['GET'])
def get_list_movies(list_id):
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id requerido'}), 400
    user_list = UserList.query.filter_by(id=list_id, user_id=user_id).first()
    if not user_list:
        return jsonify({'error': 'Lista no encontrada'}), 404
    movies = ListMovie.query.filter_by(list_id=list_id).all()
    movie_ids = [m.movie_id for m in movies]
    # Opcional: obtener detalles de Django
    headers = {'Authorization': app.config['API_KEY']}
    detalles = []
    for mid in movie_ids:
        try:
            resp = requests.get(f"http://127.0.0.1:8000/api/peliculas/{mid}/", headers=headers, timeout=2)
            if resp.status_code == 200:
                detalles.append(resp.json())
        except:
            continue
    return jsonify(detalles)

@app.route('/lists/<int:list_id>', methods=['DELETE'])
def delete_list(list_id):
    user_id = request.args.get('user_id') or (request.json.get('user_id') if request.json else None)
    if not user_id:
        return jsonify({'error': 'user_id requerido'}), 400
    user_list = UserList.query.filter_by(id=list_id, user_id=user_id).first()
    if not user_list:
        return jsonify({'error': 'Lista no encontrada'}), 404
    db.session.delete(user_list)
    db.session.commit()
    return jsonify({'message': 'Lista eliminada'}), 200


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(port=port, debug=True)