import { Pencil, Trash2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar.jsx';
import { Button } from '../ui/Button.jsx';

export function GroupCard({ group, onOpen, onEdit, onDelete }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <button className="block w-full text-left" onClick={() => onOpen?.(group)}>
        <div className="flex items-start gap-3">
          <Avatar src={group.avatarUrl} name={group.name} size="md" className="mt-0.5 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-slate-950 dark:text-white">{group.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {group.description || 'No description.'}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>{group.members?.length || 0} members</span>
          <span>Max {group.maxMembers}</span>
        </div>
      </button>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" size="icon" onClick={() => onEdit?.(group)} aria-label="Edit group">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={() => onDelete?.(group)} aria-label="Delete group">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}
