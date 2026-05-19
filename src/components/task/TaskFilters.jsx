import { Search } from 'lucide-react';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../../constants/app.js';
import { Input, Select } from '../ui/FormField.jsx';

export function TaskFilters({ filters, onChange, placeholder = 'Search tasks' }) {
  return (
    <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-[1fr_180px_180px] dark:border-slate-800 dark:bg-slate-900">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder={placeholder}
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
        />
      </div>
      <Select value={filters.status} onChange={(event) => onChange({ status: event.target.value })}>
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Select value={filters.priority} onChange={(event) => onChange({ priority: event.target.value })}>
        {PRIORITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
