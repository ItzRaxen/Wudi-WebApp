import { Search } from 'lucide-react';
import { useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Input } from '../../components/ui/FormField.jsx';
import { TaskList } from '../../components/task/TaskList.jsx';
import { TaskMutationModals } from '../../components/task/TaskMutationModals.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { useAllTasks, useTaskMutations } from '../../hooks/useTasks.js';
import { useGroups } from '../../hooks/useGroups.js';
import { useTaskModals } from '../../hooks/useTaskModals.js';
import { useFilterStore } from '../../store/filterStore.js';
import { filterTasks } from '../../utils/task.js';

export function SearchPage() {
  const { user } = useAuth();
  const modals = useTaskModals();
  const search = useFilterStore((state) => state.search);
  const setSearch = useFilterStore((state) => state.setSearch);
  const debouncedSearch = useDebouncedValue(search, 250);
  const { data: tasks = [], isLoading } = useAllTasks();
  const { data: groups = [] } = useGroups();
  const { toggleTask, isPending } = useTaskMutations();
  const results = useMemo(
    () => filterTasks(tasks, { search: debouncedSearch }, groups),
    [debouncedSearch, groups, tasks],
  );

  return (
    <>
      <PageHeader
        title="Search Tasks"
        description="Search by title, description, priority, group name, or assigned member."
      />
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search all tasks" />
        </div>
      </div>
      <TaskList
        tasks={results}
        loading={isLoading}
        actions={{
          onOpen: modals.openDetail,
          onEdit: modals.openEdit,
          onDelete: modals.openDelete,
          onToggle: (task) => toggleTask({ task, user, completed: !task.isCompleted }),
          loading: isPending,
        }}
      />
      <TaskMutationModals state={modals} />
    </>
  );
}
