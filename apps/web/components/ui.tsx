'use client';

import { cn } from '@/lib/utils';
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'subtle' | 'danger';

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'sm' | 'md' | 'lg' }
>(function Button({ className, variant = 'primary', size = 'md', ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        size === 'sm' && 'h-8 px-2.5 text-[13px]',
        size === 'md' && 'h-9 px-3 text-sm',
        size === 'lg' && 'h-11 w-full px-4 text-sm',
        variant === 'primary' && 'bg-accent text-accent-foreground hover:opacity-90',
        variant === 'outline' && 'border bg-card hover:bg-muted',
        variant === 'ghost' && 'hover:bg-muted',
        variant === 'subtle' && 'bg-muted hover:bg-border',
        variant === 'danger' && 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
        className,
      )}
      {...props}
    />
  );
});

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-9 w-full rounded-lg border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/30',
          className,
        )}
        {...props}
      />
    );
  },
);

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border bg-card shadow-card', className)} {...props} />;
}

export function Avatar({ name, url, size = 24 }: { name?: string | null; url?: string | null; size?: number }) {
  const label = (name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name ?? 'member'} width={size} height={size} className="rounded-full object-cover" />
  ) : (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground"
      style={{ width: size, height: size }}
      title={name ?? undefined}
    >
      {label}
    </span>
  );
}

export function Popover({
  open,
  onClose,
  children,
  className,
  anchorRef,
  align = 'right',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  /** Element the popover should be positioned against. Required — the popover renders in a
   *  portal so it can escape any ancestor's `overflow-hidden` (e.g. rounded card containers). */
  anchorRef: React.RefObject<HTMLElement | null>;
  /** Which edge of the anchor the panel's edge lines up with. */
  align?: 'left' | 'right';
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    if (!anchorRef.current || !panelRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const panelRect = panelRef.current.getBoundingClientRect();
    const panelWidth = panelRect.width || 210;
    const panelHeight = panelRect.height;

    let top = anchorRect.bottom + 6;
    if (top + panelHeight > window.innerHeight) {
      // Not enough room below the trigger — open upward instead.
      top = anchorRect.top - panelHeight - 6;
    }
    top = Math.max(8, top);

    let left = align === 'right' ? anchorRect.right - panelWidth : anchorRect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8));

    setCoords({ top, left });
  }, [open, align, anchorRef]);

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        className={cn(
          'animate-pop fixed z-50 min-w-[210px] rounded-xl border bg-card p-1.5 shadow-pop',
          !coords && 'invisible',
          className,
        )}
        style={coords ?? { top: -9999, left: -9999 }}
        role="menu"
      >
        {children}
      </div>
    </>,
    document.body,
  );
}

export function MenuItem({
  className,
  active,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      role="menuitem"
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-muted',
        active && 'font-medium',
        className,
      )}
      {...props}
    />
  );
}

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full resize-y rounded-lg border bg-card px-3 py-2 text-[13px] leading-5 outline-none transition-colors placeholder:text-muted-foreground focus:border-accent',
          className,
        )}
        {...props}
      />
    );
  },
);