import { CalendarClock, Check, Pencil, Trash2, UserRound, UsersRound, Loader2 } from 'lucide-react';
import { formatDateTime, isOverdue } from '../../utils/date.js';
import { Button } from '../ui/Button.jsx';
import { PriorityBadge, StatusBadge, TypeBadge } from '../ui/Badge.jsx';

export function TaskCard({ task, onOpen, onEdit, onDelete, onToggle, loading }) {
  const overdue = isOverdue(task.deadline, task.isCompleted);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <button className="min-w-0 flex-1 text-left" onClick={() => onOpen?.(task)}>
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge completed={task.isCompleted} />
            <TypeBadge type={task.type} />
          </div>
          <h3 className={`mt-3 line-clamp-2 text-base font-bold ${task.isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-950 dark:text-white'}`}>
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {task.description}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className={overdue ? 'text-red-600' : ''}>
              <CalendarClock className="mr-1 inline h-3.5 w-3.5" />
              {formatDateTime(task.deadline)}
            </span>
            {task.type === 'group' ? (
              <span>
                <UsersRound className="mr-1 inline h-3.5 w-3.5" />
                {task.groupName || `Group #${task.teamId}`}
              </span>
            ) : (
              <span>
                <UserRound className="mr-1 inline h-3.5 w-3.5" />
                Personal
              </span>
            )}
          </div>
          {task.assignedEmails?.length ? (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Assigned: {task.assignedEmails.join(', ')}
            </p>
          ) : null}
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.(task);
            }}
            disabled={loading}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-colors ${
              task.isCompleted
                ? 'border-primary bg-primary text-white dark:border-primary-light dark:bg-primary-light'
                : 'border-slate-300 bg-transparent hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600'
            }`}
            aria-label={task.isCompleted ? 'Mark pending' : 'Mark complete'}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : task.isCompleted ? (
              <Check className="h-6 w-6" strokeWidth={2.5} />
            ) : null}
          </button>
          <Button variant="secondary" size="icon" onClick={(e) => { e.stopPropagation(); onEdit?.(task); }} aria-label="Edit task">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={(e) => { e.stopPropagation(); onDelete?.(task); }} aria-label="Delete task">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
