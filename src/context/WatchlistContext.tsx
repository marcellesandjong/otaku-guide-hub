import { createContext, useContext, ReactNode } from 'react';
import { useWatchlist } from '@/hooks/useWatchlist';
import type { Anime } from '@/services/jikanApi';

interface WatchlistContextValue {
  watchlist: Anime[];
  isInWatchlist: (id: number) => boolean;
  toggleWatchlist: (anime: Anime) => void;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const value = useWatchlist();
  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlistContext() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlistContext must be inside WatchlistProvider');
  return ctx;
}
