// tests/controllers/statsController.test.js

const statsController = require('../../controllers/statsController');
const Book = require('../../models/Book');

describe('statsController', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    Book.__resetMocks();
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('getOverview', () => {
    it('формує коректні підсумки для мок-даних', async () => {
      await statsController.getOverview(req, res, next);
      const payload = res.json.mock.calls[0][0];
      expect(payload.totalBooks).toBe(payload.availableBooks + payload.rentedBooks);
      expect(payload.occupancyRate).toMatch(/%$/);
      expect(next).not.toHaveBeenCalled();
    });

    it('передає помилку в next при getOverview', async () => {
      const err = new Error('overview fail');
      Book.findAll.mockRejectedValueOnce(err);
      await statsController.getOverview(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('getGenresStats', () => {
    it('повертає агреговану статистику за жанрами', async () => {
      const aggregated = [{ genre: 'Поезія', total: 2, available: 1, rented: 1 }];
      Book.findAll.mockResolvedValueOnce(aggregated);
      await statsController.getGenresStats(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ byGenre: aggregated });
      expect(next).not.toHaveBeenCalled();
    });

    it('передає помилку в next при getGenresStats', async () => {
      const err = new Error('genres fail');
      Book.findAll.mockRejectedValueOnce(err);
      await statsController.getGenresStats(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('getTopBooks', () => {
    it('обмежує limit до 20', async () => {
      req.query.limit = '999';
      await statsController.getTopBooks(req, res, next);
      expect(Book.findAll).toHaveBeenCalledWith(expect.objectContaining({ limit: 20 }));
    });

    it('передає помилку в next при getTopBooks', async () => {
      const err = new Error('top fail');
      Book.findAll.mockRejectedValueOnce(err);
      await statsController.getTopBooks(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
