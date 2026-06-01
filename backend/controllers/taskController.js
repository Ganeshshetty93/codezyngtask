const Task = require('../models/Task');
const Subtask = require('../models/Subtask');
const AITaskService = require('../services/aiTaskService');

const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];
const VALID_STATUSES = ['todo', 'in_progress', 'done'];

function isPastDate(dateValue) {
  if (!dateValue) return false;
  const dueDate = new Date(dateValue);
  if (Number.isNaN(dueDate.getTime())) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
}

function validateTaskPayload(payload = {}, { partial = false } = {}) {
  const errors = {};
  const title = payload.title?.toString().trim();
  const description = payload.description?.toString() || '';
  const category = payload.category?.toString().trim();
  const priority = payload.priority?.toString().trim();
  const status = payload.status?.toString().trim();
  const dueDate = payload.dueDate ?? payload.due_date;
  const reminderAt = payload.reminderAt ?? payload.reminder_at;

  if (!partial || payload.title !== undefined) {
    if (!title) errors.title = 'Title is required.';
    else if (title.length < 3) errors.title = 'Title must be at least 3 characters.';
    else if (title.length > 120) errors.title = 'Title must be 120 characters or fewer.';
  }

  if (description.length > 1000) {
    errors.description = 'Description must be 1000 characters or fewer.';
  }

  if (!partial || payload.category !== undefined) {
    if (!category) errors.category = 'Category is required.';
    else if (category.length > 50) errors.category = 'Category must be 50 characters or fewer.';
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    errors.priority = 'Priority must be low, medium, high, or critical.';
  }

  if (status && !VALID_STATUSES.includes(status)) {
    errors.status = 'Status must be todo, in_progress, or done.';
  }

  if (dueDate && isPastDate(dueDate)) {
    errors.dueDate = 'Due date must be today or later.';
  }

  if (reminderAt) {
    const reminderDate = new Date(reminderAt);
    if (Number.isNaN(reminderDate.getTime())) {
      errors.reminderAt = 'Reminder must be a valid date and time.';
    }
  }

  return errors;
}

