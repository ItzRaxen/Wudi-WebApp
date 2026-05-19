import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

export function CalendarBoard({ events, onEventClick }) {
  const renderEventContent = (eventInfo) => {
    const task = eventInfo.event.extendedProps.task;
    const isCompleted = task?.isCompleted;
    
    return (
      <div className="flex w-full items-center gap-1.5 overflow-hidden rounded px-1 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800">
        <div 
          className="h-2 w-2 flex-shrink-0 rounded-full" 
          style={{ backgroundColor: eventInfo.event.textColor }} 
        />
        <span className={`truncate text-xs font-semibold ${isCompleted ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
          {eventInfo.event.title}
        </span>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        height="auto"
        events={events}
        eventContent={renderEventContent}
        eventClick={(info) => onEventClick?.(info.event.extendedProps.task)}
        nowIndicator
      />
    </div>
  );
}
