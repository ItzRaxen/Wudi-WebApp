import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { ROUTES } from '../../constants/app.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Skeleton } from '../ui/Skeleton.jsx';

export function ProtectedLayout() {
  const location = useLocation();
  const { isAuthenticated, initialized } = useAuth();

  if (!initialized) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-6 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-40" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  const isChat = location.pathname.startsWith(ROUTES.chat);

  return (
    <div className={isChat ? "h-screen overflow-hidden bg-slate-50 dark:bg-slate-950" : "min-h-screen bg-slate-50 dark:bg-slate-950"}>
      <Sidebar />
      <div className={`flex flex-col lg:pl-72 ${isChat ? "h-screen" : "min-h-screen"}`}>
        <Navbar />
        <main className={isChat ? "flex-1 overflow-hidden w-full" : "mx-auto w-full max-w-7xl px-4 py-6 md:px-6"}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
