// tests/books.test.js — тести для /api/books

const request = require('supertest');
const createApp = require('./helpers/app');
const Book = require('../models/Book');

const app = createApp();

describe('GET /api/books', () => {
  beforeEach(() => Book.__resetMocks());

  it('повертає список усіх книг зі статусом 200', async () => {
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.books)).toBe(true);
    expect(res.body.total).toBe(res.body.books.length);
  });

  it('викликає Book.findAll один раз', async () => {
    await request(app).get('/api/books');
    expect(Book.findAll).toHaveBeenCalledTimes(1);
  });

  it('передає фільтр available=true у запит', async () => {
    await request(app).get('/api/books?available=true');
    expect(Book.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ available: true }) }),
    );
  });

  it('передає фільтр available=false у запит', async () => {
    await request(app).get('/api/books?available=false');
    expect(Book.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ available: false }) }),
    );
  });

  it('передає фільтр genre у запит', async () => {
    await request(app).get('/api/books?genre=Поезія');
    expect(Book.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ genre: expect.anything() }) }),
    );
  });

  it('повертає порожній список коли книг немає', async () => {
    Book.findAll.mockResolvedValueOnce([]);
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.books).toEqual([]);
  });
});

describe('GET /api/books/:id', () => {
  beforeEach(() => Book.__resetMocks());

  it('повертає книгу за існуючим ID', async () => {
    const res = await request(app).get('/api/books/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('title', 'Кобзар');
  });

  it('повертає 404 для неіснуючого ID', async () => {
    Book.findByPk.mockResolvedValueOnce(null);
    const res = await request(app).get('/api/books/999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/books', () => {
  beforeEach(() => Book.__resetMocks());

  it('створює нову книгу зі статусом 201', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ title: 'Нова книга', author: 'Автор', year: 2024, genre: 'Роман' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body.book).toHaveProperty('title', 'Нова книга');
  });

  it('Book.create викликається з правильними даними', async () => {
    await request(app).post('/api/books').send({ title: 'Тест', author: 'Тестер', genre: 'Поезія' });
    expect(Book.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Тест', author: 'Тестер' }),
    );
  });

  it('повертає 400 якщо відсутній title', async () => {
    const res = await request(app).post('/api/books').send({ author: 'Автор' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(Book.create).not.toHaveBeenCalled();
  });

  it('повертає 400 якщо відсутній author', async () => {
    const res = await request(app).post('/api/books').send({ title: 'Назва' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(Book.create).not.toHaveBeenCalled();
  });

  it('повертає 400 якщо body порожнє', async () => {
    const res = await request(app).post('/api/books').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('встановлює жанр "Невизначено" якщо genre не передано', async () => {
    await request(app).post('/api/books').send({ title: 'Книга', author: 'Автор' });
    expect(Book.create).toHaveBeenCalledWith(
      expect.objectContaining({ genre: 'Невизначено' }),
    );
  });
});

describe('DELETE /api/books/:id', () => {
  beforeEach(() => Book.__resetMocks());

  it('видаляє доступну книгу зі статусом 200', async () => {
    const res = await request(app).delete('/api/books/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('book');
  });

  it('повертає 404 для неіснуючого ID', async () => {
    Book.findByPk.mockResolvedValueOnce(null);
    const res = await request(app).delete('/api/books/999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('повертає 409 при спробі видалити орендовану книгу', async () => {
    const res = await request(app).delete('/api/books/2');
    expect(res.status).toBe(409);
    expect(res.body.error).toContain('орендована');
  });
});
