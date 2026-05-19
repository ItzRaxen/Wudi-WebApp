import { CalendarCheck2 } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { TaskList } from '../../components/task/TaskList.jsx';
import { TaskMutationModals } from '../../components/task/TaskMutationModals.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useTaskMutations, useTodayTasks } from '../../hooks/useTasks.js';
import { useTaskModals } from '../../hooks/useTaskModals.js';

export function TodayPage() {
  const { user } = useAuth();
  const modals = useTaskModals();
  const { data: tasks = [], isLoading } = useTodayTasks();
  const { toggleTask, isPending } = useTaskMutations();
  const pending = tasks.filter((task) => !task.isCompleted);
  const completed = tasks.filter((task) => task.isCompleted);
  const actions = {
    onOpen: modals.openDetail,
    onEdit: modals.openEdit,
    onDelete: modals.openDelete,
    onToggle: (task) => toggleTask({ task, user, completed: !task.isCompleted }),
    loading: isPending,
  };

  return (
    <>
      <PageHeader title="Today Task" description="All personal and group tasks due today." />
      {!isLoading && !tasks.length ? (
        <EmptyState icon={CalendarCheck2} title="No task due today" description="Tasks with today's due date will appear here." />
      ) : (
        <div className="grid gap-6">
          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-950 dark:text-white">Pending</h2>
            <TaskList tasks={pending} loading={isLoading} actions={actions} />
          </section>
          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-950 dark:text-white">Completed</h2>
            <TaskList tasks={completed} loading={isLoading} actions={actions} />
          </section>
        </div>
      )}
      <TaskMutationModals state={modals} />
    </>
  );
}
