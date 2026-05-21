import { AlertCircle, CalendarCheck2, CheckCircle2, ListTodo, Search, UsersRound, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { TaskList } from '../../components/task/TaskList.jsx';
import { TaskMutationModals } from '../../components/task/TaskMutationModals.jsx';
import { useTaskModals } from '../../hooks/useTaskModals.js';
import { useAllTasks, useTaskMutations } from '../../hooks/useTasks.js';
import { useGroups } from '../../hooks/useGroups.js';
import { useAuth } from '../../hooks/useAuth.js';
import { isOverdue, isTodayDate } from '../../utils/date.js';
import { Button } from '../../components/ui/Button.jsx';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { filterTasks } from '../../utils/task.js';

export function DashboardPage() {
  const { user } = useAuth();
  const modals = useTaskModals();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useAllTasks();
  const { data: groups = [] } = useGroups();
  const { toggleTask, isPending } = useTaskMutations();

  const tasks = data?.pages.flatMap((page) => page.todos) || [];
  const totalTasksCount = data?.pages[0]?.pagination?.total || tasks.length;

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 250);

  const todayTasks = tasks.filter((task) => isTodayDate(task.deadline));
  const overdueTasks = tasks.filter((task) => isOverdue(task.deadline, task.isCompleted));
  const completedTasks = tasks.filter((task) => task.isCompleted);

  const isSearching = debouncedSearch.trim().length > 0;
  const searchResults = useMemo(
    () => filterTasks(tasks, { search: debouncedSearch }, groups),
    [debouncedSearch, groups, tasks],
  );
  const recentTasks = isSearching ? searchResults : [...tasks].slice(0, 5);

  const taskActions = {
    onOpen: modals.openDetail,
    onEdit: modals.openEdit,
    onDelete: modals.openDelete,
    onToggle: (task) => toggleTask({ task, user, completed: !task.isCompleted }),
    loading: isPending,
  };

  return (
    <>
      <PageHeader
        title={`Welcome${user?.name ? `, ${user.name}` : ''}`}
        description="Live task overview from the same backend used by WUDI mobile."
        actions={<Button onClick={modals.openCreate}>Add task</Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total tasks" value={totalTasksCount} icon={ListTodo} tone="blue" />
        <StatCard label="Tasks today" value={todayTasks.length} icon={CalendarCheck2} tone="violet" />
        <StatCard label="Overdue" value={overdueTasks.length} icon={AlertCircle} tone="red" />
        <StatCard label="Completed" value={completedTasks.length} icon={CheckCircle2} tone="green" />
        <StatCard label="Groups" value={groups.length} icon={UsersRound} tone="slate" />
      </div>

      {/* Search bar */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all tasks by title, description, priority, group..."
            className="w-full rounded-lg border-0 bg-slate-50 py-2 pl-9 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-primary-light dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {!isSearching && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-slate-950 dark:text-white">
            Today's tasks
          </h2>
          <TaskList
            tasks={todayTasks}
            loading={isLoading}
            actions={taskActions}
          />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-950 dark:text-white">
          {isSearching
            ? `Search results ${searchResults.length > 0 ? `(${searchResults.length})` : ''}`
            : 'Recent tasks'}
        </h2>
        <TaskList
          tasks={recentTasks}
          loading={isLoading}
          actions={taskActions}
        />
        {hasNextPage && (
          <div className="mt-6 flex justify-center">
            <Button variant="secondary" loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
              Load More Data
            </Button>
          </div>
        )}
      </section>

      <TaskMutationModals state={modals} />
    </>
  );
}
