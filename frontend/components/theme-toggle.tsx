'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button size='icon' className='size-8 shrink-0' variant='outline'>
        <span className='size-4' />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      size='icon'
      className='size-8 shrink-0 transition-all duration-200'
      variant='outline'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <IconSun className='h-4 w-4 text-amber-500 transition-transform duration-300 rotate-0' />
      ) : (
        <IconMoon className='h-4 w-4 transition-transform duration-300 rotate-0' />
      )}
      <span className='sr-only'>{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
    </Button>
  );
}
