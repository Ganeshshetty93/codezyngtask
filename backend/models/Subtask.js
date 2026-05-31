const supabase = require('../config/supabase');

class Subtask {
  static async createMany(taskId, subtasks = []) {
    if (!taskId || !Array.isArray(subtasks) || subtasks.length === 0) {
      return [];
    }

    const insertData = subtasks.map((subtask, index) => ({
      task_id: taskId,
      title: subtask.title || subtask.name || 'Untitled subtask',
      description: subtask.description || null,
      status: subtask.status || 'todo',
      order_index: index
    }));

    try {
      console.info('Inserting subtasks for task', taskId, { count: insertData.length });
      const { data, error } = await supabase
        .from('subtasks')
        .insert(insertData)
        .select();

      if (error) throw error;
      console.info('Inserted subtasks', { taskId, inserted: (data || []).length });
      return data || [];
    } catch (err) {
      console.warn('Subtask.insert failed, attempting fallback checks', err?.message || err);
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('description') || msg.includes('order_index') || msg.includes('status') || msg.includes('could not find') || msg.includes('column')) {
        const excludeOrder = msg.includes('order_index');
        const excludeDesc = msg.includes('description');
        const excludeStatus = msg.includes('status');

        const insertDataFallback = subtasks.map((subtask, index) => {
          const base = {
            task_id: taskId,
            title: subtask.title || subtask.name || 'Untitled subtask'
          };
          if (!excludeStatus) base.status = subtask.status || 'todo';
          if (!excludeOrder) base.order_index = index;
          if (!excludeDesc) base.description = subtask.description || null;
          return base;
        });

        console.info('Retrying subtask insert with fallback payload', { excludeDesc, excludeOrder, excludeStatus });
        const { data: data2, error: error2 } = await supabase
          .from('subtasks')
          .insert(insertDataFallback)
          .select();

        if (error2) {
          console.error('Fallback subtask insert failed', error2);
          throw error2;
        }
        console.info('Fallback insert succeeded', { taskId, inserted: (data2 || []).length });
        return data2 || [];
      }

      throw err;
    }
  }

  static async getByTaskId(taskId) {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    } catch (err) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('order_index') || msg.includes('could not find') || msg.includes('column')) {
        const { data: data2, error: error2 } = await supabase
          .from('subtasks')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: true });

        if (error2) throw error2;
        return data2 || [];
      }
      throw err;
    }
  }
}

module.exports = Subtask;
