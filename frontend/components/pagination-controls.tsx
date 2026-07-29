// components/pagination-controls.tsx

'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationControlsProps {
  currentPage: number;
  lastPage: number;
  total?: number;
  pageParam?: string; // e.g. "page" or "rec_page"
}

export function PaginationControls({
  currentPage,
  lastPage,
  total,
  pageParam
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set(pageParam || 'page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  if (lastPage <= 1) return null;

  return (
    <div className='mt-8 flex flex-col items-center gap-4'>
      {total && (
        <p className='text-sm text-muted-foreground'>
          Showing page {currentPage} of {lastPage} ({total} societies)
        </p>
      )}

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={createPageURL(Math.max(1, currentPage - 1))}
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) {
                  router.push(createPageURL(currentPage - 1));
                }
              }}
              className={
                currentPage === 1 ? 'pointer-events-none opacity-50' : ''
              }
            />
          </PaginationItem>

          {/* First page */}
          {currentPage > 2 && (
            <PaginationItem>
              <PaginationLink
                href={createPageURL(1)}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(createPageURL(1));
                }}
              >
                1
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Ellipsis */}
          {currentPage > 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* Previous page */}
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationLink
                href={createPageURL(currentPage - 1)}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(createPageURL(currentPage - 1));
                }}
              >
                {currentPage - 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Current page */}
          <PaginationItem>
            <PaginationLink isActive>{currentPage}</PaginationLink>
          </PaginationItem>

          {/* Next page */}
          {currentPage < lastPage && (
            <PaginationItem>
              <PaginationLink
                href={createPageURL(currentPage + 1)}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(createPageURL(currentPage + 1));
                }}
              >
                {currentPage + 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Ellipsis */}
          {currentPage < lastPage - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* Last page */}
          {currentPage < lastPage - 1 && (
            <PaginationItem>
              <PaginationLink
                href={createPageURL(lastPage)}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(createPageURL(lastPage));
                }}
              >
                {lastPage}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              href={createPageURL(Math.min(lastPage, currentPage + 1))}
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < lastPage) {
                  router.push(createPageURL(currentPage + 1));
                }
              }}
              className={
                currentPage === lastPage ? 'pointer-events-none opacity-50' : ''
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
