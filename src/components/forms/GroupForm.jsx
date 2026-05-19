import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { groupSchema } from '../../schemas/groupSchemas.js';
import { Button } from '../ui/Button.jsx';
import { Field, Input, Textarea } from '../ui/FormField.jsx';

function parseEmails(value) {
  return String(value || '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);
}

export function GroupForm({ group, onSubmit, onCancel, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: group?.name ?? '',
      description: group?.description ?? '',
      maxMembers: group?.maxMembers ?? 100,
      memberEmailsText: '',
    },
  });

  const submit = (values) => {
    onSubmit({
      ...values,
      memberEmails: parseEmails(values.memberEmailsText),
    });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <Field label="Group name" error={errors.name?.message}>
        <Input placeholder="Design Team" {...register('name')} />
      </Field>

      <Field label="Description" error={errors.description?.message}>
        <Textarea placeholder="What this group works on" {...register('description')} />
      </Field>

      <Field label="Max members" error={errors.maxMembers?.message}>
        <Input type="number" min="2" max="100" {...register('maxMembers')} />
      </Field>

      {!group?.id ? (
        <Field label="Invite members by email">
          <Input placeholder="member@example.com, other@example.com" {...register('memberEmailsText')} />
        </Field>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={loading}>
          {group?.id ? 'Save group' : 'Create group'}
        </Button>
      </div>
    </form>
  );
}
