// components/paystack-pay-button.tsx
'use client';

import { useState } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { IconCreditCard, IconLoader } from '@tabler/icons-react';
import { toast } from 'sonner';
import { initiatePaystackPayment, verifyPaystackPayment } from '@/app/actions/contribution';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}

interface PaystackPayButtonProps {
  groupId: string;
  type: 'registration' | 'equity' | 'monthly';
  label?: string;
  onSuccess?: () => void;
}

// Real Paystack Inline (embedded popup, no page redirect). This backend
// already builds the pending Contribution row + reference server-side via
// initiatePaystackPayment — Inline just charges against that same reference,
// then verifyPaystackPayment reconciles the result server-side afterward.
export function PaystackPayButton({ groupId, type, label, onSuccess }: PaystackPayButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!window.PaystackPop) {
      toast.error('Payment system is still loading — try again in a moment.');
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      toast.error('Payment is not configured (missing Paystack public key).');
      return;
    }

    setLoading(true);
    try {
      const { reference, amountInKobo, email } = await initiatePaystackPayment(groupId, type);

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount: amountInKobo,
        ref: reference,
        onClose: () => setLoading(false),
        callback: (response) => {
          verifyPaystackPayment(response.reference)
            .then((result) => {
              if (result.status === 'success') {
                toast.success('Payment successful!', {
                  description: `₦${result.amount.toLocaleString()} confirmed.`,
                });
                onSuccess?.();
              } else {
                toast.error('Payment could not be confirmed', {
                  description: "If you were charged, it will reconcile shortly via Paystack's webhook.",
                });
              }
            })
            .catch((err: Error) => toast.error(err.message || 'Failed to verify payment'))
            .finally(() => setLoading(false));
        },
      });
      handler.openIframe();
    } catch (err: any) {
      toast.error(err.message || 'Failed to start payment');
      setLoading(false);
    }
  };

  return (
    <>
      <Script src='https://js.paystack.co/v1/inline.js' strategy='lazyOnload' />
      <Button onClick={handlePay} disabled={loading} className='cursor-pointer font-semibold'>
        {loading ? (
          <>
            <IconLoader className='mr-2 h-4 w-4 animate-spin' /> Processing...
          </>
        ) : (
          <>
            <IconCreditCard className='mr-2 h-4 w-4' /> {label || 'Pay with Card (Paystack)'}
          </>
        )}
      </Button>
    </>
  );
}
