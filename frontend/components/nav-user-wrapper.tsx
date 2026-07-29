// components/nav-user-wrapper.tsx
'use client';

import { useEffect, useState } from 'react';
import { NavUser } from '@/components/nav-user';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentUser } from '@/app/actions/getCurrentUser';

export function NavUserWrapper() {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    avatar_url?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    }
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center gap-3 p-3'>
        <Skeleton className='h-8 w-8 rounded-lg' />
        <div className='grid gap-1'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-3 w-40' />
        </div>
      </div>
    );
  }

  return <NavUser user={user} />;
}
