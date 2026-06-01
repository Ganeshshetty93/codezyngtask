import { useEffect } from 'react';
import api from '../services/api.jsx';
import { getAuthUserId, initSupabase, supabase } from '../services/supabaseClient.jsx';

function useTaskRealtime({
  channelName = 'tasks',
  onRefresh,
  onStatusChange,
  verifySubtaskOwner = false
}) {
  useEffect(() => {
    try {
      if (!supabase) initSupabase();
    } catch (err) {
      console.warn('Supabase init failed', err);
    }

    if (!supabase) {
      onStatusChange?.(false);
      return undefined;
    }

    const userId = getAuthUserId();
    const refresh = () => onRefresh?.();

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          const record = payload.new || payload.record;
          const oldRecord = payload.old || payload.record;

          if (!userId) return;
          if (record?.user_id !== userId && oldRecord?.user_id !== userId) return;

          refresh();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subtasks' },
        async (payload) => {
          if (!verifySubtaskOwner) {
            refresh();
            return;
          }

          const record = payload.new || payload.record;
          const oldRecord = payload.old || payload.record;
          const taskId = record?.task_id || oldRecord?.task_id;

          if (!taskId) {
            refresh();
            return;
          }

          try {
            const response = await api.get(`/tasks/${taskId}`);
            if (response.data?.user_id === userId) refresh();
          } catch (err) {
            console.warn('Failed to verify subtask owner for realtime update', err);
            refresh();
          }
        }
      );

    channel.subscribe((status) => {
      const active = status === 'SUBSCRIBED';
      onStatusChange?.(active);
      if (active) refresh();
    });

    return () => {
      supabase.removeChannel(channel);
      onStatusChange?.(false);
    };
  }, [channelName, onRefresh, onStatusChange, verifySubtaskOwner]);
}

export default useTaskRealtime;