function sendValidationError(res, errors) {
  return res.status(400).json({
    message: Object.values(errors)[0] || 'Validation failed.',
    errors
  });
}

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.getAllByUser(userId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create task with AI suggestions
exports.createTask = async (req, res) => {
  try {
    const { title, description, category, priority, dueDate, reminderAt, estimatedHours, useAI } = req.body;
    const userId = req.user.id;
    const validationErrors = validateTaskPayload(req.body);

    if (Object.keys(validationErrors).length > 0) {
      return sendValidationError(res, validationErrors);
    }

    let taskData = {
      user_id: userId,
      title: title.trim(),
      description: description?.trim() || null,
      category: category?.trim() || 'general',
      priority: priority || 'medium',
      due_date: dueDate || null,
      reminder_at: reminderAt || null,
      estimated_hours: estimatedHours || null,
      status: 'todo'
    };

    // Use AI to suggest priority and time estimation
    if (useAI) {
      const [suggestedPriority, estimatedHours] = await Promise.all([
        AITaskService.suggestPriority(title, description),
        AITaskService.estimateTime(title, description)
      ]);

      taskData.priority = suggestedPriority;
      taskData.estimated_hours = estimatedHours;
    }

    const task = await Task.create(taskData);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create task from natural language
exports.createFromNaturalLanguage = async (req, res) => {
  try {
    const { input } = req.body;
    const userId = req.user.id;
    const normalizedInput = input?.toString().trim();

    if (!normalizedInput) {
      return sendValidationError(res, { input: 'Task description is required.' });
    }

    if (normalizedInput.length < 5) {
      return sendValidationError(res, { input: 'Task description must be at least 5 characters.' });
    }

    if (normalizedInput.length > 1000) {
      return sendValidationError(res, { input: 'Task description must be 1000 characters or fewer.' });
    }

    // Parse natural language
    const parsedTask = await AITaskService.parseNaturalLanguage(normalizedInput);

    // Break down into subtasks
    const subtasks = await AITaskService.breakDownTask(parsedTask.title, parsedTask.description);

    // Estimate time
    const estimatedHours = await AITaskService.estimateTime(parsedTask.title, parsedTask.description);

    const taskData = {
      user_id: userId,
      title: parsedTask.title,
      description: parsedTask.description,
      category: parsedTask.category || 'general',
      priority: parsedTask.priority || 'medium',
      due_date: parsedTask.dueDate || null,
      estimated_hours: estimatedHours,
      status: 'todo'
    };

    const task = await Task.create(taskData);

    let createdSubtasks = [];
    try {
      console.info('Persisting generated subtasks for natural-language task', task.id, { count: subtasks.length });
      createdSubtasks = await Subtask.createMany(task.id, subtasks);
      console.info('Persisted generated subtasks count:', createdSubtasks.length);
      await Task.update(task.id, { updatedAt: new Date().toISOString() });
    } catch (err) {
      console.error('Failed to persist generated subtasks:', err.stack || err.message || err);
    }

    res.status(201).json({
      task,
      subtasks: createdSubtasks.length ? createdSubtasks : subtasks,
      estimatedHours
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Break down task into subtasks
exports.breakDownTask = async (req, res) => {
  try {
    const task = await Task.getById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
      return res.json({ subtasks: task.subtasks, message: 'Task already has subtasks.' });
    }

    const taskDescription = task.description || '';
    const subtasks = await AITaskService.breakDownTask(task.title, taskDescription);
    console.info('AI returned subtasks for task breakdown', { taskId: task.id, count: Array.isArray(subtasks) ? subtasks.length : 0 });
    const createdSubtasks = await Subtask.createMany(task.id, subtasks);

    if (!createdSubtasks || createdSubtasks.length === 0) {
      return res.status(500).json({ message: 'Failed to create subtasks from AI breakdown.' });
    }

    res.json({ subtasks: createdSubtasks });
  } catch (error) {
    console.error('Task breakdown failed:', error.stack || error.message);
    const message = error.message || 'Failed to break down task';
    if (message.toLowerCase().includes('rate limit')) {
      return res.status(503).json({ message: 'AI service is rate limited. Please try again shortly.' });
    }
    res.status(500).json({ message });
  }
};

// Generate AI daily summary
exports.generateDailySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.getAllByUser(userId);
    const summary = await AITaskService.generateDailySummary(tasks || []);

    res.json(summary);
  } catch (error) {
    console.error('Daily summary failed:', error.stack || error.message);
    res.status(500).json({ message: error.message || 'Failed to generate daily summary' });
  }
};

// Predict priority, effort, and category for draft task text
exports.predictTaskDetails = async (req, res) => {
  try {
    const title = req.body.title?.toString().trim();
    const description = req.body.description?.toString().trim() || '';

    if (!title) {
      return sendValidationError(res, { title: 'Title is required for AI prediction.' });
    }

    const prediction = await AITaskService.predictTaskDetails(title, description);
    res.json(prediction);
  } catch (error) {
    console.error('Task prediction failed:', error.stack || error.message);
    res.status(500).json({ message: error.message || 'Failed to predict task details' });
  }
};

// Convert natural language search into task filters
exports.smartSearch = async (req, res) => {
  try {
    const query = req.body.query?.toString().trim();

    if (!query) {
      return sendValidationError(res, { query: 'Search query is required.' });
    }

    const filters = await AITaskService.parseSmartSearch(query);
    res.json(filters);
  } catch (error) {
    console.error('Smart search failed:', error.stack || error.message);
    res.status(500).json({ message: error.message || 'Failed to parse smart search' });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const validationErrors = validateTaskPayload(req.body, { partial: true });

    if (Object.keys(validationErrors).length > 0) {
      return sendValidationError(res, validationErrors);
    }

    const task = await Task.update(req.params.id, req.body);
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    await Task.delete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks by status
exports.getByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const userId = req.user.id;
    const tasks = await Task.getByStatus(userId, status);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks by category
exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.user.id;
    const tasks = await Task.getByCategory(userId, category);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get upcoming tasks
exports.getUpcoming = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.getUpcoming(userId, req.query.days || 7);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get overdue tasks
exports.getOverdue = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.getOverdue(userId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get task statistics
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Task.getStats(userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get AI suggestions
exports.getAISuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.getAllByUser(userId);
    const suggestions = await AITaskService.generateTaskSuggestions(tasks);
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
