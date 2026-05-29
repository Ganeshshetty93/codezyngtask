const Task = require('../models/Task');
const AITaskService = require('../services/aiTaskService');

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
    const { title, description, category, useAI } = req.body;
    const userId = req.user.id;

    let taskData = {
      user_id: userId,
      title: title || 'New Task',
      description,
      category: category || 'general',
      status: 'todo'
    };

    // Use AI to suggest priority and time estimation
    if (useAI) {
      const [priority, estimatedHours] = await Promise.all([
        AITaskService.suggestPriority(title, description),
        AITaskService.estimateTime(title, description)
      ]);

      taskData.priority = priority;
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

    // Parse natural language
    const parsedTask = await AITaskService.parseNaturalLanguage(input);

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
      estimated_hours: estimatedHours,
      status: 'todo'
    };

    const task = await Task.create(taskData);

    res.status(201).json({
      task,
      subtasks,
      estimatedHours
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Break down task into subtasks
exports.breakDownTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.getById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subtasks = await AITaskService.breakDownTask(task.title, task.description);
    res.json({ subtasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
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
