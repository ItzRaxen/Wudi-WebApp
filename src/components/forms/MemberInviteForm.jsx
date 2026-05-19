import { useState } from 'react';
import { Button } from '../ui/Button.jsx';
import { Field, Input } from '../ui/FormField.jsx';

export function MemberInviteForm({ onSubmit, loading }) {
  const [email, setEmail] = useState('');

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        if (!email.trim()) return;
        onSubmit(email.trim()).then(() => setEmail(''));
      }}
    >
      <Field label="Invite member" className="flex-1">
        <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="member@example.com" />
      </Field>
      <Button type="submit" loading={loading}>
        Invite
      </Button>
    </form>
  );
}
