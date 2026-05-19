import { PRIORITY_LABELS, PRIORITY_STYLES } from '../../constants/app.js';
import { cn } from '../../utils/cn.js';

export function PriorityBadge({ priority }) {
  const key = priority || 'medium';
  
  const renderIcon = () => {
    if (key === 'high') {
      return <img src="/images/icon high priority.png" alt="High" className="h-3 w-3 object-contain" />;
    }
    if (key === 'low') {
      return <img src="/images/lowprio.png" alt="Low" className="h-3 w-3 object-contain" />;
    }
    return <span className={cn('h-1.5 w-1.5 rounded-full', PRIORITY_STYLES[key]?.dot)} />;
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1',
        PRIORITY_STYLES[key]?.badge,
      )}
    >
      {renderIcon()}
      {PRIORITY_LABELS[key] ?? key}
    </span>
  );
}

export function StatusBadge({ completed }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1',
        completed
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-900'
          : 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:ring-blue-900',
      )}
    >
      {completed ? 'Completed' : 'Pending'}
    </span>
  );
}

export function TypeBadge({ type }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1',
        type === 'group'
          ? 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-200 dark:ring-violet-900'
          : 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:ring-blue-900',
      )}
    >
      {type === 'group' ? 'Group' : 'Personal'}
    </span>
  );
}
