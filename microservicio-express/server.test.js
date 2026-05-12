const request = require('supertest');
const express = require('express');
const db = require('./firebase');

jest.mock('./firebase', () => ({
    ref: jest.fn().mockReturnThis(),
    push: jest.fn().mockReturnThis(),
    set: jest.fn().mockResolvedValue(),
    once: jest.fn().mockResolvedValue({
        val: () => ({
            "id1": { userId: 123, name: "test", filters: {} },
            "id2": { userId: 123, name: "otra busqueda", filters: { genre: "Misterio" } }
        })
    }),
    remove: jest.fn().mockResolvedValue()
}));

const app = express();
app.use(express.json());

const API_KEY = 'miclave123';
app.use((req, res, next) => {
    const auth = req.headers.authorization;
    if (auth !== API_KEY) {
        return res.status(403).json({ error: 'Acceso no autorizado' });
    }
    next();
});

app.post('/saved-searches', (req, res) => {
    const { userId, name } = req.body;
    if (!userId || !name) {
        return res.status(400).json({ error: 'userId y name son requeridos' });
    }
    res.json({ msg: 'Búsqueda guardada', id: 'fake-id' });
});

app.get('/saved-searches/:userId', (req, res) => {
    const userId = req.params.userId;
    const searches = [
        { id: '1', userId: 123, name: 'test' },
        { id: '2', userId: 123, name: 'otra busqueda' }
    ];
    res.json(searches);
});

app.delete('/saved-searches/:id', (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'id requerido' });
    }
    res.json({ msg: 'Búsqueda eliminada' });
});

app.get('/saved-searches/details/:id', (req, res) => {
    const { id } = req.params;
    if (id === '1') {
        return res.json({ id: '1', userId: 123, name: 'test', filters: {} });
    }
    res.status(404).json({ error: 'No encontrada' });
});

describe('Pruebas de Express', () => {
    test('POST /saved-searches requiere userId y name', async () => {
        const res = await request(app)
            .post('/saved-searches')
            .set('Authorization', 'miclave123')
            .send({ name: 'test' });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('userId y name son requeridos');
    });

    test('POST /saved-searches funciona con datos válidos', async () => {
        const res = await request(app)
            .post('/saved-searches')
            .set('Authorization', 'miclave123')
            .send({ userId: 123, name: 'Mi búsqueda' });
        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toBe('Búsqueda guardada');
        expect(res.body.id).toBe('fake-id');
    });

    test('POST /saved-searches falla sin autorización', async () => {
        const res = await request(app)
            .post('/saved-searches')
            .send({ userId: 123, name: 'Mi búsqueda' });
        expect(res.statusCode).toBe(403);
        expect(res.body.error).toBe('Acceso no autorizado');
    });

    test('GET /saved-searches/:userId retorna un array de búsquedas', async () => {
        const res = await request(app)
            .get('/saved-searches/123')
            .set('Authorization', 'miclave123');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
    });

    test('GET /saved-searches/details/:id retorna búsqueda si existe', async () => {
        const res = await request(app)
            .get('/saved-searches/details/1')
            .set('Authorization', 'miclave123');
        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe('1');
        expect(res.body.name).toBe('test');
    });

    test('GET /saved-searches/details/:id retorna 404 si no existe', async () => {
        const res = await request(app)
            .get('/saved-searches/details/999')
            .set('Authorization', 'miclave123');
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('No encontrada');
    });

    test('DELETE /saved-searches/:id elimina una búsqueda', async () => {
        const res = await request(app)
            .delete('/saved-searches/1')
            .set('Authorization', 'miclave123');
        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toBe('Búsqueda eliminada');
    });

    test('DELETE /saved-searches/:id falla sin autorización', async () => {
        const res = await request(app)
            .delete('/saved-searches/1');
        expect(res.statusCode).toBe(403);
        expect(res.body.error).toBe('Acceso no autorizado');
    });
});