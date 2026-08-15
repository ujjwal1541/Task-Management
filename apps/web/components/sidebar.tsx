'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Check, ChevronDown, ChevronRight, LayoutGrid, LogOut, Moon, Package, Palette, Settings, Sun, X,
} from 'lucide-react';
import { Avatar, MenuItem } from './ui';
import { ACCENTS, useTheme } from './theme-provider';
import { useAuth } from './auth-provider';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/tasks', label: 'Tasks', icon: LayoutGrid },
  { href: '/projects', label: 'Projects', icon: Package },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { mode, setMode, accent, setAccent } = useTheme();
  const [menu, setMenu] = useState(false);
  const [sub, setSub] = useState<'theme' | 'color' | null>(null);

  return (
    <>
      <div
        className={cn('fixed inset-0 z-30 bg-black/40 lg:hidden', open ? 'block' : 'hidden')}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          'fixed z-40 flex h-full w-[260px] shrink-0 flex-col border-r bg-surface transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="relative flex items-center gap-2 p-3">
          <button
            onClick={() => { setMenu((v) => !v); setSub(null); }}
            className="flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted"
          >
            <Avatar name={user?.name} url={user?.avatarUrl} size={26} />
            <span className="flex-1 truncate text-sm font-semibold">{user?.name ?? 'Workspace'}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="rounded-lg p-1.5 hover:bg-muted lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>

          {menu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} aria-hidden />
              <div className="animate-pop absolute left-3 right-3 top-[52px] z-50 rounded-2xl border bg-card p-2 shadow-pop">
                <div className="flex flex-col items-center gap-1 border-b pb-3 pt-2">
                  <Avatar name={user?.name} url={user?.avatarUrl} size={44} />
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="relative pt-2">
                  <MenuItem onClick={() => setSub(sub === 'theme' ? null : 'theme')}>
                    <Sun className="h-4 w-4" /> Change Theme
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                  </MenuItem>
                  {sub === 'theme' && (
                    <div className="animate-pop mb-1 ml-6 rounded-xl border bg-card p-1.5">
                      <p className="px-2 pb-1 text-[11px] text-muted-foreground">Theme</p>
                      {(['light', 'dark'] as const).map((m) => (
                        <MenuItem key={m} onClick={() => setMode(m)}>
                          {m === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                          <span className="capitalize">{m}</span>
                          {mode === m && <Check className="ml-auto h-4 w-4" />}
                        </MenuItem>
                      ))}
                    </div>
                  )}
                  <MenuItem onClick={() => setSub(sub === 'color' ? null : 'color')}>
                    <span className="h-4 w-4 rounded-[4px] bg-accent" />
                    Color Mode
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                  </MenuItem>
                  {sub === 'color' && (
                    <div className="animate-pop mb-1 ml-6 rounded-xl border bg-card p-1.5">
                      <p className="px-2 pb-1 text-[11px] text-muted-foreground">Color Mode</p>
                      {ACCENTS.map((a) => (
                        <MenuItem key={a.key} onClick={() => setAccent(a.key)}>
                          <span className="h-4 w-4 rounded-[4px]" style={{ background: a.swatch }} />
                          {a.label}
                          {accent === a.key && <Check className="ml-auto h-4 w-4" />}
                        </MenuItem>
                      ))}
                    </div>
                  )}
                  <Link href="/settings" onClick={() => setMenu(false)}>
                    <MenuItem>
                      <Settings className="h-4 w-4" /> Settings
                    </MenuItem>
                  </Link>
                  <MenuItem onClick={logout}>
                    <LogOut className="h-4 w-4" /> Log out
                  </MenuItem>
                </div>
              </div>
            </>
          )}
        </div>

        <nav className="flex-1 px-3 pt-2">
          <p className="flex items-center justify-between px-2 py-2 text-xs font-medium text-muted-foreground">
            Workspace <ChevronDown className="h-3.5 w-3.5" />
          </p>
          <ul className="space-y-0.5">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                      active ? 'bg-muted font-medium' : 'text-foreground/80 hover:bg-muted',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 text-[11px] text-muted-foreground">Pyramid · Task Management</div>
      </aside>
    </>
  );
}
