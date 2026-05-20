import { Check, UserPlus, X } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function InvitationCard({ invitation, onAccept, onDecline, loading }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Icon */}
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary-light/20 dark:text-slate-200">
        <UserPlus className="h-5 w-5" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900 dark:text-white">
          {invitation.name}
        </p>
        {invitation.description ? (
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {invitation.description}
          </p>
        ) : null}
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
          Invited by <span className="font-medium text-slate-600 dark:text-slate-300">{invitation.inviterName}</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => onDecline(invitation.id)}
          disabled={loading}
          title="Decline"
          className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-slate-300 bg-transparent text-slate-500 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:border-slate-600 dark:text-slate-400 dark:hover:border-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          <X className="h-4 w-4" />
        </button>
        <button
          onClick={() => onAccept(invitation.id)}
          disabled={loading}
          title="Accept"
          className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-primary bg-primary text-white transition-colors hover:bg-primary-dark disabled:opacity-50 dark:border-primary-light dark:bg-primary-light"
        >
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
