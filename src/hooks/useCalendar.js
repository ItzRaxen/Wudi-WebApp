import { useQuery } from '@tanstack/react-query';
import { REFETCH_INTERVAL_MS } from '../constants/app.js';
import { calendarService } from '../services/calendarService.js';
import { useGroups } from './useGroups.js';

export function useCalendarEvents() {
  const { data: groups = [] } = useGroups();
  return useQuery({
    queryKey: ['calendar-events', groups.length],
    queryFn: () => calendarService.getCalendarEvents(groups),
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}
