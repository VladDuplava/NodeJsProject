// routes/books.js — маршрути книг

const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Отримати список усіх книг
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Фільтр за доступністю (true / false)
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Фільтр за жанром
 *     responses:
 *       200:
 *         description: Список книг
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 */
router.get('/', booksController.listBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Отримати книгу за ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID книги
 *     responses:
 *       200:
 *         description: Книга знайдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Книгу не знайдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', booksController.getBookById);

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Додати нову книгу
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookInput'
 *     responses:
 *       201:
 *         description: Книгу успішно додано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 book:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Помилка валідації
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', booksController.createBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Видалити книгу
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID книги
 *     responses:
 *       200:
 *         description: Книгу видалено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 book:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Книгу не знайдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Не можна видалити орендовану книгу
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', booksController.deleteBook);

module.exports = router;
