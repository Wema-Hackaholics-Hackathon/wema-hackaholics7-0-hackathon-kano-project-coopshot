'use client';

import {
  IconCirclePlusFilled,
  IconDashboard,
  IconMail,
  type Icon,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { QuickCreateSociety } from './quick-create-society';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className='flex flex-col gap-2'>
        <SidebarMenu>
          <SidebarMenuItem className='flex items-center gap-2'>
            <QuickCreateSociety from='sidebar' />
            <Button
              size='icon'
              className='size-8 group-data-[collapsible=icon]:opacity-0'
              variant='outline'
            >
              <IconMail />
              <span className='sr-only'>Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu className='flex flex-col space-y-2 mt-2'>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={'Dashboard'}
              className={
                pathname === '/dashboard'
                  ? 'hover:bg-primary'
                  : 'hover:bg-sidebar-border hover:text-foreground'
              }
              isActive={pathname === '/dashboard'}
            >
              <Link href={'/dashboard'}>
                <IconDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={
                  pathname === item.url || pathname.startsWith(item.url + '/')
                    ? 'hover:bg-primary'
                    : 'hover:bg-sidebar-border hover:text-foreground'
                }
                isActive={
                  pathname === item.url || pathname.startsWith(item.url + '/')
                }
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
