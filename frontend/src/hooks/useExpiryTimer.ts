import { useEffect, useState } from 'react';

export const useExpiryTimer = (expiresAt: string | undefined, isPaid: boolean) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt || isPaid) return;
    const check = () => {
      const remaining = new Date(expiresAt).getTime() - Date.now();
      if (remaining <= 0) {
        setExpired(true);
        setTimeLeft(0);
        return true;
      }
      setTimeLeft(remaining);
      return false;
    };
    if (check()) return;
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, isPaid]);

  return { timeLeft, expired };
};