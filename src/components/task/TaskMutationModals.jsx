import { useAuth } from '../../hooks/useAuth.js';
import { useGroups } from '../../hooks/useGroups.js';
import { useTaskMutations } from '../../hooks/useTasks.js';
import { TaskForm } from '../forms/TaskForm.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { Modal } from '../ui/Modal.jsx';
import { TaskDetailModal } from './TaskDetailModal.jsx';

export function TaskMutationModals({ state, mode = 'personal', selectedGroupId = '' }) {
  const { user } = useAuth();
  const { data: groups = [] } = useGroups();
  const { createTask, updateTask, deleteTask, toggleTask, isPending } = useTaskMutations();

  const handleToggle = async (task) => {
    const updatedTask = await toggleTask({ task, user, completed: !task.isCompleted });
    if (state.detailTask?.id === task.id) {
      state.openDetail(updatedTask);
    }
  };

  return (
    <>
      <Modal open={state.creating} title={mode === 'group' ? 'Create group task' : 'Create personal task'} onClose={state.closeCreate}>
        <TaskForm
          mode={mode}
          groups={groups}
          selectedGroupId={selectedGroupId}
          loading={isPending}
          onCancel={state.closeCreate}
          onSubmit={async (values) => {
            await createTask(values);
            state.closeCreate();
          }}
        />
      </Modal>

      <Modal open={Boolean(state.editingTask)} title="Edit task" onClose={state.closeEdit}>
        <TaskForm
          task={state.editingTask}
          mode={state.editingTask?.type === 'group' ? 'group' : mode}
          groups={groups}
          loading={isPending}
          onCancel={state.closeEdit}
          onSubmit={async (values) => {
            await updateTask({ id: state.editingTask.id, values });
            state.closeEdit();
          }}
        />
      </Modal>

      <TaskDetailModal
        open={Boolean(state.detailTask)}
        task={state.detailTask}
        loading={isPending}
        onClose={state.closeDetail}
        onToggle={handleToggle}
        onEdit={(task) => {
          state.closeDetail();
          state.openEdit(task);
        }}
        onDelete={(task) => {
          state.closeDetail();
          state.openDelete(task);
        }}
      />

      <ConfirmDialog
        open={Boolean(state.deletingTask)}
        title="Delete task?"
        description={`This will delete "${state.deletingTask?.title}" from the same backend used by mobile.`}
        loading={isPending}
        onClose={state.closeDelete}
        onConfirm={async () => {
          await deleteTask(state.deletingTask.id);
          state.closeDelete();
        }}
      />
    </>
  );
}
