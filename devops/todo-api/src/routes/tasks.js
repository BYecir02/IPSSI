const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// GET /api/tasks - Lister toutes les tâches
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM tasks ORDER BY "createdAt" DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id - Voir une tâche
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks - Créer une tâche
router.post('/', async (req, res, next) => {
  const { title, description, status } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const id = uuidv4();
  const createdAt = new Date();
  const updatedAt = new Date();

  try {
    const { rows } = await db.query(
      'INSERT INTO tasks (id, title, description, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, title, description || '', status || 'todo', createdAt, updatedAt]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id - Modifier une tâche
router.put('/:id', async (req, res, next) => {
  const { title, description, status } = req.body;

  try {
    // Check if task exists
    const { rows: existingRows } = await db.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = existingRows[0];
    const updatedTask = {
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
      status: status !== undefined ? status : task.status,
      updatedAt: new Date()
    };

    const { rows } = await db.query(
      'UPDATE tasks SET title = $1, description = $2, status = $3, "updatedAt" = $4 WHERE id = $5 RETURNING *',
      [updatedTask.title, updatedTask.description, updatedTask.status, updatedTask.updatedAt, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id - Supprimer une tâche
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
