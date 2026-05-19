import { PRIORITY_STYLES } from '../constants/app.js';
import { taskService } from './taskService.js';

export const calendarService = {
  async getCalendarEvents(groups = []) {
    const tasks = await taskService.getAllTasks(groups);
    return tasks
      .filter((task) => task.dueDate)
      .map((task) => {
        const priorityColor = PRIORITY_STYLES[task.priority]?.calendar || '#94a3b8';
        return {
          id: String(task.id),
          title: task.title,
          start: task.dueDate,
          allDay: false,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: priorityColor, // We pass the priority color here to use it for the dot
          extendedProps: { task },
        };
      });
  },
};
