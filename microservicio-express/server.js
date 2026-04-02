require('dotenv').config();
const express = require('express');
const db = require('./firebase');

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY;

function requireApiKey(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (authHeader !== API_KEY) {
        return res.status(403).json({ error: "Acceso no autorizado" });
    }
    next();
}

app.use(requireApiKey);


app.post('/saved-searches', function (req, res) {
    const { userId, name, searchType, filters, movieRefs } = req.body;
    if (!userId || !name) {
        return res.status(400).json({ error: 'userId y name son requeridos' });
    }
    const ref = db.ref('saved_searches').push();
    ref.set({
        userId: userId,
        name: name,
        searchType: searchType || 'text',
        filters: filters || {},
        movieRefs: movieRefs || [],
        createdAt: Date.now()
    }).then(function () {
        res.json({ msg: 'Búsqueda guardada', id: ref.key });
    }).catch(function (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al guardar' });
    });
});

app.get('/saved-searches/:userId', function (req, res) {
    const userId = req.params.userId;
    db.ref('saved_searches').once('value').then(function (snap) {
        const data = snap.val();
        if (!data) return res.json([]);
        const searches = [];
        for (let id in data) {
            if (data[id].userId == userId) {
                searches.push({ id: id, ...data[id] });
            }
        }
        res.json(searches);
    }).catch(function (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener búsquedas' });
    });
});

app.get('/saved-searches/details/:id', function (req, res) {
    const id = req.params.id;
    db.ref('saved_searches/' + id).once('value').then(function (snap) {
        const search = snap.val();
        if (!search) return res.status(404).json({ error: 'No encontrada' });
        res.json({ id: id, ...search });
    }).catch(function (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener la búsqueda' });
    });
});

app.delete('/saved-searches/:id', function (req, res) {
    const id = req.params.id;
    db.ref('saved_searches/' + id).remove().then(function () {
        res.json({ msg: 'Búsqueda eliminada' });
    }).catch(function (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar' });
    });
});

const PORT = process.env.PORT;
app.listen(PORT, function () {
    console.log('Microservicio corriendo en puerto ' + PORT);
});