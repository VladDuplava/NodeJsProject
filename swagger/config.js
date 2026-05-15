// swagger/config.js — OpenAPI 3.0 специфікація

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '📚 Library Rental API',
      version: '2.1.0',
      description:
        'REST API для бібліотечної системи оренди книг.\n\n' +
        'База даних: **MySQL** через Sequelize ORM.',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Локальний сервер' }],
    tags: [
      { name: 'Books',      description: 'Керування каталогом книг' },
      { name: 'Rentals',    description: 'Оренда та повернення книг' },
      { name: 'Statistics', description: 'Статистика бібліотеки'    },
    ],
    components: {
      schemas: {
        Book: {
          type: 'object',
          properties: {
            id:        { type: 'integer',  example: 1 },
            title:     { type: 'string',   example: 'Кобзар' },
            author:    { type: 'string',   example: 'Тарас Шевченко' },
            year:      { type: 'integer',  example: 1840, nullable: true },
            genre:     { type: 'string',   example: 'Поезія' },
            available: { type: 'boolean',  example: true },
            rentedBy:  { type: 'string',   nullable: true, example: null },
            rentedAt:  { type: 'string',   format: 'date-time', nullable: true },
            rentCount: { type: 'integer',  example: 5 },
            createdAt: { type: 'string',   format: 'date-time' },
            updatedAt: { type: 'string',   format: 'date-time' },
          },
        },
        BookInput: {
          type: 'object',
          required: ['title', 'author'],
          properties: {
            title:  { type: 'string',  example: 'Кобзар' },
            author: { type: 'string',  example: 'Тарас Шевченко' },
            year:   { type: 'integer', example: 1840 },
            genre:  { type: 'string',  example: 'Поезія' },
          },
        },
        RentInput: {
          type: 'object',
          required: ['bookId', 'userName'],
          properties: {
            bookId:   { type: 'integer', example: 1 },
            userName: { type: 'string',  example: 'Іван Франко' },
          },
        },
        ReturnInput: {
          type: 'object',
          required: ['bookId'],
          properties: {
            bookId: { type: 'integer', example: 1 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Книгу не знайдено' },
          },
        },
        Statistics: {
          type: 'object',
          properties: {
            totalBooks:     { type: 'integer', example: 10 },
            availableBooks: { type: 'integer', example: 7  },
            rentedBooks:    { type: 'integer', example: 3  },
            occupancyRate:  { type: 'string',  example: '30.00%' },
            byGenre: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  genre:     { type: 'string'  },
                  total:     { type: 'integer' },
                  available: { type: 'integer' },
                  rented:    { type: 'integer' },
                },
              },
            },
            topRentedBooks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id:        { type: 'integer' },
                  title:     { type: 'string'  },
                  author:    { type: 'string'  },
                  rentCount: { type: 'integer' },
                },
              },
            },
            activeRentals: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  bookId:     { type: 'integer' },
                  title:      { type: 'string'  },
                  rentedBy:   { type: 'string'  },
                  rentedAt:   { type: 'string', format: 'date-time' },
                  daysRented: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
