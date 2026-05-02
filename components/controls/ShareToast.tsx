"use client";

type Props = { message: string | null };

export function ShareToast({ message }: Props) {
  if (!message) return null;
  return (
    <output className="share-toast" aria-live="polite">
      <div className="share-toast-pill deck-mono">✓ {message}</div>
    </output>
  );
}
