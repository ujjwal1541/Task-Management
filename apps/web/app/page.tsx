'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Triangle } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/components/auth-provider';

export default function LoginPage() {
  const { user, loading, loginAsGuest } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace('/tasks');
  }, [loading, user, router]);

  async function guest() {
    setBusy(true);
    setError(null);
    try {
      await loginAsGuest();
    } catch {
      setError('Could not reach the API. Make sure the NestJS server is running on port 4000.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Triangle className="h-3.5 w-3.5" />
        </span>
        <span className="text-[15px] font-semibold">Pyramid</span>
      </div>

      <Card className="w-full max-w-[400px] p-6">
        <h1 className="text-center text-xl font-semibold tracking-tight">Let&apos;s get back on track</h1>
        <p className="mt-1 text-center text-[13px] text-muted-foreground">
          Enter your email below to login to your account.
        </p>

        <div className="mt-5 space-y-2.5">
          <Button size="lg" className="rounded-full" onClick={guest} disabled={busy}>
            {busy ? 'Signing in…' : 'Continue as Guest'}
          </Button>
          <Button size="lg" variant="outline" className="rounded-full" disabled title="Not part of this assessment scope">
            <GoogleIcon /> Login with Google
          </Button>
        </div>

        {error && <p className="mt-3 text-center text-[12px] text-red-500">{error}</p>}
      </Card>

      <p className="max-w-[320px] text-center text-[12px] leading-5 text-muted-foreground">
        By clicking continue, you agree to our <span className="underline">Terms of Service</span> and{' '}
        <span className="underline">Privacy Policy</span>
      </p>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M23 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h6.2A5.3 5.3 0 0 1 15.8 18v3h4.1c2.4-2.2 3.1-5.4 3.1-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-4.1-3c-1.1.7-2.5 1.2-3.8 1.2-3 0-5.6-2-6.5-4.8H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.5 14.5A7.2 7.2 0 0 1 5.5 9.5V6.4H1.3a12 12 0 0 0 0 11.2l4.2-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.6-3.6A12 12 0 0 0 1.3 6.4l4.2 3.1C6.4 6.7 9 4.8 12 4.8Z" />
    </svg>
  );
}
