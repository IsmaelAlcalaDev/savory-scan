
import { useBroadcastFavoritesSync } from '@/hooks/useBroadcastFavoritesSync';

interface BroadcastFavoritesWrapperProps {
  children: React.ReactNode;
}

export default function BroadcastFavoritesWrapper({ children }: BroadcastFavoritesWrapperProps) {
  // Initialize broadcast favorites synchronization
  useBroadcastFavoritesSync();

  return <>{children}</>;
}
