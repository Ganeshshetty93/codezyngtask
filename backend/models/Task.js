const supabase = require('../config/supabase');

class Task {
  // Get all tasks for a user
  static async getAllByUser(userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get task by ID
  static async getById(taskId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) throw error;
    return data;
  }

  // Create task
  static async create(taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select();

    if (error) throw error;
    return data?.[0] ?? null;
  }

  // Update task
  static async update(taskId, updateData) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select();

    if (error) throw error;
    return data?.[0] ?? null;
  }

  // Delete task
  static async delete(taskId) {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .select();

    if (error) throw error;
    return data;
  }

  // Get tasks by status
  static async getByStatus(userId, status) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Get tasks by category
  static async getByCategory(userId, category) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get upcoming tasks
  static async getUpcoming(userId, days = 7) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('due_date', new Date().toISOString())
      .lte('due_date', new Date(Date.now() + days * 86400000).toISOString())
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Get overdue tasks
  static async getOverdue(userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .lt('due_date', new Date().toISOString())
      .neq('status', 'done')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Get task statistics
  static async getStats(userId) {
    const tasks = await this.getAllByUser(userId);
    return {
      total: tasks.length,
      todo_count: tasks.filter((task) => task.status === 'todo').length,
      in_progress: tasks.filter((task) => task.status === 'in_progress').length,
      completed: tasks.filter((task) => task.status === 'done').length,
      high_priority: tasks.filter((task) => task.priority === 'high').length
    };
  }
}

module.exports = Task;
