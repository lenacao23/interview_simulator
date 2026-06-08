'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/storage';
import type { Session } from '@/lib/types';

export function useSession(id: string) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(getSession(id));
  }, [id]);

  return session;
}
