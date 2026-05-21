import { Camera, Loader2, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useUiStore } from '../../store/uiStore.js';
import { Avatar } from '../ui/Avatar.jsx';
import { Button } from '../ui/Button.jsx';
import { ProfilePhotoModal } from '../ui/ProfilePhotoModal.jsx';

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export function Navbar() {
  const { user, logout, isLoggingOut, uploadAvatar, isUploadingAvatar } = useAuth();
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const darkMode = useUiStore((state) => state.darkMode);
  const toggleDarkMode = useUiStore((state) => state.toggleDarkMode);

  const [viewingPhoto, setViewingPhoto] = useState(false);
  const [hoveringAvatar, setHoveringAvatar] = useState(false);
  const fileRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_BYTES) {
      // Use dynamic toast import to avoid circular dep
      const toast = (await import('react-hot-toast')).default;
      toast.error('File is too large. Maximum size is 2 MB.');
      return;
    }
    await uploadAvatar(file).catch(() => null);
    // reset so same file can be re-selected
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/85 px-4 py-3 backdrop-blur md:px-6 dark:border-slate-800 dark:bg-slate-900/85">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            {/* Avatar with change-photo affordance on hover */}
            <div
              className="relative shrink-0"
              onMouseEnter={() => setHoveringAvatar(true)}
              onMouseLeave={() => setHoveringAvatar(false)}
            >
              {/* View full photo on click */}
              <Avatar
                src={user?.avatarUrl}
                name={user?.name || user?.email}
                size="sm"
                onClick={user?.avatarUrl ? () => setViewingPhoto(true) : undefined}
              />

              {/* Upload spinner overlay while uploading */}
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
              )}

              {/* Camera button on hover (not uploading) */}
              {!isUploadingAvatar && hoveringAvatar && (
                <button
                  type="button"
                  title="Change profile photo"
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 transition-opacity"
                >
                  <Camera className="h-3.5 w-3.5 text-white" />
                </button>
              )}

              {/* Hidden file input */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.gif"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-950 dark:text-white">
                {user?.name || user?.email || 'WUDI User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" onClick={toggleDarkMode} aria-label="Toggle dark mode">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Full-screen photo viewer */}
      <ProfilePhotoModal
        open={viewingPhoto}
        src={user?.avatarUrl}
        name={user?.name || user?.email}
        onClose={() => setViewingPhoto(false)}
      />
    </>
  );
}
