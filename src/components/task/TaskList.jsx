import { ListTodo } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState.jsx';
import { ListSkeleton } from '../ui/Skeleton.jsx';
import { TaskCard } from './TaskCard.jsx';

export function TaskList({ tasks = [], loading, actions }) {
  if (loading) return <ListSkeleton count={5} />;
  if (!tasks.length) {
    return (
      <EmptyState
        icon={ListTodo}
        title="No tasks found"
        description="Create a new task or adjust your filters to see more results."
      />
    );
  }
  return (
    <div className="grid gap-3">
      {tasks.map((task) => (
        <TaskCard key={`${task.type}-${task.id}`} task={task} {...actions} />
      ))}
    </div>
  );
}
