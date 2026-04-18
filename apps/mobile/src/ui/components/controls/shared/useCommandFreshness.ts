import { useEffect, useMemo, useState } from 'react';

function formatAge(updatedAt: number, now: number): string {
  const diffSeconds = Math.max(0, Math.floor((now - updatedAt) / 1000));

  if (diffSeconds < 60) return `Maj ${diffSeconds.toString().padStart(2, '0')} s`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `Maj ${diffMinutes.toString().padStart(2, '0')} m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Maj ${diffHours.toString().padStart(2, '0')} h`;

  const diffDays = Math.floor(diffHours / 24);
  return `Maj ${diffDays.toString().padStart(2, '0')} j`;
}

export function useCommandFreshness(lastUpdatedAt: number | undefined, isPending: boolean): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!lastUpdatedAt) return;

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [lastUpdatedAt]);

  return useMemo(() => {
    if (isPending) return 'Sync...';
    if (!lastUpdatedAt) return 'Sans maj';
    return formatAge(lastUpdatedAt, now);
  }, [isPending, lastUpdatedAt, now]);
}
