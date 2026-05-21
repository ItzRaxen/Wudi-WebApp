import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

export function CalendarBoard({ events, onEventClick }) {
  const renderEventContent = (eventInfo) => {
    const task = eventInfo.event.extendedProps.task;
    const isCompleted = task?.isCompleted;
    
    return (
      <div className="flex w-full items-center gap-1.5 overflow-hidden rounded px-1.5 py-0.5 bg-[#E2E2E2] hover:bg-[#D4D4D4] dark:bg-slate-800 dark:hover:bg-slate-700">
        <div 
          className="h-2 w-2 flex-shrink-0 rounded-full" 
          style={{ backgroundColor: eventInfo.event.textColor || '#ef4444' }} 
        />
        <span className={`truncate text-[10px] font-bold ${isCompleted ? 'text-slate-400 line-through dark:text-slate-500' : 'text-[#1B1123] dark:text-slate-200'}`}>
          {eventInfo.event.title}
        </span>
      </div>
    );
  };

  return (
    <div className="rounded-[2rem] border border-[#EAE0D5] bg-[#FCFAF7] p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
