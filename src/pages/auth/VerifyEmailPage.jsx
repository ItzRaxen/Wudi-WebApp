import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/app.js';
import { useAuth } from '../../hooks/useAuth.js';
import { verifyEmailSchema } from '../../schemas/authSchemas.js';
import { Button } from '../../components/ui/Button.jsx';
import { Field, Input } from '../../components/ui/FormField.jsx';

export function VerifyEmailPage() {
  const { verifyEmail, isVerifyingEmail, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { code: '' },
  });

  if (isAuthenticated) return <Navigate to={ROUTES.dashboard} replace />;
  if (!email) return <Navigate to={ROUTES.register} replace />;

  const submit = async (values) => {
    await verifyEmail({ email, code: values.code });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light/10 text-primary-light dark:bg-primary-light/20 dark:text-primary-light">
            <MailCheck className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white">Verify Email</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            We sent a verification code to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>.
            Please enter it below.
          </p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
          <Field label="Verification Code" error={errors.code?.message}>
            <Input autoFocus autoComplete="off" placeholder="Enter code" {...register('code')} />
          </Field>
          
          <Button type="submit" loading={isVerifyingEmail} className="w-full">
            Verify Email
          </Button>
        </form>
      </div>
    </div>
  );
}
