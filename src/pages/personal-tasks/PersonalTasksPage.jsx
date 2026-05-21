import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { TaskFilters } from '../../components/task/TaskFilters.jsx';
import { TaskList } from '../../components/task/TaskList.jsx';
import { TaskMutationModals } from '../../components/task/TaskMutationModals.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useTaskModals } from '../../hooks/useTaskModals.js';
import { usePersonalTasks, useTaskMutations } from '../../hooks/useTasks.js';
import { useFilterStore } from '../../store/filterStore.js';
import { filterTasks } from '../../utils/task.js';

export function PersonalTasksPage() {
  const { user } = useAuth();
  const modals = useTaskModals('personal');
  const filters = useFilterStore((state) => state.personal);
  const setFilter = useFilterStore((state) => state.setPersonalFilter);
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = usePersonalTasks();
  const { toggleTask, isPending } = useTaskMutations();
  const tasks = data?.pages.flatMap((page) => page.todos) || [];
  const filteredTasks = filterTasks(tasks, filters);

  return (
    <>
      <PageHeader
        title="Personal Tasks"
        description="Create, edit, delete, and complete individual tasks."
        actions={
          <Button onClick={modals.openCreate}>
            <Plus className="h-4 w-4" />
            Add task
          </Button>
        }
      />
      <TaskFilters filters={filters} onChange={setFilter} />
      <TaskList
        tasks={filteredTasks}
        loading={isLoading}
        actions={{
          onOpen: modals.openDetail,
          onEdit: modals.openEdit,
          onDelete: modals.openDelete,
          onToggle: (task) => toggleTask({ task, user, completed: !task.isCompleted }),
          loading: isPending,
        }}
      />
      {hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
            Load More Tasks
          </Button>
        </div>
      )}
      <TaskMutationModals state={modals} mode="personal" />
    </>
  );
}
