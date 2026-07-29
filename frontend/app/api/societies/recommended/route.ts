// app/api/societies/recommended/route.ts

import { NextRequest } from 'next/server';
import { apiFetch } from '@/lib/api';
import { MOCK_SOCIETIES } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');

  /* ORIGINAL BACKEND CALL:
  const endpoint = `/societies/recommended?page=${page}`;
  const res = await apiFetch(endpoint, { method: 'GET' }, true);
  const data = await res.json();
  return Response.json(data);
  */

  return Response.json({
    data: MOCK_SOCIETIES,
    current_page: page,
    last_page: 1,
    total: MOCK_SOCIETIES.length,
  });
}
