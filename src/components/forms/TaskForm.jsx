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

          <Field label="Assigned members">
            <Select
              multiple
              className="h-32"
              value={assignedEmails}
              onChange={(event) => {
                const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
                setValue('assignedEmails', selected, { shouldValidate: true });
              }}
            >
              {(selectedGroup?.members || []).map((member) => (
                <option key={member.email || member.id} value={member.email}>
                  {member.name} {member.email ? `(${member.email})` : ''}
                </option>
              ))}
            </Select>
          </Field>

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
