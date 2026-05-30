const supabase = require('../config/supabase');
const Subtask = require('./Subtask');

async function attachSubtasks(tasks) {
  if (!Array.isArray(tasks)) return tasks;
  const results = [];
  for (const t of tasks) {
    try {
      const subtasks = await Subtask.getByTaskId(t.id);
      results.push({ ...t, subtasks: subtasks || [] });
    } catch (err) {
      results.push({ ...t, subtasks: [] });
    }
  }
  return results;
}

class Task {
  // Get all tasks for a user
  static async getAllByUser(userId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      // Fallback for schema mismatch (e.g., missing subtasks.description)
      console.warn('Tasks select with subtasks failed, falling back to separate subtask queries:', err.message || err);
      const { data, error: e2 } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (e2) throw e2;
      return await attachSubtasks(data || []);
    }
  }

  // Get task by ID
  static async getById(taskId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*)')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Task getById with subtasks failed, falling back:', err.message || err);
      const { data, error: e2 } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (e2) throw e2;
      const subtasks = await Subtask.getByTaskId(taskId);
      return { ...(data || {}), subtasks: subtasks || [] };
    }
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
    // Normalize camelCase keys (e.g., dueDate) to snake_case (due_date) for the DB
    const toSnake = (s) => s.replace(/([A-Z])/g, '_$1').toLowerCase();
    const dbUpdate = {};
    Object.keys(updateData || {}).forEach((k) => {
      const snake = toSnake(k);
      dbUpdate[snake] = updateData[k];
    });

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdate)
        .eq('id', taskId)
        .select();

      if (error) throw error;
      return data?.[0] ?? null;
    } catch (err) {
      const msg = (err?.message || '').toLowerCase();
      // If error refers to missing columns (schema cache mismatch), try to remove offending keys and retry once
      if (msg.includes('could not find') || msg.includes('column') || msg.includes('does not exist') || msg.includes("could not find the '")) {
        console.warn('Task.update failed due to schema mismatch. Attempting retry without problematic columns.', err.message || err);
        // Heuristic: find column/token names in the error message
        const matches = (err.message || '').match(/(?:column\s+"([a-z0-9_]+)"|could not find the '([a-z0-9_]+)' column|column '([a-z0-9_]+)')/ig);
        const problematic = new Set();
        if (matches) {
          for (const m of matches) {
            const nm = (m.match(/"([a-z0-9_]+)"/) || m.match(/'([a-z0-9_]+)'/) || [])[1];
            if (nm) problematic.add(nm);
          }
        }
        // Fallback: if no matches, try removing updated_at and due_date keys as common culprits
        if (problematic.size === 0) {
          ['updated_at', 'due_date', 'order_index', 'status', 'description'].forEach((k) => problematic.add(k));
        }

        const cleaned = { ...dbUpdate };
        for (const p of problematic) delete cleaned[p];

        // If nothing left to update, return null
        if (Object.keys(cleaned).length === 0) {
          console.warn('No valid columns left to update after removing problematic columns. Skipping update.');
          return null;
        }

        const { data: data2, error: error2 } = await supabase
          .from('tasks')
          .update(cleaned)
          .eq('id', taskId)
          .select();

        if (error2) throw error2;
        return data2?.[0] ?? null;
      }

      throw err;
    }
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
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*)')
        .eq('user_id', userId)
        .eq('status', status)
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('getByStatus fallback due to schema error:', err.message || err);
      const { data, error: e2 } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true });

      if (e2) throw e2;
      return await attachSubtasks(data || []);
    }
  }

  // Get tasks by category
  static async getByCategory(userId, category) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*)')
        .eq('user_id', userId)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('getByCategory fallback due to schema error:', err.message || err);
      const { data, error: e2 } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (e2) throw e2;
      return await attachSubtasks(data || []);
    }
  }

  // Get upcoming tasks
  static async getUpcoming(userId, days = 7) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*)')
        .eq('user_id', userId)
        .gte('due_date', new Date().toISOString())
        .lte('due_date', new Date(Date.now() + days * 86400000).toISOString())
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('getUpcoming fallback due to schema error:', err.message || err);
      const { data, error: e2 } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .gte('due_date', new Date().toISOString())
        .lte('due_date', new Date(Date.now() + days * 86400000).toISOString())
        .order('due_date', { ascending: true });

      if (e2) throw e2;
      return await attachSubtasks(data || []);
    }
  }

  // Get overdue tasks
  static async getOverdue(userId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*)')
        .eq('user_id', userId)
        .lt('due_date', new Date().toISOString())
        .neq('status', 'done')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('getOverdue fallback due to schema error:', err.message || err);
      const { data, error: e2 } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .lt('due_date', new Date().toISOString())
        .neq('status', 'done')
        .order('due_date', { ascending: true });

      if (e2) throw e2;
      return await attachSubtasks(data || []);
    }
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
