import { filterTasks } from '../utils/task.js';
import { taskService } from './taskService.js';

export const searchService = {
  async searchTasks(query, groups = []) {
    const tasks = await taskService.getAllTasks(groups);
    return filterTasks(tasks, { search: query }, groups);
  },
};
