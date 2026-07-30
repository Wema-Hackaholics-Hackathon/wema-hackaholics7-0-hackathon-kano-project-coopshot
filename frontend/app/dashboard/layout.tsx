import React from 'react';
import { Protected } from '@/lib/protected';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Protected>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant='inset' />
        <SidebarInset className='min-w-0 overflow-x-hidden'>
          <SiteHeader />
            {children}
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  );
};

export default DashboardLayout;
