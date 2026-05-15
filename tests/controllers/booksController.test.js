// tests/controllers/booksController.test.js — юніт-тести контролера книг

const booksController = require('../../controllers/booksController');
const Book = require('../../models/Book');

describe('booksController', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    Book.__resetMocks();
    req = { query: {}, params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('listBooks', () => {
    it('повертає total та books', async () => {
      await booksController.listBooks(req, res, next);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ total: expect.any(Number), books: expect.any(Array) }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('передає помилку в next при збої', async () => {
      const err = new Error('db');
      Book.findAll.mockRejectedValueOnce(err);
      await booksController.listBooks(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('getBookById', () => {
    it('повертає книгу якщо вона існує', async () => {
      req.params.id = '1';
      await booksController.getBookById(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
      expect(next).not.toHaveBeenCalled();
    });

    it('повертає 404 якщо книги немає', async () => {
      Book.findByPk.mockResolvedValueOnce(null);
      req.params.id = '404';
      await booksController.getBookById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Книгу не знайдено' });
    });

    it('передає помилку в next при getBookById', async () => {
      const err = new Error('findByPk failed');
      Book.findByPk.mockRejectedValueOnce(err);
      req.params.id = '1';
      await booksController.getBookById(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('createBook', () => {
    it('створює книгу зі статусом 201', async () => {
      req.body = { title: 'Нова', author: 'Автор' };
      await booksController.createBook(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Книгу успішно додано',
          book: expect.any(Object),
        }),
      );
    });

    it('повертає 400 без title', async () => {
      req.body = { author: 'A' };
      await booksController.createBook(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(Book.create).not.toHaveBeenCalled();
    });

    it('передає помилку в next при createBook', async () => {
      const err = new Error('create failed');
      Book.create.mockRejectedValueOnce(err);
      req.body = { title: 'X', author: 'Y' };
      await booksController.createBook(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('deleteBook', () => {
    it('видаляє доступну книгу', async () => {
      req.params.id = '1';
      await booksController.deleteBook(req, res, next);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Книгу видалено' }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('повертає 404 якщо книги не існує', async () => {
      Book.findByPk.mockResolvedValueOnce(null);
      req.params.id = '404';
      await booksController.deleteBook(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Книгу не знайдено' });
    });

    it('повертає 409 для орендованої книги', async () => {
      req.params.id = '2';
      await booksController.deleteBook(req, res, next);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json.mock.calls[0][0].error).toContain('орендована');
    });

    it('передає помилку в next при deleteBook', async () => {
      const err = new Error('destroy failed');
      Book.findByPk.mockRejectedValueOnce(err);
      req.params.id = '1';
      await booksController.deleteBook(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
