const db = require('../db');

const Task = {
  async getAll() {
    const { rows } = await db.query('SELECT * FROM tasks ORDER BY "createdAt" DESC');
    return rows;
  },

  async getById(id) {
    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return rows[0];
  },

  async create({ id, title, description, status, createdAt, updatedAt }) {
    const { rows } = await db.query(
      'INSERT INTO tasks (id, title, description, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, title, description, status, createdAt, updatedAt]
    );
    return rows[0];
  },

  async update(id, { title, description, status, updatedAt }) {
    const { rows } = await db.query(
      'UPDATE tasks SET title = $1, description = $2, status = $3, "updatedAt" = $4 WHERE id = $5 RETURNING *',
      [title, description, status, updatedAt, id]
    );
    return rows[0];
  },

  async delete(id) {
    const { rowCount } = await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    return rowCount > 0;
  }
};

module.exports = Task;
