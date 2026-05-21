import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Loader2, LogOut, X } from 'lucide-react';
import { NAV_ITEMS } from '../../constants/app.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useUiStore } from '../../store/uiStore.js';
import { cn } from '../../utils/cn.js';
import { Button } from '../ui/Button.jsx';
import { Modal } from '../ui/Modal.jsx';

export function Sidebar() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const { logout, isLoggingOut } = useAuth();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const content = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-8 flex items-center justify-between gap-3 px-2">
        <NavLink to="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
          <img src="/images/wudi_logo.png" alt="WUDI" className="h-10 object-contain" />
        </NavLink>
        <Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="grid gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition',
                isActive
                  ? 'bg-primary-light/10 text-primary-light dark:bg-primary-light/20 dark:text-primary-light'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/30 dark:hover:text-red-400 disabled:opacity-50"
        >
          {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">{content}</div>
      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/40"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative h-full">{content}</div>
        </div>
      ) : null}

      <Modal open={showLogoutConfirm} title="Log Out" onClose={() => setShowLogoutConfirm(false)} className="max-w-md">
        <div className="flex flex-col items-center pb-4 pt-2 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500">
            <LogOut className="h-7 w-7" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Are you sure you want to log out?</h3>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            You will need to sign in again to access your tasks and groups.
          </p>
          <div className="flex w-full gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowLogoutConfirm(false)}>
              No, cancel
            </Button>
            <Button variant="danger" className="flex-1" loading={isLoggingOut} onClick={handleConfirmLogout}>
              Yes, log out
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
