import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { PRIORITIES, PRIORITY_LABELS } from '../../constants/app.js';
import { taskSchema } from '../../schemas/taskSchemas.js';
import { formatDateInput } from '../../utils/date.js';
import { Button } from '../ui/Button.jsx';
import { Field, Input, Select, Textarea } from '../ui/FormField.jsx';

function emailsToText(emails) {
  return (emails || []).join(', ');
}

function textToEmails(value) {
  return String(value || '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);
}

export function TaskForm({
  task,
  groups = [],
  selectedGroupId = '',
  mode = 'personal',
  onSubmit,
  onCancel,
  loading,
}) {
  const isGroupMode = mode === 'group';
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? 'medium',
      deadline: formatDateInput(task?.deadline),
      teamId: task?.teamId ?? selectedGroupId ?? '',
      assignedEmails: task?.assignedEmails ?? [],
      isCompleted: task?.isCompleted ?? false,
    },
  });

  const teamId = useWatch({ control, name: 'teamId' });
  const assignedEmails = useWatch({ control, name: 'assignedEmails' }) || [];
  const selectedGroup = groups.find((group) => String(group.id) === String(teamId));

  useEffect(() => {
    if (selectedGroupId && !task?.id) setValue('teamId', selectedGroupId);
  }, [selectedGroupId, setValue, task?.id]);

  const submit = (values) => {
    if (values.deadline) {
      const selectedDate = new Date(values.deadline);
      const now = new Date();
      // Allow if editing and the date wasn't changed
      const isUnchanged = task?.deadline && formatDateInput(task.deadline) === values.deadline;
      
      if (!isUnchanged && selectedDate < now) {
        setError('deadline', { type: 'manual', message: 'Due date cannot be in the past' });
        return;
      }
    }

    onSubmit({
      ...values,
      teamId: isGroupMode ? values.teamId : '',
      assignedEmails: isGroupMode ? values.assignedEmails : [],
    });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <Field label="Title" error={errors.title?.message}>
        <Input placeholder="Task title" {...register('title')} />
      </Field>

      <Field label="Description" error={errors.description?.message}>
        <Textarea placeholder="Task details" {...register('description')} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Priority" error={errors.priority?.message}>
          <Select {...register('priority')}>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Due date" error={errors.deadline?.message}>
          <Input type="datetime-local" {...register('deadline')} />
        </Field>
      </div>

      {isGroupMode ? (
        <>
          <Field label="Group" error={errors.teamId?.message}>
            <Select {...register('teamId')}>
              <option value="">Select group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span>Assigned members</span>
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-input-darkBg">
              {!selectedGroup?.members || selectedGroup.members.length === 0 ? (
                <p className="p-2 text-slate-500 text-sm font-normal">No members found.</p>
              ) : (
                selectedGroup.members.map((member) => (
                  <label
                    key={member.email || member.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700"
                      value={member.email}
                      checked={assignedEmails.includes(member.email)}
                      onChange={(e) => {
                        const email = member.email;
                        if (e.target.checked) {
                          setValue('assignedEmails', [...assignedEmails, email], { shouldValidate: true });
                        } else {
                          setValue(
                            'assignedEmails',
                            assignedEmails.filter((val) => val !== email),
                            { shouldValidate: true }
                          );
                        }
                      }}
                    />
                    <span className="flex flex-col">
                      <span className="text-slate-900 dark:text-slate-100">{member.name}</span>
                      {member.email ? <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{member.email}</span> : null}
                    </span>
                  </label>
                ))
              )}
            </div>
            {errors.assignedEmails?.message ? (
              <span className="text-xs font-medium text-red-600">{errors.assignedEmails.message}</span>
            ) : null}
          </div>

          <Field label="Or assign by email">
            <Input
              placeholder="member@example.com, other@example.com"
              defaultValue={emailsToText(task?.assignedEmails)}
              onBlur={(event) => {
                const typedEmails = textToEmails(event.target.value);
                if (typedEmails.length) setValue('assignedEmails', typedEmails, { shouldValidate: true });
              }}
            />
          </Field>
        </>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={loading}>
          {task?.id ? 'Save task' : 'Create task'}
        </Button>
      </div>
    </form>
  );
}
