import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { groupSchema } from '../../schemas/groupSchemas.js';
import { Avatar } from '../ui/Avatar.jsx';
import { Button } from '../ui/Button.jsx';
import { Field, Input, Textarea } from '../ui/FormField.jsx';

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

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

  const fileRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(group?.avatarUrl ?? null);
  const [avatarError, setAvatarError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_BYTES) {
      setAvatarError('File size exceeds 2 MB. Please choose a smaller image.');
      return;
    }
    setAvatarError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(group?.avatarUrl ?? null);
    setAvatarError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = (values) => {
    onSubmit({
      ...values,
      memberEmails: parseEmails(values.memberEmailsText),
      avatarFile: avatarFile || null,
    });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      {/* Avatar picker */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <Avatar src={avatarPreview} name={group?.name || 'Group'} size="xl" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md transition hover:bg-primary-dark"
            title="Upload group photo"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          {avatarFile && (
            <button
              type="button"
              onClick={clearAvatar}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
              title="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Group photo (max 2 MB)
        </p>
        {avatarError && (
          <p className="text-xs text-red-600 dark:text-red-400">{avatarError}</p>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

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
