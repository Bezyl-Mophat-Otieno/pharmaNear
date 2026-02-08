import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/product';
import { productService } from '@/services/productService';
const RECENT_SEARCHES_KEY = 'guest-recent-searches';
const LOCATION_PERMISSION_KEY = 'guest-location-permission';
const MAX_RECENT_SEARCHES = 10;
export interface GuestLocation {
    latitude: number;
    longitude: number;
    address?: string;
}
export interface LocationState {
    permission: 'granted' | 'denied' | 'prompt' | 'not-requested';
    location: GuestLocation | null;
    manualAddress: string;
    distanceSortingEnabled: boolean;
}
export const useGuestSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [locationState, setLocationState] = useState<LocationState>({
        permission: 'not-requested',
        location: null,
        manualAddress: '',
        distanceSortingEnabled: true,
    });
    // Load recent searches from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
            try {
                setRecentSearches(JSON.parse(stored));
            } catch {
                setRecentSearches([]);
            }
        }
        // Load location permission state
        const storedPermission = localStorage.getItem(LOCATION_PERMISSION_KEY);
        if (storedPermission) {
            try {
                const parsed = JSON.parse(storedPermission);
                setLocationState(prev => ({
                    ...prev,
                    permission: parsed.permission || 'not-requested',
                    distanceSortingEnabled: parsed.distanceSortingEnabled ?? true,
                    manualAddress: parsed.manualAddress || '',
                }));
            } catch {
                // Ignore parsing errors
            }
        }
    }, []);
    // Save recent searches to localStorage
    const saveRecentSearch = useCallback((query: string) => {
        setRecentSearches(prev => {
            const filtered = prev.filter(s => s.toLowerCase() !== query.toLowerCase());
            const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);
    // Request browser location
    const requestLocation = useCallback(async (): Promise<boolean> => {
        if (!navigator.geolocation) {
            setLocationState(prev => ({
                ...prev,
                permission: 'denied',
            }));
            localStorage.setItem(LOCATION_PERMISSION_KEY, JSON.stringify({
                permission: 'denied',
                distanceSortingEnabled: locationState.distanceSortingEnabled,
                manualAddress: locationState.manualAddress,
            }));
            return false;
        }
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    setLocationState(prev => ({
                        ...prev,
                        permission: 'granted',
                        location: newLocation,
                    }));
                    localStorage.setItem(LOCATION_PERMISSION_KEY, JSON.stringify({
                        permission: 'granted',
                        distanceSortingEnabled: true,
                        manualAddress: '',
                    }));
                    resolve(true);
                },
                () => {
                    setLocationState(prev => ({
                        ...prev,
                        permission: 'denied',
                    }));
                    localStorage.setItem(LOCATION_PERMISSION_KEY, JSON.stringify({
                        permission: 'denied',
                        distanceSortingEnabled: locationState.distanceSortingEnabled,
                        manualAddress: locationState.manualAddress,
                    }));
                    resolve(false);
                }
            );
        });
    }, [locationState.distanceSortingEnabled, locationState.manualAddress]);
    // Toggle distance sorting
    const toggleDistanceSorting = useCallback((enabled: boolean) => {
        setLocationState(prev => {
            const updated = { ...prev, distanceSortingEnabled: enabled };
            localStorage.setItem(LOCATION_PERMISSION_KEY, JSON.stringify({
                permission: prev.permission,
                distanceSortingEnabled: enabled,
                manualAddress: prev.manualAddress,
            }));
            return updated;
        });
    }, []);
    // Update manual address
    const setManualAddress = useCallback((address: string) => {
        setLocationState(prev => {
            const updated = { ...prev, manualAddress: address };
            localStorage.setItem(LOCATION_PERMISSION_KEY, JSON.stringify({
                permission: prev.permission,
                distanceSortingEnabled: prev.distanceSortingEnabled,
                manualAddress: address,
            }));
            return updated;
        });
    }, []);
    // Perform search
    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) return;
        setIsSearching(true);
        setHasSearched(true);
        setIsDrawerOpen(true);
        try {
            // Request location on first search if not yet requested
            if (locationState.permission === 'not-requested') {
                await requestLocation();
            }
            const response = await productService.searchProducts(query);
            const products = (response.data as Product[]) || [];

            setSearchResults(products);
            saveRecentSearch(query);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [locationState.permission, requestLocation, saveRecentSearch]);
    // Clear recent search
    const clearRecentSearch = useCallback((query: string) => {
        setRecentSearches(prev => {
            const updated = prev.filter(s => s !== query);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);
    // Clear all recent searches
    const clearAllRecentSearches = useCallback(() => {
        setRecentSearches([]);
        localStorage.removeItem(RECENT_SEARCHES_KEY);
    }, []);
    return {
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        isDrawerOpen,
        setIsDrawerOpen,
        recentSearches,
        hasSearched,
        locationState,
        performSearch,
        requestLocation,
        toggleDistanceSorting,
        setManualAddress,
        clearRecentSearch,
        clearAllRecentSearches,
    };
};
