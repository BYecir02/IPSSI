const Task = require('../../src/models/task');
const db = require('../../src/db');

// Mock le module db
jest.mock('../../src/db');

describe('Task Model Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all tasks from the database', async () => {
      const mockTasks = [{ id: '1', title: 'Test Task' }];
      db.query.mockResolvedValue({ rows: mockTasks });

      const tasks = await Task.getAll();

      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM tasks'));
      expect(tasks).toEqual(mockTasks);
    });
  });

  describe('getById', () => {
    it('should return a task by id', async () => {
      const mockTask = { id: '1', title: 'Test Task' };
      db.query.mockResolvedValue({ rows: [mockTask] });

      const task = await Task.getById('1');

      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), ['1']);
      expect(task).toEqual(mockTask);
    });

    it('should return undefined if task not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const task = await Task.getById('999');

      expect(task).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should insert a new task and return it', async () => {
      const newTask = {
        id: 'uuid',
        title: 'New Task',
        description: 'Desc',
        status: 'todo',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      db.query.mockResolvedValue({ rows: [newTask] });

      const task = await Task.create(newTask);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tasks'),
        [newTask.id, newTask.title, newTask.description, newTask.status, newTask.createdAt, newTask.updatedAt]
      );
      expect(task).toEqual(newTask);
    });
  });

  describe('delete', () => {
    it('should return true if a task was deleted', async () => {
      db.query.mockResolvedValue({ rowCount: 1 });

      const result = await Task.delete('1');

      expect(result).toBe(true);
    });

    it('should return false if no task was deleted', async () => {
      db.query.mockResolvedValue({ rowCount: 0 });

      const result = await Task.delete('999');

      expect(result).toBe(false);
    });
  });
});
