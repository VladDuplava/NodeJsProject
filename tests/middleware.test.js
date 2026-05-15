// tests/middleware.test.js — тести для middleware

const errorHandler = require('../middleware/errorHandler');
const logger = require('../middleware/logger');

// ─────────────────────────────────────────────────────────────
// errorHandler
// ─────────────────────────────────────────────────────────────
describe('errorHandler middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req  = {};
    res  = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => console.error.mockRestore());

  it('повертає 500 для звичайної помилки', () => {
    const err = new Error('щось пішло не так');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'щось пішло не так' });
  });

  it('використовує err.status якщо вказаний', () => {
    const err = Object.assign(new Error('не знайдено'), { status: 404 });

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('обробляє Sequelize ValidationError', () => {
    const err = {
      name: 'ValidationError',
      errors: {
        title: { message: 'Назва обов\'язкова' },
        author: { message: 'Автор обов\'язковий' },
      },
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Назва обов\'язкова') }),
    );
  });

  it('обробляє Sequelize CastError (невірний ID)', () => {
    const err = { name: 'CastError', message: 'невірний ID' };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Невірний формат ID' });
  });

  it('обробляє duplicate key error (code 11000)', () => {
    const err = { code: 11000, message: 'duplicate key' };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Запис з такими даними вже існує' });
  });

  it('логує помилку через console.error', () => {
    const err = new Error('тестова помилка');

    errorHandler(err, req, res, next);

    expect(console.error).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────
// logger
// ─────────────────────────────────────────────────────────────
describe('logger middleware', () => {
  it('викликає next()', () => {
    const req  = { method: 'GET', url: '/api/books' };
    const res  = {};
    const next = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => {});

    logger(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    console.log.mockRestore();
  });

  it('логує метод та URL', () => {
    const req  = { method: 'POST', url: '/api/rentals/rent' };
    const res  = {};
    const next = jest.fn();
    const spy  = jest.spyOn(console, 'log').mockImplementation(() => {});

    logger(req, res, next);

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('POST'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('/api/rentals/rent'));
    spy.mockRestore();
  });
});
