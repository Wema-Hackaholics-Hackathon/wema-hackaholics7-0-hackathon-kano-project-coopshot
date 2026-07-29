'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { IconLoader, IconLogin2, IconUsersGroup } from '@tabler/icons-react';
import { forgotPasswordAction } from '@/app/actions/auth';
import { toast } from 'sonner';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = (data: ForgotFormData) => {
    startTransition(async () => {
      const result = await forgotPasswordAction(data);

      if (result?.error) {
        toast.error('Error sending OTP', {
          description: result.error,
        });
      } else {
        toast.success('OTP Sent!', {
          description: 'Check your email for the 6-digit code.',
        });
        // Redirect to OTP reset page, passing email
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
      }
    });
  };

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className='flex flex-col items-center gap-2 text-center'>
            <Link
              href='/'
              className='flex flex-col items-center gap-2 font-medium'
            >
              <div className='flex size-8 items-center justify-center rounded-md'>
                <IconUsersGroup className='size-6' />
              </div>
              <span className='sr-only'>CoopShot</span>
            </Link>
            <h1 className='text-xl font-bold'>Input your email to CoopShot.</h1>
            <FieldDescription>
              Forgot your password? Don&apos;t fret!
            </FieldDescription>
          </div>

          <Field>
            <FieldLabel htmlFor='email'>Email</FieldLabel>
            <Input
              id='email'
              type='email'
              placeholder='m@example.com'
              disabled={isPending}
              {...register('email')}
            />
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>

          <Field>
            <Button
              type='submit'
              disabled={isPending}
              className='w-full'
            >
              {isPending ? (
                <>
                  <IconLoader className='mr-1 animate-spin' />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </Field>

          <FieldSeparator>Or</FieldSeparator>

          <Field>
            <Button
              variant='outline'
              asChild
              type='button'
              className='w-full'
            >
              <Link href='/login'>
                <IconLogin2 className='size-4 mr-2' />
                Sign in instead
              </Link>
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
