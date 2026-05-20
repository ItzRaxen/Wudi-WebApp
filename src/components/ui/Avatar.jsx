/**
 * Universal Avatar component.
 * Shows avatarUrl if provided, falls back to initials or generic icon.
 */
import { User } from 'lucide-react';
import { cn } from '../../utils/cn.js';

function getInitials(name) {
  if (!name) return null;
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export function Avatar({
  src,
  name,
  size = 'md',
  className,
  onClick,
}) {
  const sizes = {
    xs: 'h-7 w-7 text-[10px]',
    sm: 'h-9 w-9 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-20 w-20 text-2xl',
  };

  const initials = getInitials(name);
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
        sizes[size],
        onClick && 'cursor-pointer transition hover:opacity-80 focus:outline-none',
        className,
      )}
      {...(onClick ? { type: 'button', title: name || 'View profile' } : {})}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="h-full w-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
        />
      ) : null}
      <span
        className={cn(
          'flex h-full w-full items-center justify-center font-semibold text-slate-600 dark:text-slate-300',
          src ? 'hidden' : 'flex',
        )}
      >
        {initials ? initials : <User className="h-[45%] w-[45%]" />}
      </span>
    </Tag>
  );
}
