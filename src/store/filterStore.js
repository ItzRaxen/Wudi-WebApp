import { create } from 'zustand';

const defaults = {
  search: '',
  status: 'all',
  priority: 'all',
};

export const useFilterStore = create((set) => ({
  personal: defaults,
  group: defaults,
  search: '',
  setPersonalFilter: (updates) => set((state) => ({ personal: { ...state.personal, ...updates } })),
  setGroupFilter: (updates) => set((state) => ({ group: { ...state.group, ...updates } })),
  setSearch: (search) => set({ search }),
  resetPersonal: () => set({ personal: defaults }),
  resetGroup: () => set({ group: defaults }),
}));
