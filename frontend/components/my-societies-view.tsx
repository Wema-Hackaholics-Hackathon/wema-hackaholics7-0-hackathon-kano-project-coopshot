'use client';

import { useState } from 'react';
import Image from 'next/image';
import { QuickCreateSociety } from './quick-create-society';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  IconLayoutGrid,
  IconTable,
  IconCalendar,
  IconCurrencyDollar,
  IconUsers,
  IconArrowUpRight,
} from '@tabler/icons-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface ActiveSociety {
  id: number | string;
  name: string;
  description?: string | null;
  avatar_url?: string | null;
  role: string;
  total_members: number;
  verified?: boolean;
  settings?: {
    contribution_amount: number;
    frequency: string;
    payout_cycle: string;
  };
  next_due?: {
    date: string;
  } | null;
}

interface MySocietiesViewProps {
  societies: ActiveSociety[];
}

function getRoleBadge(role: string) {
  switch (role.toLowerCase()) {
    case 'founder':
      return (
        <Badge variant='default' className='bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shrink-0 whitespace-nowrap'>
          Founder
        </Badge>
      );
    case 'co-founder':
      return (
        <Badge variant='default' className='bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shrink-0 whitespace-nowrap'>
          Co-Founder
        </Badge>
      );
    case 'executive':
      return (
        <Badge variant='default' className='bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shrink-0 whitespace-nowrap'>
          Executive
        </Badge>
      );
    default:
      return (
        <Badge variant='secondary' className='font-medium text-xs shrink-0 whitespace-nowrap'>
          Member
        </Badge>
      );
  }
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function MySocietiesView({ societies }: MySocietiesViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  if (societies.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center bg-card rounded-xl border p-8 shadow-xs'>
        <Image
          src='/illustrations/undraw_collaboration_hkrb.svg'
          alt='No active societies'
          width={240}
          height={180}
          className='mb-6 h-40 w-auto'
        />
        <h2 className='text-2xl font-bold mb-2 tracking-tight'>No Active Societies</h2>
        <p className='text-muted-foreground mb-6 max-w-md text-sm leading-relaxed'>
          You haven&apos;t joined or created any cooperative savings groups yet. Get started by creating your own or exploring community groups!
        </p>
        <QuickCreateSociety from='page' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Top Action Bar with View Toggle */}
      <div className='flex items-center justify-between gap-4 border-b pb-4'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <span className='font-semibold text-foreground text-base'>
            Active Groups ({societies.length})
          </span>
        </div>

        {/* Layout Toggle Buttons */}
        <div className='inline-flex items-center rounded-lg border bg-muted/40 p-1 gap-1'>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <IconLayoutGrid className='h-3.5 w-3.5' />
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <IconTable className='h-3.5 w-3.5' />
            Table
          </button>
        </div>
      </div>

      <AnimatePresence mode='wait'>
        {viewMode === 'grid' ? (
          /* Cards View */
          <motion.div
            key='grid'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'
          >
            {societies.map((society, idx) => (
              <motion.div
                key={society.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                whileHover={{ y: -3 }}
                className='flex flex-col'
              >
                <Card className='group flex flex-col justify-between h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-md bg-card border'>
                  <div className='p-5 pb-3.5 min-w-0 w-full overflow-hidden'>
                    <div className='flex items-start justify-between gap-3 w-full min-w-0'>
                      <div className='flex items-center gap-3 min-w-0 flex-1 overflow-hidden'>
                        <Avatar className='h-11 w-11 border shrink-0 transition-transform group-hover:scale-105'>
                          <AvatarImage src={society.avatar_url || undefined} />
                          <AvatarFallback className='bg-primary/10 text-primary text-sm font-bold'>
                            {society.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className='min-w-0 flex-1 overflow-hidden space-y-0.5'>
                          <h3
                            className='text-base font-semibold text-foreground truncate block w-0 min-w-full group-hover:text-primary transition-colors'
                            title={society.name}
                          >
                            {society.name}
                          </h3>
                          <p
                            className='text-xs text-muted-foreground truncate block w-0 min-w-full'
                            title={society.description || ''}
                          >
                            {society.description || 'Rotating savings group'}
                          </p>
                        </div>
                      </div>

                      <div className='shrink-0 pt-0.5'>
                        {getRoleBadge(society.role)}
                      </div>
                    </div>
                  </div>

                  <CardContent className='space-y-3.5 py-3 flex-1 border-t border-b bg-muted/20'>
                    {society.settings && (
                      <div className='grid grid-cols-2 gap-3 text-xs'>
                        <div className='space-y-1 min-w-0'>
                          <span className='text-muted-foreground block text-[11px] font-medium'>
                            Contribution
                          </span>
                          <span className='font-bold text-foreground text-sm flex items-center gap-1 truncate'>
                            ₦{society.settings.contribution_amount.toLocaleString()}
                          </span>
                        </div>

                        <div className='space-y-1 min-w-0'>
                          <span className='text-muted-foreground block text-[11px] font-medium'>
                            Frequency
                          </span>
                          <span className='font-semibold text-foreground capitalize text-xs truncate block'>
                            {society.settings.frequency}
                          </span>
                        </div>

                        <div className='space-y-1 min-w-0'>
                          <span className='text-muted-foreground block text-[11px] font-medium'>
                            Total Pool Members
                          </span>
                          <span className='font-semibold text-foreground flex items-center gap-1 text-xs truncate'>
                            <IconUsers className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
                            {society.total_members} members
                          </span>
                        </div>

                        <div className='space-y-1 min-w-0'>
                          <span className='text-muted-foreground block text-[11px] font-medium'>
                            Next Due Date
                          </span>
                          <span className='font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-xs truncate'>
                            <IconCalendar className='h-3.5 w-3.5 shrink-0' />
                            {formatDate(society.next_due?.date)}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className='pt-3 pb-3 bg-card'>
                    <Button
                      asChild
                      size='sm'
                      className='w-full cursor-pointer group-hover:bg-primary group-hover:text-primary-foreground transition-all'
                    >
                      <Link href={`/dashboard/societies/${society.id}`}>
                        Open Society <IconArrowUpRight className='ml-1 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity' />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Table View - Scrollable Container */
          <motion.div
            key='table'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className='w-full overflow-x-auto border bg-card rounded-xl shadow-xs'
          >
            <Table className='min-w-180'>
              <TableHeader className='bg-muted/40'>
                <TableRow>
                  <TableHead className='font-semibold min-w-60'>Society Name</TableHead>
                  <TableHead className='font-semibold min-w-27.5'>Role</TableHead>
                  <TableHead className='font-semibold min-w-40'>Contribution</TableHead>
                  <TableHead className='font-semibold min-w-30'>Members</TableHead>
                  <TableHead className='font-semibold min-w-32.5'>Next Due</TableHead>
                  <TableHead className='text-right font-semibold min-w-25'>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {societies.map((society) => (
                  <TableRow key={society.id} className='hover:bg-muted/30 transition-colors'>
                    <TableCell className='font-medium max-w-50 sm:max-w-62.5 overflow-hidden'>
                      <div className='flex items-center gap-3 min-w-0 w-full overflow-hidden'>
                        <Avatar className='h-9 w-9 border shrink-0'>
                          <AvatarImage src={society.avatar_url || undefined} />
                          <AvatarFallback className='text-xs font-bold bg-primary/10 text-primary'>
                            {society.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0 flex-1 overflow-hidden space-y-0.5'>
                          <span
                            className='font-semibold text-foreground text-sm truncate block w-0 min-w-full'
                            title={society.name}
                          >
                            {society.name}
                          </span>
                          <p
                            className='text-xs text-muted-foreground truncate block w-0 min-w-full'
                            title={society.description || ''}
                          >
                            {society.description || 'Rotating savings group'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(society.role)}</TableCell>
                    <TableCell className='font-bold text-foreground text-sm whitespace-nowrap'>
                      {society.settings
                        ? `₦${society.settings.contribution_amount.toLocaleString()} (${society.settings.frequency})`
                        : '—'}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground whitespace-nowrap'>
                      {society.total_members} members
                    </TableCell>
                    <TableCell className='text-sm font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap'>
                      {formatDate(society.next_due?.date)}
                    </TableCell>
                    <TableCell className='text-right whitespace-nowrap'>
                      <Button asChild size='sm' variant='outline' className='cursor-pointer'>
                        <Link href={`/dashboard/societies/${society.id}`}>
                          Open <IconArrowUpRight className='ml-1 h-3.5 w-3.5' />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
