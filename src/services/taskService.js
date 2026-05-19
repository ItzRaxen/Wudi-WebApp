import { apiClient, getDeviceId } from './apiClient.js';
import { toApiDeadline } from '../utils/date.js';
import { extractListFromApiPart, normalizeTask } from '../utils/task.js';

function buildTaskPayload(task, { includeTeam = false } = {}) {
  const payload = {
    judul: task.title?.trim() || 'Untitled',
    deskripsi: task.description?.trim() || null,
    priority: task.priority || 'medium',
    is_completed: Boolean(task.isCompleted),
    device_id: getDeviceId(),
  };

  const deadline = toApiDeadline(task.deadline ?? task.dueDate);
  if (deadline) payload.deadline = deadline;
  if (includeTeam && task.teamId) payload.team_id = Number(task.teamId);
  if (task.assignedEmails?.length) payload.assigned_emails = task.assignedEmails;

  return payload;
}

async function fetchTodosPage(page = 1) {
  const data = await apiClient.get('todos', { page, assigned_only: 1 });
  const todos = extractListFromApiPart(data?.todos ?? data?.data?.todos ?? data);
  const pagination = data?.pagination ?? data?.meta ?? null;
  return { todos, pagination };
}

async function fetchAllTodos(groups = []) {
  const all = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const { todos, pagination } = await fetchTodosPage(page);
    all.push(...todos);
    const currentPage = Number(pagination?.current_page ?? page);
    const lastPage = Number(pagination?.last_page ?? page);
    hasNextPage = Boolean(pagination && currentPage < lastPage && todos.length);
    page += 1;
  }

  return all.map((todo) => normalizeTask(todo, groups));
}

function createPollingSubscription(fetcher, callback, onError) {
  let active = true;
  let lastJson = '';

  const run = async () => {
    try {
      const data = await fetcher();
      const nextJson = JSON.stringify(data);
      if (active && nextJson !== lastJson) {
        lastJson = nextJson;
        callback(data);
      }
    } catch (error) {
      if (active) onError?.(error);
    }
  };

  run();
  const timer = window.setInterval(run, 3000);
  return () => {
    active = false;
    window.clearInterval(timer);
  };
}

export const taskService = {
  async getAllTasks(groups = []) {
    return fetchAllTodos(groups);
  },

  subscribePersonalTasks(user, callback, onError, groups = []) {
    return createPollingSubscription(
      async () => (await fetchAllTodos(groups)).filter((task) => task.type === 'personal'),
      callback,
      onError,
    );
  },

  subscribeGroupTasks(user, callback, onError, groups = []) {
    return createPollingSubscription(
      async () => (await fetchAllTodos(groups)).filter((task) => task.type === 'group'),
      callback,
      onError,
    );
  },

  async createTask(task) {
    const data = await apiClient.post('todos', buildTaskPayload(task, { includeTeam: true }));
    return normalizeTask(data?.todo ?? data);
  },

  async updateTask(taskId, task) {
    const data = await apiClient.put(`todos/${taskId}`, buildTaskPayload(task, { includeTeam: false }));
    return normalizeTask(data?.todo ?? data);
  },

  async deleteTask(taskId) {
    return apiClient.delete(`todos/${taskId}`);
  },

  async toggleTaskStatus(task, user, nextCompleted) {
    if (task.teamId) {
      const data = await apiClient.post(`todos/${task.id}/toggle-member`);
      return normalizeTask(data?.todo ?? data);
    }
    const data = await apiClient.put(`todos/${task.id}`, {
      ...buildTaskPayload(task),
      is_completed: nextCompleted ?? !task.isCompleted,
    });
    return normalizeTask(data?.todo ?? data);
  },

  async getTodayTasks(groups = []) {
    const tasks = await fetchAllTodos(groups);
    return tasks.filter((task) => task.dueDate && task.dueDate.toDateString() === new Date().toDateString());
  },

  async searchTasks(query, groups = []) {
    const tasks = await fetchAllTodos(groups);
    const keyword = query.toLowerCase().trim();
    if (!keyword) return tasks;
    return tasks.filter((task) =>
      [
        task.title,
        task.description,
        task.priority,
        task.groupName,
        ...task.assignedEmails,
        ...task.assignedMembers.map((member) => member.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  },
};
