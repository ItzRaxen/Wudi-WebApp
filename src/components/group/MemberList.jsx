import { UserRound } from 'lucide-react';

export function MemberList({ members = [] }) {
  if (!members.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No members available.</p>;
  }
  return (
    <div className="grid gap-2">
      {members.map((member) => (
        <div
          key={member.email || member.id}
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <UserRound className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{member.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
