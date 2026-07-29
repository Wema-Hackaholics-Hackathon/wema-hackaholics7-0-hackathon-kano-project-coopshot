'use client';

import * as React from 'react';
import { type Icon } from '@tabler/icons-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: Icon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu className='flex flex-col space-y-2'>
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
                  <item.icon />
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
