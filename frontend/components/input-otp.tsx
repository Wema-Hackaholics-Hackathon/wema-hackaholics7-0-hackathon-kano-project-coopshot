'use client';

import { REGEXP_ONLY_DIGITS } from 'input-otp'; // changed to digits only (safer for OTP)
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';

interface InputOTPFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function InputOTPField({
  value,
  onChange,
  disabled = false,
}: InputOTPFieldProps) {
  return (
    <InputOTP
      maxLength={6} 
      pattern={REGEXP_ONLY_DIGITS} // only numbers allowed
      value={value}
      onChange={onChange}
      disabled={disabled}
      className='w-full'
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}
