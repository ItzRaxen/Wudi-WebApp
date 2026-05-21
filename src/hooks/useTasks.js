import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
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
  return useInfiniteQuery({
    queryKey: [...taskKeys.all, groups.length],
    queryFn: ({ pageParam = 1 }) => taskService.getTasksPage(pageParam, groups),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const current = Number(lastPage.pagination?.current_page || 1);
      const last = Number(lastPage.pagination?.last_page || 1);
      return current < last ? current + 1 : undefined;
    },
  });
}

export function usePersonalTasks() {
  const groups = useGroupContext();
  return useInfiniteQuery({
    queryKey: [...taskKeys.personal, groups.length],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await taskService.getTasksPage(pageParam, groups);
      return { ...result, todos: result.todos.filter((task) => task.type === 'personal') };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const current = Number(lastPage.pagination?.current_page || 1);
      const last = Number(lastPage.pagination?.last_page || 1);
      return current < last ? current + 1 : undefined;
    },
  });
}

export function useGroupTasks(groupId = 'all') {
  const groups = useGroupContext();
  return useInfiniteQuery({
    queryKey: [...taskKeys.group, groupId, groups.length],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await taskService.getTasksPage(pageParam, groups);
      let todos = result.todos.filter((task) => task.type === 'group');
      if (groupId !== 'all') {
        todos = todos.filter((task) => String(task.teamId) === String(groupId));
      }
      return { ...result, todos };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const current = Number(lastPage.pagination?.current_page || 1);
      const last = Number(lastPage.pagination?.last_page || 1);
      return current < last ? current + 1 : undefined;
    },
  });
}

export function useTodayTasks() {
  const groups = useGroupContext();
  return useQuery({
    queryKey: [...taskKeys.today, groups.length],
    queryFn: () => taskService.getTodayTasks(groups),
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
