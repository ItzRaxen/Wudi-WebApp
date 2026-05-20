import { useState } from 'react';
import { Avatar } from '../ui/Avatar.jsx';
import { ProfilePhotoModal } from '../ui/ProfilePhotoModal.jsx';

export function MemberList({ members = [] }) {
  const [viewing, setViewing] = useState(null); // { src, name }

  if (!members.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No members available.</p>;
  }
  return (
    <>
      <div className="grid gap-2">
        {members.map((member) => (
          <div
            key={member.email || member.id}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
          >
            <Avatar
              src={member.avatarUrl}
              name={member.name}
              size="sm"
              onClick={() => setViewing({ src: member.avatarUrl, name: member.name })}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{member.name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
            </div>
          </div>
        ))}
      </div>

      <ProfilePhotoModal
        open={Boolean(viewing)}
        src={viewing?.src}
        name={viewing?.name}
        onClose={() => setViewing(null)}
      />
    </>
  );
}
