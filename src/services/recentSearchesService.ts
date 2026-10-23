/**
 * BeautyZone Recent Searches Persistence Service
 * Manages persisting and retrieving user search queries from localStorage,
 * allowing instant quick navigation back to previous search states.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'beautyzone_recent_searches';
const MAX_RECENT_SEARCHES = 8;

const INITIAL_DEFAULT_SEARCHES: string[] = [
  'Bridal HD Makeup',
  'Hydra-Glow Facial',
  'Keratin Hair Spa',
  'Rica White Chocolate Wax',
  'Bandra West',
];

const EVENT_NAME = 'beautyzone:recent_searches_updated';

/**
 * Retrieve persisted recent searches from localStorage.
 */
export function getStoredRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize with realistic seed searches for immediate discoverability
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEFAULT_SEARCHES));
      return INITIAL_DEFAULT_SEARCHES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === 'string' && item.trim().length > 0);
    }
    return INITIAL_DEFAULT_SEARCHES;
  } catch (e) {
    console.warn('Unable to read recent searches from localStorage:', e);
    return INITIAL_DEFAULT_SEARCHES;
  }
}

/**
 * Add a query to recent searches, moving it to the top and capping at MAX_RECENT_SEARCHES.
 */
export function addStoredRecentSearch(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return getStoredRecentSearches();

  try {
    const current = getStoredRecentSearches();
    // Case-insensitive deduplication, keeping new one at index 0
    const filtered = current.filter(
      (item) => item.toLowerCase() !== trimmed.toLowerCase()
    );
    const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    return updated;
  } catch (e) {
    console.warn('Unable to save recent search to localStorage:', e);
    return [];
  }
}

/**
 * Delete a single query from recent searches.
 */
export function deleteStoredRecentSearch(query: string): string[] {
  try {
    const current = getStoredRecentSearches();
    const updated = current.filter(
      (item) => item.toLowerCase() !== query.trim().toLowerCase()
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    return updated;
  } catch (e) {
    console.warn('Unable to delete recent search from localStorage:', e);
    return [];
  }
}

/**
 * Clear all recent searches.
 */
export function clearStoredRecentSearches(): string[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: [] }));
    return [];
  } catch (e) {
    console.warn('Unable to clear recent searches in localStorage:', e);
    return [];
  }
}

/**
 * React hook to observe and manipulate recent searches with automatic cross-component sync.
 */
export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    getStoredRecentSearches()
  );

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setRecentSearches(customEvent.detail);
      } else {
        setRecentSearches(getStoredRecentSearches());
      }
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const addSearch = useCallback((query: string) => {
    return addStoredRecentSearch(query);
  }, []);

  const removeSearch = useCallback((query: string) => {
    return deleteStoredRecentSearch(query);
  }, []);

  const clearSearches = useCallback(() => {
    return clearStoredRecentSearches();
  }, []);

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearSearches,
  };
}
