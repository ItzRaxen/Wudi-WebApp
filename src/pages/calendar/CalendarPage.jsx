import { CalendarBoard } from '../../components/calendar/CalendarBoard.jsx';
import { TaskMutationModals } from '../../components/task/TaskMutationModals.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { ListSkeleton } from '../../components/ui/Skeleton.jsx';
import { useCalendarEvents } from '../../hooks/useCalendar.js';
import { useTaskModals } from '../../hooks/useTaskModals.js';

export function CalendarPage() {
  const modals = useTaskModals();
  const { data: events = [], isLoading } = useCalendarEvents();

  return (
    <>
      <PageHeader title="Calendar" description="Month, week, and day view for all personal and group tasks." />
      {isLoading ? <ListSkeleton count={2} /> : <CalendarBoard events={events} onEventClick={modals.openDetail} />}
      <TaskMutationModals state={modals} />
    </>
  );
}
