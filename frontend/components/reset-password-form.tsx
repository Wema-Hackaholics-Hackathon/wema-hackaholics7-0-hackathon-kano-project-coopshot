'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTransition, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
import { IconLoader, IconRefresh, IconSend, IconUsersGroup } from '@tabler/icons-react';
import { InputOTPField } from '@/components/input-otp'; // assuming you have this component
import { resetPasswordAction, resendOtpAction } from '@/app/actions/auth';
import { toast } from 'sonner';

const resetSchema = z
  .object({
    email: z.string().email(),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromParams = searchParams.get('email') || '';

  const [countdown, setCountdown] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: emailFromParams,
      otp: '',
      password: '',
      password_confirmation: '',
    },
  });

  // Watch OTP value to pass to InputOTPField if needed
  const otpValue = watch('otp');

  const onSubmit = (data: ResetFormData) => {
    startTransition(async () => {
      const result = await resetPasswordAction(data);

      if (result?.error) {
        toast.error('Reset failed', {
          description: result.error,
        });
      } else {
        toast.success('Password Reset!', {
          description: "Your password has been reset. You're now logged in.",
        });

        router.push('/dashboard');
        router.refresh(); // Refresh to update auth state
      }
    });
  };

  useEffect(() => {
    // Start countdown automatically when page loads (fresh OTP just sent)
    setCountdown(60);
  }, []); // Only on mount

  // Add this useEffect for the timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Update handleResend to start countdown
  const handleResend = () => {
    startResendTransition(async () => {
      const result = await resendOtpAction({ email: emailFromParams });

      if (result?.error) {
        toast.error('Failed to resend', {
          description: result.error,
        });
      } else {
        toast.success('OTP Resent!', {
          description: 'A new OTP has been sent to your email.',
        });
        // Start 60-second countdown
        setCountdown(60);
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
            <h1 className='text-xl font-bold'>Input OTP sent to your email.</h1>
            <FieldDescription>
              An OTP has been sent to <strong>{emailFromParams}</strong>
            </FieldDescription>
          </div>

          <Field>
            <FieldLabel>OTP Code</FieldLabel>
            <InputOTPField
              value={otpValue}
              onChange={(value) => setValue('otp', value)}
              disabled={isPending}
            />
            {errors.otp && <FieldError>{errors.otp.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor='password'>New Password</FieldLabel>
            <Input
              id='password'
              type='password'
              placeholder='••••••••'
              disabled={isPending}
              {...register('password')}
            />
            {errors.password && (
              <FieldError>{errors.password.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='password_confirmation'>
              Confirm Password
            </FieldLabel>
            <Input
              id='password_confirmation'
              type='password'
              placeholder='••••••••'
              disabled={isPending}
              {...register('password_confirmation')}
            />
            {errors.password_confirmation && (
              <FieldError>
                {errors.password_confirmation.message}
              </FieldError>
            )}
          </Field>

          {/* Hidden email field */}
          <input
            type='hidden'
            {...register('email')}
          />

          <Field>
            <Button
              type='submit'
              disabled={isPending}
              className='w-full'
            >
              {isPending ? (
                <>
                  <IconLoader className='mr-1 animate-spin' /> Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </Field>

          <FieldSeparator>Or</FieldSeparator>

          <Field>
            <Button
              variant='outline'
              type='button'
              onClick={handleResend}
              disabled={isResending || countdown > 0}
              className='w-full'
            >
              <IconRefresh className='size-4 mr-2' />
              {isResending ? (
                <>
                  <IconLoader className='mr-1 animate-spin' /> Sending...
                </>
              ) : countdown > 0 ? (
                `Resend OTP in ${countdown}s`
              ) : (
                'Resend OTP'
              )}
            </Button>
            {countdown === 0 && (
              <FieldDescription className='text-center text-sm text-muted-foreground'>
                Didn&apos;t receive the code?
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
