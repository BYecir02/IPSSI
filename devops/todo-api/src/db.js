const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'todo_user',
  host: process.env.DB_HOST || 'db',
  database: process.env.POSTGRES_DB || 'todo_db',
  password: process.env.POSTGRES_PASSWORD || 'todo_pass',
  port: 5432,
});

const initDb = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'todo',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(queryText);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database', err);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDb,
};
