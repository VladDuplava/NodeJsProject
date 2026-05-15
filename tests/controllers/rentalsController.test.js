// tests/controllers/rentalsController.test.js

const rentalsController = require('../../controllers/rentalsController');
const Book = require('../../models/Book');

describe('rentalsController', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    Book.__resetMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('rentBook', () => {
    it('400 без bookId', async () => {
      req.body = { userName: 'U' };
      await rentalsController.rentBook(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(Book.findByPk).not.toHaveBeenCalled();
    });

    it('next(err) при помилці БД', async () => {
      const err = new Error('fail');
      Book.findByPk.mockRejectedValueOnce(err);
      req.body = { bookId: 1, userName: 'U' };
      await rentalsController.rentBook(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('listRentals', () => {
    it('повертає список оренд', async () => {
      await rentalsController.listRentals(req, res, next);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          total: expect.any(Number),
          rentals: expect.any(Array),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('передає помилку в next при listRentals', async () => {
      const err = new Error('list fail');
      Book.findAll.mockRejectedValueOnce(err);
      await rentalsController.listRentals(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('returnBook', () => {
    it('409 якщо книга вже доступна', async () => {
      req.body = { bookId: 1 };
      await rentalsController.returnBook(req, res, next);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('передає помилку в next при returnBook', async () => {
      const err = new Error('return fail');
      Book.findByPk.mockRejectedValueOnce(err);
      req.body = { bookId: 2 };
      await rentalsController.returnBook(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
