'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PanelLeft } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { useAuth } from '@/components/auth-provider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading workspace…</div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 items-center gap-2 border-b px-3 lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-1.5 hover:bg-muted" aria-label="Open menu">
            <PanelLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium">Pyramid</span>
        </div>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
