import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { REFETCH_INTERVAL_MS } from '../constants/app.js';
import { taskService } from '../services/taskService.js';
import { useGroups } from './useGroups.js';

export const taskKeys = {
  all: ['tasks'],
  personal: ['tasks', 'personal'],
  group: ['tasks', 'group'],
  today: ['tasks', 'today'],
};

function useGroupContext() {
  const { data: groups = [] } = useGroups();
  return groups;
}

export function useAllTasks() {
  const groups = useGroupContext();
  return useQuery({
    queryKey: [...taskKeys.all, groups.length],
    queryFn: () => taskService.getAllTasks(groups),
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}

export function usePersonalTasks() {
  const groups = useGroupContext();
  return useQuery({
    queryKey: [...taskKeys.personal, groups.length],
    queryFn: async () => (await taskService.getAllTasks(groups)).filter((task) => task.type === 'personal'),
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}

export function useGroupTasks(groupId = 'all') {
  const groups = useGroupContext();
  return useQuery({
    queryKey: [...taskKeys.group, groupId, groups.length],
    queryFn: async () => {
      const tasks = (await taskService.getAllTasks(groups)).filter((task) => task.type === 'group');
      return groupId === 'all' ? tasks : tasks.filter((task) => String(task.teamId) === String(groupId));
    },
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}

export function useTodayTasks() {
  const groups = useGroupContext();
  return useQuery({
    queryKey: [...taskKeys.today, groups.length],
    queryFn: () => taskService.getTodayTasks(groups),
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}

export function useTaskMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tasks'] });

  const createTask = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      invalidate();
      toast.success('Task created');
    },
    onError: (error) => toast.error(error.message || 'Failed to create task'),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, values }) => taskService.updateTask(id, values),
    onSuccess: () => {
      invalidate();
      toast.success('Task updated');
    },
    onError: (error) => toast.error(error.message || 'Failed to update task'),
  });

  const deleteTask = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      invalidate();
      toast.success('Task deleted');
    },
    onError: (error) => {
      if (error.status === 401 || error.status === 403) {
        toast.error('You can only delete tasks that you created.');
      } else {
        toast.error(error.message || 'Failed to delete task');
      }
    },
  });

  const toggleTask = useMutation({
    mutationFn: ({ task, user, completed }) => taskService.toggleTaskStatus(task, user, completed),
    onSuccess: () => invalidate(),
    onError: (error) => toast.error(error.message || 'Failed to update status'),
  });

  return {
    createTask: createTask.mutateAsync,
    updateTask: updateTask.mutateAsync,
    deleteTask: deleteTask.mutateAsync,
    toggleTask: toggleTask.mutateAsync,
    isPending:
      createTask.isPending || updateTask.isPending || deleteTask.isPending || toggleTask.isPending,
  };
}
