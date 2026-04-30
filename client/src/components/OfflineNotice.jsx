import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

const offlineImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='280' viewBox='0 0 420 280'%3E%3Crect width='420' height='280' rx='28' fill='%230f172a'/%3E%3Ccircle cx='210' cy='126' r='72' fill='%23f59e0b' opacity='.16'/%3E%3Cpath d='M138 118c42-38 102-38 144 0' fill='none' stroke='%23fbbf24' stroke-width='15' stroke-linecap='round'/%3E%3Cpath d='M169 154c24-21 58-21 82 0' fill='none' stroke='%23fbbf24' stroke-width='15' stroke-linecap='round'/%3E%3Cpath d='M203 189h14' stroke='%23fbbf24' stroke-width='15' stroke-linecap='round'/%3E%3Cpath d='M128 211 292 47' stroke='%23ef4444' stroke-width='16' stroke-linecap='round'/%3E%3Crect x='80' y='220' width='260' height='18' rx='9' fill='%23ffffff' opacity='.08'/%3E%3C/svg%3E";

const OfflineNotice = () => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 px-4 text-white backdrop-blur">
      <div className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-slate-900 p-6 text-center shadow-2xl">
        <img src={offlineImage} alt="No internet connection" className="mx-auto mb-5 w-full max-w-xs rounded-2xl" />
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-200">
          <WifiOff size={24} />
        </div>
        <h2 className="text-2xl font-semibold">Please connect your internet</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Connection wapas aate hi dashboard aur booking data automatically continue ho jayega.
        </p>
      </div>
    </div>
  );
};

export default OfflineNotice;
