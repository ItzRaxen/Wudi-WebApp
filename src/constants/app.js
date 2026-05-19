import {
  CalendarDays,
  CheckCircle2,
  Gauge,
  ListTodo,
  MessageCircle,
  Search,
  Users,
} from 'lucide-react';

export const APP_NAME = 'WUDI Web';

export const ROUTES = {
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  dashboard: '/dashboard',
  personalTasks: '/tasks/personal',
  groupTasks: '/tasks/group',
  groups: '/groups',
  today: '/today',
  search: '/search',
  calendar: '/calendar',
  chat: '/chat',
};

export const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.dashboard, icon: Gauge },
  { label: 'Personal Tasks', path: ROUTES.personalTasks, icon: ListTodo },
  { label: 'Group Tasks', path: ROUTES.groupTasks, icon: Users },
  { label: 'Groups', path: ROUTES.groups, icon: Users },
  { label: 'Today', path: ROUTES.today, icon: CheckCircle2 },
  { label: 'Search', path: ROUTES.search, icon: Search },
  { label: 'Calendar', path: ROUTES.calendar, icon: CalendarDays },
  { label: 'Chat', path: ROUTES.chat, icon: MessageCircle },
];

export const PRIORITIES = ['low', 'medium', 'high'];

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PRIORITY_STYLES = {
  high: {
    badge: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/50 dark:text-red-200 dark:ring-red-900',
    dot: 'bg-red-500',
    calendar: '#dc2626',
  },
  medium: {
    badge:
      'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-900',
    dot: 'bg-amber-500',
    calendar: '#d97706',
  },
  low: {
    badge:
      'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-900',
    dot: 'bg-emerald-500',
    calendar: '#059669',
  },
};

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All priority' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const REFETCH_INTERVAL_MS = 3000;
