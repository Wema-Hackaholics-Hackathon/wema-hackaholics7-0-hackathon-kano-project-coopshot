'use client';

import { useFormStatus } from 'react-dom';
import { logoutAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { IconLogout } from '@tabler/icons-react';

function LogoutButton() {
  const { pending } = useFormStatus();

  const actionWithToast = async () => {
    alert('Logout button rendered');
    toast('Logging out...', {
      description: 'You are being signed out securely.',
    });

    // Trigger the actual logout
    await logoutAction();
  };

  return (
      <DropdownMenuItem onClick={logoutAction}>
        <IconLogout />
        {/* {pending ? 'Logging out...' : 'Logout'} */}
        Logout
      </DropdownMenuItem>
    // <form action={actionWithToast}>
    // </form>
  );
}

export default LogoutButton;
