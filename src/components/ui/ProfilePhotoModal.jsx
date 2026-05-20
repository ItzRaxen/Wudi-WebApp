/**
 * ProfilePhotoModal – full-screen overlay to view a profile photo.
 */
import { X } from 'lucide-react';

export function ProfilePhotoModal({ open, src, name, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[80vh] max-w-[80vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
        {src ? (
          <img
            src={src}
            alt={name || 'Profile photo'}
            className="max-h-[80vh] max-w-[80vw] rounded-2xl object-contain shadow-2xl"
          />
        ) : (
          <div className="flex h-64 w-64 items-center justify-center rounded-2xl bg-slate-200 text-6xl font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
            {name ? name.slice(0, 2).toUpperCase() : '?'}
          </div>
        )}
        {name && (
          <p className="mt-3 text-center text-sm font-medium text-white drop-shadow">{name}</p>
        )}
      </div>
    </div>
  );
}
