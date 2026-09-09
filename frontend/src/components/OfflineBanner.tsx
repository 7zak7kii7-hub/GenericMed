import React, { useState, useEffect } from 'react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowRestoredNotice(true);
      const timer = setTimeout(() => setShowRestoredNotice(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestoredNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !showRestoredNotice) return null;

  return (
    <div
      className={`w-full transition-all duration-300 z-40 text-xs px-4 py-2 font-medium flex items-center justify-center gap-2 shadow-sm ${
        isOffline
          ? 'bg-amber-600 text-white'
          : 'bg-emerald-600 text-white animate-fadeIn'
      }`}
    >
      <span className="material-symbols-outlined text-[16px]">
        {isOffline ? 'cloud_off' : 'cloud_done'}
      </span>
      <span>
        {isOffline
          ? 'Offline Mode Active: Browsing cached generic catalog & prescriptions via Service Worker'
          : 'Connection Restored: Real-time telemetry & CDSCO cloud sync active'}
      </span>
    </div>
  );
};
