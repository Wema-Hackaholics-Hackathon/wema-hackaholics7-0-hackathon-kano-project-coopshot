'use client';

import * as React from 'react';
import {
  IconBellCheck,
  IconBuildingCommunity,
  IconDashboard,
  IconHelp,
  IconInnerShadowTop,
  IconMail,
  IconMailBolt,
  IconMoneybag,
  IconSearch,
  IconSettings,
  IconIdBadge2,
  IconShoppingBag,
  type Icon,
} from '@tabler/icons-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { QuickCreateSociety } from './quick-create-society';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavUserWrapper } from './nav-user-wrapper';

export interface NavGroupItem {
  title: string;
  url: string;
  icon: Icon;
}

export interface NavCardGroup {
  id: string;
  title: string;
  items: NavGroupItem[];
}

const navGroups: NavCardGroup[] = [
  {
    id: 'main',
    title: 'Main Platform',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: IconDashboard,
      },
      {
        title: 'My Societies',
        url: '/dashboard/societies',
        icon: IconBuildingCommunity,
      },
      {
        title: 'Invites',
        url: '/dashboard/invites',
        icon: IconMailBolt,
      },
    ],
  },
  {
    id: 'financial',
    title: 'Trust & Access',
    items: [
      {
        title: 'Financial Passport',
        url: '/dashboard/passport',
        icon: IconIdBadge2,
      },
      {
        title: 'Opportunities',
        url: '/dashboard/opportunities',
        icon: IconShoppingBag,
      },
      {
        title: 'Payouts',
        url: '#',
        icon: IconMoneybag,
      },
    ],
  },
  {
    id: 'utilities',
    title: 'Utilities & Help',
    items: [
      {
        title: 'Reminders',
        url: '#',
        icon: IconBellCheck,
      },
      {
        title: 'Settings',
        url: '#',
        icon: IconSettings,
      },
      {
        title: 'Get Help',
        url: '#',
        icon: IconHelp,
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible='offExamples' {...props}>
      {/* Sidebar Header */}
      <SidebarHeader className='pb-2'>
        <SidebarMenu>
          <SidebarMenuItem className='flex items-center justify-between gap-2'>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:p-1.5!'
            >
              <Link href='/dashboard'>
                <IconInnerShadowTop className='size-5!' />
                <span className='text-base font-semibold tracking-tight'>
                  CoopShot
                </span>
              </Link>
            </SidebarMenuButton>

            <Button
              size='icon'
              className='size-8 shrink-0'
              variant='outline'
            >
              <IconMail className='h-4 w-4' />
              <span className='sr-only'>Inbox</span>
            </Button>
          </SidebarMenuItem>

          {/* Quick Create Action */}
          <SidebarMenuItem className='mt-2'>
            <QuickCreateSociety from='sidebar' />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Content - 3 Card Groups */}
      <SidebarContent className='px-2 py-2 space-y-3'>
        {navGroups.map((group) => (
          <div
            key={group.id}
            className='rounded-xl border bg-card/60 p-2 shadow-2xs space-y-1'
          >
            <div className='px-2.5 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
              {group.title}
            </div>

            <SidebarGroup className='p-0'>
              <SidebarGroupContent>
                <SidebarMenu className='space-y-0.5'>
                  {group.items.map((item) => {
                    const isLinkActive =
                      item.url === '/dashboard'
                        ? pathname === '/dashboard'
                        : item.url !== '#' &&
                          (pathname === item.url ||
                            pathname.startsWith(item.url + '/'));

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          isActive={isLinkActive}
                          className={`cursor-pointer transition-all text-sm ${
                            isLinkActive
                              ? 'bg-primary/10! text-primary! font-semibold border-l-3 border-primary rounded-r-md rounded-l-none pl-2.5 shadow-2xs dark:bg-primary/15!'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md'
                          }`}
                        >
                          <Link href={item.url} className='flex items-center gap-2.5 w-full'>
                            <item.icon
                              className={`h-4 w-4 shrink-0 ${
                                isLinkActive ? 'text-primary!' : 'text-muted-foreground'
                              }`}
                            />
                            <span className={isLinkActive ? 'text-primary! font-semibold' : ''}>
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        ))}
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className='pt-2'>
        <NavUserWrapper />
      </SidebarFooter>
    </Sidebar>
  );
}
