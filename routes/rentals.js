// routes/rentals.js — оренда та повернення

const express = require('express');
const router = express.Router();
const rentalsController = require('../controllers/rentalsController');

/**
 * @swagger
 * /api/rentals:
 *   get:
 *     summary: Список усіх орендованих книг
 *     tags: [Rentals]
 *     responses:
 *       200:
 *         description: Активні оренди
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 rentals:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bookId:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       author:
 *                         type: string
 *                       rentedBy:
 *                         type: string
 *                       rentedAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/', rentalsController.listRentals);

/**
 * @swagger
 * /api/rentals/rent:
 *   post:
 *     summary: Орендувати книгу
 *     tags: [Rentals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RentInput'
 *     responses:
 *       200:
 *         description: Книгу успішно орендовано
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
 *         description: Відсутні обов'язкові поля
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Книгу не знайдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Книга вже орендована
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/rent', rentalsController.rentBook);

/**
 * @swagger
 * /api/rentals/return:
 *   post:
 *     summary: Повернути книгу
 *     tags: [Rentals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReturnInput'
 *     responses:
 *       200:
 *         description: Книгу успішно повернено
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
 *         description: Відсутній bookId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Книгу не знайдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Книга не є орендованою
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/return', rentalsController.returnBook);

module.exports = router;
