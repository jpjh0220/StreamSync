import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { toast } from 'sonner';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (showToast) {
        toast.success('Back online!', {
          icon: <Wifi className="w-4 h-4" />,
        });
      }
      setShowToast(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('No internet connection', {
        icon: <WifiOff className="w-4 h-4" />,
        duration: Infinity,
        id: 'offline-toast',
      });
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>You are offline. Some features may not work.</span>
      </div>
    </div>
  );
}
