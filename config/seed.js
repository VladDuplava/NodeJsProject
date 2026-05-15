// config/seed.js — початкове заповнення MySQL

require('dotenv').config();

const { connectDB } = require('./database');
const Book = require('../models/Book');

const initialBooks = [
  { title: 'Кобзар',                author: 'Тарас Шевченко',        year: 1840, genre: 'Поезія',     available: true,  rentCount: 0 },
  { title: 'Тіні забутих предків',  author: 'Михайло Коцюбинський',  year: 1911, genre: 'Повість',    available: true,  rentCount: 1 },
  { title: 'Лісова пісня',          author: 'Леся Українка',         year: 1911, genre: 'Драма',      available: false, rentedBy: 'Олена Петренко', rentedAt: new Date('2026-04-10'), rentCount: 3 },
  { title: '1984',                  author: 'Джордж Орвелл',         year: 1949, genre: 'Антиутопія', available: true,  rentCount: 5 },
  { title: 'Майстер і Маргарита',   author: 'Михайло Булгаков',      year: 1967, genre: 'Роман',      available: true,  rentCount: 2 },
];

async function seed() {
  await connectDB();

  const count = await Book.count();
  if (count > 0) {
    console.log(`ℹ️  База вже містить ${count} книг — seed пропущено`);
    process.exit(0);
  }

  await Book.bulkCreate(initialBooks);
  console.log(`✅  Додано ${initialBooks.length} початкових книг`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed помилка:', err.message);
  process.exit(1);
});
