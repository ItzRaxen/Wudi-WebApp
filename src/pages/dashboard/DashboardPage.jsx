import { AlertCircle, CalendarCheck2, CheckCircle2, ListTodo, UsersRound } from 'lucide-react';
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

export function DashboardPage() {
  const { user } = useAuth();
  const modals = useTaskModals();
  const { data: tasks = [], isLoading } = useAllTasks();
  const { data: groups = [] } = useGroups();
  const { toggleTask, isPending } = useTaskMutations();

  const todayTasks = tasks.filter((task) => isTodayDate(task.deadline));
  const overdueTasks = tasks.filter((task) => isOverdue(task.deadline, task.isCompleted));
  const completedTasks = tasks.filter((task) => task.isCompleted);
  const recentTasks = [...tasks].slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Welcome${user?.name ? `, ${user.name}` : ''}`}
        description="Live task overview from the same backend used by WUDI mobile."
        actions={<Button onClick={modals.openCreate}>Add task</Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total tasks" value={tasks.length} icon={ListTodo} tone="blue" />
        <StatCard label="Tasks today" value={todayTasks.length} icon={CalendarCheck2} tone="violet" />
        <StatCard label="Overdue" value={overdueTasks.length} icon={AlertCircle} tone="red" />
        <StatCard label="Completed" value={completedTasks.length} icon={CheckCircle2} tone="green" />
        <StatCard label="Groups" value={groups.length} icon={UsersRound} tone="slate" />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-950 dark:text-white">Recent tasks</h2>
        <TaskList
          tasks={recentTasks}
          loading={isLoading}
          actions={{
            onOpen: modals.openDetail,
            onEdit: modals.openEdit,
            onDelete: modals.openDelete,
            onToggle: (task) => toggleTask({ task, user, completed: !task.isCompleted }),
            loading: isPending,
          }}
        />
      </section>

      <TaskMutationModals state={modals} />
    </>
  );
}
