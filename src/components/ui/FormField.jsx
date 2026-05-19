import { cn } from '../../utils/cn.js';

export function Field({ label, error, children, className }) {
  return (
    <label className={cn('grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-200', className)}>
      {label ? <span>{label}</span> : null}
      {children}
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-input-darkBg dark:text-slate-100 dark:focus:ring-primary/50',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-input-darkBg dark:text-slate-100 dark:focus:ring-primary/50',
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-input-darkBg dark:text-slate-100 dark:focus:ring-primary/50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
