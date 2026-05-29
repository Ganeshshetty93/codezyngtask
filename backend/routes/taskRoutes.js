const express = require('express');
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// AI Features (must come before /:id routes)
router.post('/natural-language/create', taskController.createFromNaturalLanguage);

// Special routes (must come before /:id routes)
router.get('/stats/dashboard', taskController.getStats);
router.get('/status/:status', taskController.getByStatus);
router.get('/category/:category', taskController.getByCategory);
router.get('/upcoming/all', taskController.getUpcoming);
router.get('/overdue/all', taskController.getOverdue);
router.get('/ai/suggestions', taskController.getAISuggestions);

// Task CRUD
router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/:id/breakdown', taskController.breakDownTask);

module.exports = router;
