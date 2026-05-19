import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedLayout } from '../components/layout/ProtectedLayout.jsx';
import { RouteLoader } from '../components/ui/RouteLoader.jsx';
import { ROUTES } from '../constants/app.js';

const LoginPage = lazy(() => import('../pages/auth/LoginPage.jsx').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() =>
  import('../pages/auth/RegisterPage.jsx').then((module) => ({ default: module.RegisterPage })),
);
const VerifyEmailPage = lazy(() =>
  import('../pages/auth/VerifyEmailPage.jsx').then((module) => ({ default: module.VerifyEmailPage })),
);
const DashboardPage = lazy(() =>
  import('../pages/dashboard/DashboardPage.jsx').then((module) => ({ default: module.DashboardPage })),
);
const PersonalTasksPage = lazy(() =>
  import('../pages/personal-tasks/PersonalTasksPage.jsx').then((module) => ({ default: module.PersonalTasksPage })),
);
const GroupTasksPage = lazy(() =>
  import('../pages/group-tasks/GroupTasksPage.jsx').then((module) => ({ default: module.GroupTasksPage })),
);
const GroupsPage = lazy(() => import('../pages/groups/GroupsPage.jsx').then((module) => ({ default: module.GroupsPage })));
const TodayPage = lazy(() => import('../pages/today/TodayPage.jsx').then((module) => ({ default: module.TodayPage })));
const SearchPage = lazy(() => import('../pages/search/SearchPage.jsx').then((module) => ({ default: module.SearchPage })));
const CalendarPage = lazy(() =>
  import('../pages/calendar/CalendarPage.jsx').then((module) => ({ default: module.CalendarPage })),
);
const ChatPage = lazy(() =>
  import('../pages/chat/ChatPage.jsx').then((module) => ({ default: module.ChatPage })),
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={ROUTES.dashboard} replace />,
  },
  {
    path: ROUTES.login,
    element: (
      <RouteLoader>
        <LoginPage />
      </RouteLoader>
    ),
  },
  {
    path: ROUTES.register,
    element: (
      <RouteLoader>
        <RegisterPage />
      </RouteLoader>
    ),
  },
  {
    path: ROUTES.verifyEmail,
    element: (
      <RouteLoader>
        <VerifyEmailPage />
      </RouteLoader>
    ),
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: ROUTES.dashboard,
        element: (
          <RouteLoader>
            <DashboardPage />
          </RouteLoader>
        ),
      },
      {
        path: ROUTES.personalTasks,
        element: (
          <RouteLoader>
            <PersonalTasksPage />
          </RouteLoader>
        ),
      },
      {
        path: ROUTES.groupTasks,
        element: (
          <RouteLoader>
            <GroupTasksPage />
          </RouteLoader>
        ),
      },
      {
        path: ROUTES.groups,
        element: (
          <RouteLoader>
            <GroupsPage />
          </RouteLoader>
        ),
      },
      {
        path: ROUTES.today,
        element: (
          <RouteLoader>
            <TodayPage />
          </RouteLoader>
        ),
      },
      {
        path: ROUTES.search,
        element: (
          <RouteLoader>
            <SearchPage />
          </RouteLoader>
        ),
      },
      {
        path: ROUTES.calendar,
        element: (
          <RouteLoader>
            <CalendarPage />
          </RouteLoader>
        ),
      },
      {
        path: ROUTES.chat,
        element: (
          <RouteLoader>
            <ChatPage />
          </RouteLoader>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.dashboard} replace />,
  },
]);
