'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { ACCENTS, useTheme } from '@/components/theme-provider';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { mode, setMode, accent, setAccent } = useTheme();
  const { user, refresh } = useAuth();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(user?.name ?? '');
    setTitle(user?.title ?? '');
  }, [user]);

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:px-6">
      <h1 className="text-lg font-semibold tracking-tight">Settings</h1>

      <Card className="p-4">
        <h2 className="text-[13px] font-medium">Appearance</h2>
        <p className="mt-0.5 text-[12px] text-muted-foreground">Theme preferences are saved to this browser.</p>
        <div className="mt-3 grid max-w-xs grid-cols-3 gap-1 rounded-lg bg-muted p-1">
          {(['light', 'dark', 'system'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setMode(option)}
              className={cn(
                'rounded-md px-2 py-1.5 text-[13px] capitalize',
                mode === option ? 'bg-card font-medium shadow-card' : 'text-muted-foreground',
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {ACCENTS.map((option) => (
            <button
              key={option.key}
              onClick={() => setAccent(option.key)}
              aria-label={option.label}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2',
                accent === option.key ? 'border-foreground' : 'border-transparent',
              )}
              style={{ backgroundColor: option.swatch }}
            >
              {accent === option.key && <Check className="h-4 w-4 text-white" />}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-[13px] font-medium">Profile</h2>
        <div className="mt-3 space-y-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" />
        </div>
        <Button
          size="sm"
          className="mt-3 w-auto"
          onClick={async () => {
            await api.updateProfile({ name, title });
            await refresh();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        >
          {saved ? 'Saved' : 'Save changes'}
        </Button>
      </Card>
    </div>
  );
}
