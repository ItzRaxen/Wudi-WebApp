import { useState } from 'react';

export function useTaskModals(defaultMode = 'personal') {
  const [detailTask, setDetailTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [creating, setCreating] = useState(false);

  return {
    detailTask,
    editingTask,
    deletingTask,
    creating,
    openDetail: setDetailTask,
    openEdit: setEditingTask,
    openDelete: setDeletingTask,
    openCreate: () => setCreating(true),
    closeDetail: () => setDetailTask(null),
    closeEdit: () => setEditingTask(null),
    closeDelete: () => setDeletingTask(null),
    closeCreate: () => setCreating(false),
    defaultMode,
  };
}
