import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarOpen: false,
  selectedTask: null,
  selectedGroup: null,
  taskModalMode: null,
  darkMode: localStorage.getItem('wudi_dark_mode') === 'true',
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSelectedTask: (selectedTask) => set({ selectedTask }),
  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),
  openTaskModal: (task, mode = 'detail') => set({ selectedTask: task, taskModalMode: mode }),
  closeTaskModal: () => set({ selectedTask: null, taskModalMode: null }),
  toggleDarkMode: () =>
    set((state) => {
      const darkMode = !state.darkMode;
      localStorage.setItem('wudi_dark_mode', String(darkMode));
      document.documentElement.classList.toggle('dark', darkMode);
      return { darkMode };
    }),
}));
