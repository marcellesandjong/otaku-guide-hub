import { useState, useCallback } from 'react';
import type { Anime } from '@/services/jikanApi';

const STORAGE_KEY = 'anime-plug-watchlist';

function loadWatchlist(): Anime[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Anime[]) : [];
  } catch {
    return [];
  }
}

function saveWatchlist(list: Anime[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Anime[]>(loadWatchlist);

  const isInWatchlist = useCallback(
    (id: number) => watchlist.some((a) => a.id === id),
    [watchlist]
  );

  const addToWatchlist = useCallback((anime: Anime) => {
    setWatchlist((prev) => {
      if (prev.some((a) => a.id === anime.id)) return prev;
      const updated = [...prev, anime];
      saveWatchlist(updated);
      return updated;
    });
  }, []);

  const removeFromWatchlist = useCallback((id: number) => {
    setWatchlist((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      saveWatchlist(updated);
      return updated;
    });
  }, []);

  const toggleWatchlist = useCallback(
    (anime: Anime) => {
      if (isInWatchlist(anime.id)) {
        removeFromWatchlist(anime.id);
      } else {
        addToWatchlist(anime);
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  return {
    watchlist,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
  };
}
