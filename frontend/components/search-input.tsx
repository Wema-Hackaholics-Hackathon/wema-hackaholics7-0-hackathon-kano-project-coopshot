// components/search-input.tsx

'use client';

import { Input } from '@/components/ui/input';
import { IconSearch } from '@tabler/icons-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export function SearchInput({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className='relative'>
      <IconSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        placeholder={placeholder}
        className='pl-10'
        defaultValue={searchParams.get('search')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
