const request = require('supertest');
const app = require('../../src/app');
const Task = require('../../src/models/task');

// Mock le modèle Task pour isoler les tests de la BDD
jest.mock('../../src/models/task');

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 and status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return 200 and a list of tasks', async () => {
      const mockTasks = [{ id: '1', title: 'Task 1' }];
      Task.getAll.mockResolvedValue(mockTasks);

      const res = await request(app).get('/api/tasks');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockTasks);
      expect(Task.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a task and return 201', async () => {
      const newTask = { title: 'Test Task' };
      const mockCreatedTask = { id: 'uuid', ...newTask, status: 'todo' };
      Task.create.mockResolvedValue(mockCreatedTask);

      const res = await request(app)
        .post('/api/tasks')
        .send(newTask);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(mockCreatedTask);
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Title is required');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return 200 and the task', async () => {
      const mockTask = { id: '1', title: 'Task 1' };
      Task.getById.mockResolvedValue(mockTask);

      const res = await request(app).get('/api/tasks/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockTask);
    });

    it('should return 404 if task not found', async () => {
      Task.getById.mockResolvedValue(null);

      const res = await request(app).get('/api/tasks/999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Task not found');
    });
  });
});
