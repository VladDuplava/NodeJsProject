// tests/rentals.test.js — тести для /api/rentals

const request = require('supertest');
const createApp = require('./helpers/app');
const Book = require('../models/Book');

const app = createApp();

describe('GET /api/rentals', () => {
  beforeEach(() => Book.__resetMocks());

  it('повертає список орендованих книг зі статусом 200', async () => {
    const res = await request(app).get('/api/rentals');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.rentals)).toBe(true);
  });

  it('запитує тільки книги з available=false', async () => {
    await request(app).get('/api/rentals');
    expect(Book.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { available: false } }),
    );
  });

  it('кожна оренда містить потрібні поля', async () => {
    Book.findAll.mockResolvedValueOnce([{
      id: 2, title: '1984', author: 'Джордж Орвелл',
      rentedBy: 'Іван Франко', rentedAt: new Date('2026-04-20'), available: false,
    }]);
    const res = await request(app).get('/api/rentals');
    expect(res.body.total).toBe(1);
    const rental = res.body.rentals[0];
    expect(rental).toHaveProperty('bookId');
    expect(rental).toHaveProperty('title');
    expect(rental).toHaveProperty('author');
    expect(rental).toHaveProperty('rentedBy');
    expect(rental).toHaveProperty('rentedAt');
  });

  it('повертає порожній список якщо немає оренд', async () => {
    Book.findAll.mockResolvedValueOnce([]);
    const res = await request(app).get('/api/rentals');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.rentals).toEqual([]);
  });
});

describe('POST /api/rentals/rent', () => {
  beforeEach(() => Book.__resetMocks());

  it('успішно орендує доступну книгу', async () => {
    const res = await request(app)
      .post('/api/rentals/rent')
      .send({ bookId: 1, userName: 'Леся Українка' });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('успішно орендовано');
    expect(res.body).toHaveProperty('book');
  });

  it('викликає book.update з правильними полями', async () => {
    const mockBook = { id: 1, title: 'Кобзар', available: true, rentedBy: null, update: jest.fn().mockResolvedValue(true) };
    Book.findByPk.mockResolvedValueOnce(mockBook);
    await request(app).post('/api/rentals/rent').send({ bookId: 1, userName: 'Тестер' });
    expect(mockBook.update).toHaveBeenCalledWith(
      expect.objectContaining({ available: false, rentedBy: 'Тестер' }),
    );
  });

  it('повертає 400 якщо bookId відсутній', async () => {
    const res = await request(app).post('/api/rentals/rent').send({ userName: 'Тестер' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(Book.findByPk).not.toHaveBeenCalled();
  });

  it('повертає 400 якщо userName відсутній', async () => {
    const res = await request(app).post('/api/rentals/rent').send({ bookId: 1 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(Book.findByPk).not.toHaveBeenCalled();
  });

  it('повертає 400 якщо body порожнє', async () => {
    const res = await request(app).post('/api/rentals/rent').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('повертає 404 для неіснуючої книги', async () => {
    Book.findByPk.mockResolvedValueOnce(null);
    const res = await request(app).post('/api/rentals/rent').send({ bookId: 999, userName: 'Тестер' });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('повертає 409 якщо книга вже орендована', async () => {
    const res = await request(app).post('/api/rentals/rent').send({ bookId: 2, userName: 'Тестер' });
    expect(res.status).toBe(409);
    expect(res.body.error).toContain('вже орендована');
  });
});

describe('POST /api/rentals/return', () => {
  beforeEach(() => Book.__resetMocks());

  it('успішно повертає орендовану книгу', async () => {
    const res = await request(app).post('/api/rentals/return').send({ bookId: 2 });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('повернено');
    expect(res.body).toHaveProperty('book');
  });

  it('викликає book.update з available=true', async () => {
    const mockBook = { id: 2, title: '1984', available: false, rentedBy: 'Іван Франко', update: jest.fn().mockResolvedValue(true) };
    Book.findByPk.mockResolvedValueOnce(mockBook);
    await request(app).post('/api/rentals/return').send({ bookId: 2 });
    expect(mockBook.update).toHaveBeenCalledWith(
      expect.objectContaining({ available: true, rentedBy: null, rentedAt: null }),
    );
  });

  it('повертає 400 якщо bookId відсутній', async () => {
    const res = await request(app).post('/api/rentals/return').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(Book.findByPk).not.toHaveBeenCalled();
  });

  it('повертає 404 для неіснуючої книги', async () => {
    Book.findByPk.mockResolvedValueOnce(null);
    const res = await request(app).post('/api/rentals/return').send({ bookId: 999 });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('повертає 409 якщо книга не є орендованою', async () => {
    const res = await request(app).post('/api/rentals/return').send({ bookId: 1 });
    expect(res.status).toBe(409);
    expect(res.body.error).toContain('не є орендованою');
  });
});
