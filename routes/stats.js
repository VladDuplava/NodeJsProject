// routes/stats.js — статистика

const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Загальна статистика бібліотеки
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Статистика
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Statistics'
 */
router.get('/', statsController.getOverview);

/**
 * @swagger
 * /api/stats/genres:
 *   get:
 *     summary: Статистика по жанрах (SQL GROUP BY)
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Жанри
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 byGenre:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       genre:
 *                         type: string
 *                       total:
 *                         type: integer
 *                       available:
 *                         type: integer
 *                       rented:
 *                         type: integer
 */
router.get('/genres', statsController.getGenresStats);

/**
 * @swagger
 * /api/stats/top:
 *   get:
 *     summary: Топ книг за кількістю оренд
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Кількість книг у списку
 *     responses:
 *       200:
 *         description: Топ книг
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topBooks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       author:
 *                         type: string
 *                       genre:
 *                         type: string
 *                       rentCount:
 *                         type: integer
 */
router.get('/top', statsController.getTopBooks);

module.exports = router;
