'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { IconFilterSearch, IconUsers, IconArrowUpRight } from '@tabler/icons-react';
import { motion } from 'framer-motion';

type Society = {
  id: number;
  name: string;
  description?: string | null;
  member_count?: number;
  avatar_url?: string;
};

interface SocietyCardsProps {
  societies: Society[];
}

export function SocietyCards({ societies }: SocietyCardsProps) {
  if (!societies || societies.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex flex-col items-center justify-center py-16 px-4 text-center bg-sidebar-border/50 rounded-xl border border-dashed'
      >
        <div className='mb-3 rounded-full bg-muted p-4'>
          <IconFilterSearch className='h-8 w-8 text-muted-foreground' />
        </div>

        <h3 className='text-xl font-semibold text-foreground'>
          No societies found
        </h3>

        <p className='mt-3 max-w-md text-muted-foreground text-sm'>
          We couldn&apos;t find any societies matching your search. Try adjusting
          your filters or explore all public societies below.
        </p>

        <Button
          variant='outline'
          className='mt-6 cursor-pointer'
          asChild
        >
          <Link href='/dashboard'>Clear search & explore</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      {societies.map((society, idx) => (
        <motion.div
          key={society.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.06 }}
          whileHover={{ y: -3 }}
          className='flex flex-col'
        >
          <Card className='group flex flex-col justify-between h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-md bg-card'>
            {/* Avatar + Name Header */}
            <CardHeader className='flex flex-row items-center gap-4 pb-3'>
              <Avatar className='h-12 w-12 border-2 border-background shadow-2xs shrink-0 transition-transform group-hover:scale-105'>
                <AvatarImage
                  src={society.avatar_url || undefined}
                  alt={society.name}
                />
                <AvatarFallback className='bg-primary/10 text-primary text-lg font-bold'>
                  {society.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className='flex-1 min-w-0'>
                <CardTitle className='line-clamp-1 text-base font-semibold group-hover:text-primary transition-colors'>
                  {society.name}
                </CardTitle>
                <div className='mt-1 flex items-center gap-1.5 text-xs text-muted-foreground'>
                  <IconUsers className='h-3.5 w-3.5 text-muted-foreground' />
                  <span>{society.member_count || 0} members</span>
                </div>
              </div>
            </CardHeader>

            {/* Description + Action */}
            <CardContent className='flex flex-1 flex-col justify-between pt-0 space-y-4'>
              <CardDescription className='line-clamp-2 text-xs leading-relaxed'>
                {society.description ||
                  'A community dedicated to collective savings, rotation, and wealth growth.'}
              </CardDescription>

              <div>
                <Button
                  asChild
                  size='sm'
                  className='w-full cursor-pointer group-hover:bg-primary group-hover:text-primary-foreground transition-all'
                >
                  <Link href={`/dashboard/societies/${society.id}`}>
                    View Society <IconArrowUpRight className='ml-1 h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity' />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
