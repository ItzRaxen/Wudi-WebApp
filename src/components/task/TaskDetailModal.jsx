import { CalendarClock, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { formatDateTime } from '../../utils/date.js';
import { Button } from '../ui/Button.jsx';
import { PriorityBadge, StatusBadge, TypeBadge } from '../ui/Badge.jsx';
import { Modal } from '../ui/Modal.jsx';

export function TaskDetailModal({ task, open, onClose, onEdit, onDelete, onToggle, loading }) {
  if (!task) return null;
  return (
    <Modal open={open} title="Task detail" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge completed={task.isCompleted} />
            <TypeBadge type={task.type} />
          </div>
          <h3 className="text-2xl font-bold text-slate-950 dark:text-white">{task.title}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
            {task.description || 'No description.'}
          </p>
        </div>

        <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/70">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <CalendarClock className="h-4 w-4" />
            Due: {formatDateTime(task.deadline)}
          </div>
          <p className="text-slate-600 dark:text-slate-300">Type: {task.type === 'group' ? 'Group' : 'Personal'}</p>
          {task.groupName || task.teamId ? (
            <p className="text-slate-600 dark:text-slate-300">Group: {task.groupName || `Group #${task.teamId}`}</p>
          ) : null}
          {task.assignedEmails?.length ? (
            <p className="text-slate-600 dark:text-slate-300">Assigned: {task.assignedEmails.join(', ')}</p>
          ) : null}
          {task.completedBy?.length ? (
            <p className="text-slate-600 dark:text-slate-300">Completed by: {task.completedBy.join(', ')}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant={task.isCompleted ? 'secondary' : 'primary'} loading={loading} onClick={() => onToggle(task)}>
            <CheckCircle2 className="h-4 w-4" />
            {task.isCompleted ? 'Mark pending' : 'Complete'}
          </Button>
          {task.canEdit && (
            <Button variant="secondary" onClick={() => onEdit(task)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          )}
          {task.canDelete && (
            <Button variant="danger" onClick={() => onDelete(task)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
