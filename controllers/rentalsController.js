// controllers/rentalsController.js

const Book = require('../models/Book');

async function listRentals(req, res, next) {
  try {
    const rented = await Book.findAll({ where: { available: false } });

    res.json({
      total: rented.length,
      rentals: rented.map((b) => ({
        bookId:   b.id,
        title:    b.title,
        author:   b.author,
        rentedBy: b.rentedBy,
        rentedAt: b.rentedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function rentBook(req, res, next) {
  try {
    const { bookId, userName } = req.body;

    if (!bookId || !userName) {
      return res.status(400).json({ error: 'Необхідно вказати "bookId" та "userName"' });
    }

    const book = await Book.findByPk(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Книгу не знайдено' });
    }

    if (!book.available) {
      return res.status(409).json({
        error: `Книга вже орендована користувачем "${book.rentedBy}"`,
      });
    }

    await book.update({
      available: false,
      rentedBy:  userName,
      rentedAt:  new Date(),
      rentCount: book.rentCount + 1,
    });

    res.json({ message: `Книгу "${book.title}" успішно орендовано`, book });
  } catch (err) {
    next(err);
  }
}

async function returnBook(req, res, next) {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ error: 'Необхідно вказати "bookId"' });
    }

    const book = await Book.findByPk(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Книгу не знайдено' });
    }

    if (book.available) {
      return res.status(409).json({ error: 'Ця книга не є орендованою — її не можна повернути' });
    }

    const previousRenter = book.rentedBy;

    await book.update({ available: true, rentedBy: null, rentedAt: null });

    res.json({ message: `Книгу "${book.title}" повернено від "${previousRenter}"`, book });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listRentals,
  rentBook,
  returnBook,
};
