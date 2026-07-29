'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { registerAction } from '@/app/actions/auth';
import { toast } from 'sonner';
import { IconLoader } from '@tabler/icons-react';
import { useUser } from '@/lib/auth-context';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .email('Invalid email address'),
    phone: z.string().optional().or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { refetch } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      phone: '',
    },
  });

  const onSubmit = (data: SignupFormData) => {
    startTransition(async () => {
      const result = await registerAction(data);

      if (result?.error) {
        toast.error('Registration failed', {
          description: result.error,
        });
      } else {
        toast.success('Welcome!',{
          description: 'Your account has been created successfully.',
        });
        // AuthProvider only checks auth state once on initial mount, so without
        // this, Protected still sees user:null post-signup and bounces back to /login.
        await refetch();
        router.push('/dashboard');
        router.refresh();
      }
    });
  };

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Create your account</CardTitle>
          <CardDescription>
            Enter your details below to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='name'>Full Name</FieldLabel>
                <Input
                  id='name'
                  placeholder='John Doe'
                  disabled={isPending}
                  {...register('name')}
                />
                {errors.name && (
                  <FieldError className='text-destructive'>
                    {errors.name.message}
                  </FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor='email'>Email (optional)</FieldLabel>
                <Input
                  id='email'
                  type='email'
                  placeholder='m@example.com'
                  disabled={isPending}
                  {...register('email')}
                />
                {errors.email && (
                  <FieldError className='text-destructive'>
                    {errors.email.message}
                  </FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor='phone'>Phone (optional)</FieldLabel>
                <Input
                  id='phone'
                  type='tel'
                  placeholder='+1234567890'
                  disabled={isPending}
                  {...register('phone')}
                />
              </Field>

              <Field>
                <div className='grid grid-cols-2 gap-4'>
                  <Field>
                    <FieldLabel htmlFor='password'>Password</FieldLabel>
                    <Input
                      id='password'
                      type='password'
                      disabled={isPending}
                      {...register('password')}
                    />
                    {errors.password && (
                      <FieldError className='text-destructive'>
                        {errors.password.message}
                      </FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='password_confirmation'>
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id='password_confirmation'
                      type='password'
                      disabled={isPending}
                      {...register('password_confirmation')}
                    />
                    {errors.password_confirmation && (
                      <FieldError className='text-destructive'>
                        {errors.password_confirmation.message}
                      </FieldError>
                    )}
                  </Field>
                </div>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>

              <Field>
                <Button
                  type='submit'
                  disabled={isPending}
                  className='w-full'
                >
                  {isPending ? (
                    <>
                      <IconLoader className='mr-1 animate-spin' /> Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
                <FieldDescription className='text-center'>
                  Already have an account?{' '}
                  <Link
                    href='/login'
                    className='underline'
                  >
                    Sign in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className='px-6 text-center text-sm text-muted-foreground'>
        By clicking continue, you agree to our{' '}
        <Link
          href='#'
          className='underline'
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href='#'
          className='underline'
        >
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
