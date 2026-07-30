'use client';

import {
  IconDotsVertical,
  IconIdBadge2,
  IconUserCircle,
} from '@tabler/icons-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import LogoutButton from './logout-button';

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
};

export function NavUser({ user }: { user: CurrentUser | null }) {
  if (!user) {
    return (
      <div className='rounded-xl border bg-card p-3 shadow-2xs flex items-center gap-3'>
        <Avatar className='h-9 w-9 rounded-full'>
          <AvatarFallback className='text-xs rounded-full'>?</AvatarFallback>
        </Avatar>
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-medium text-muted-foreground'>
            Guest
          </span>
        </div>
      </div>
    );
  }

  const displayName = user.name || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='rounded-xl border bg-card hover:bg-card/90 p-3 shadow-2xs transition-all group relative cursor-pointer'>
          <div className='flex items-center justify-between gap-3'>
            {/* Profile Card — clicking anywhere opens the dropdown */}
            <div className='flex items-center gap-3 flex-1 min-w-0'>
              <Avatar className='h-10 w-10 rounded-full border shrink-0'>
                <AvatarImage src={user.avatar_url || undefined} alt={displayName} />
                <AvatarFallback className='rounded-full text-xs font-bold bg-primary/10 text-primary'>
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className='grid flex-1 text-left leading-tight min-w-0'>
                <div className='flex items-center gap-1.5 min-w-0'>
                  <span className='truncate font-semibold text-sm text-foreground group-hover:text-primary transition-colors'>
                    {displayName}
                  </span>
                  <IconIdBadge2 className='h-3.5 w-3.5 text-primary shrink-0' />
                </div>
                <span className='truncate text-xs text-muted-foreground mt-0.5'>
                  {user.email}
                </span>
              </div>
            </div>

            <IconDotsVertical className='h-4 w-4 text-muted-foreground shrink-0' />
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='w-56 rounded-xl shadow-lg'
        align='end'
        sideOffset={8}
      >
        <DropdownMenuLabel className='font-normal p-2'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-semibold leading-none'>
              {displayName}
            </p>
            <p className='text-xs text-muted-foreground leading-none'>
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild className='cursor-pointer'>
            <Link href='/dashboard/passport'>
              <IconIdBadge2 className='mr-2 h-4 w-4 text-primary' />
              Financial Passport
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className='cursor-pointer'>
            <IconUserCircle className='mr-2 h-4 w-4' />
            Account Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className='cursor-pointer text-destructive focus:text-destructive'>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
