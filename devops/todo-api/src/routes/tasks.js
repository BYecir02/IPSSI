const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Task = require('../models/task');

// GET /api/tasks - Lister toutes les tâches
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.getAll();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id - Voir une tâche
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
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

  try {
    const newTask = await Task.create({
      id: uuidv4(),
      title,
      description: description || '',
      status: status || 'todo',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id - Modifier une tâche
router.put('/:id', async (req, res, next) => {
  const { title, description, status } = req.body;

  try {
    const existingTask = await Task.getById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = await Task.update(req.params.id, {
      title: title !== undefined ? title : existingTask.title,
      description: description !== undefined ? description : existingTask.description,
      status: status !== undefined ? status : existingTask.status,
      updatedAt: new Date()
    });
    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id - Supprimer une tâche
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Task.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
