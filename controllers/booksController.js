// controllers/booksController.js

const { Op } = require('sequelize');
const Book = require('../models/Book');

async function listBooks(req, res, next) {
  try {
    const { available, genre } = req.query;
    const where = {};

    if (available !== undefined) {
      where.available = available === 'true';
    }

    if (genre) {
      where.genre = { [Op.like]: genre };
    }

    const books = await Book.findAll({ where, order: [['createdAt', 'DESC']] });

    res.json({ total: books.length, books });
  } catch (err) {
    next(err);
  }
}

async function getBookById(req, res, next) {
  try {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
      return res.status(404).json({ error: 'Книгу не знайдено' });
    }

    res.json(book);
  } catch (err) {
    next(err);
  }
}

async function createBook(req, res, next) {
  try {
    const { title, author, year, genre } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'Поля "title" та "author" є обов\'язковими' });
    }

    const book = await Book.create({
      title,
      author,
      year: year || null,
      genre: genre || 'Невизначено',
    });

    res.status(201).json({ message: 'Книгу успішно додано', book });
  } catch (err) {
    next(err);
  }
}

async function deleteBook(req, res, next) {
  try {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
      return res.status(404).json({ error: 'Книгу не знайдено' });
    }

    if (!book.available) {
      return res.status(409).json({
        error: `Не можна видалити книгу — вона орендована "${book.rentedBy}"`,
      });
    }

    await book.destroy();

    res.json({ message: 'Книгу видалено', book });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listBooks,
  getBookById,
  createBook,
  deleteBook,
};
