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

    // Set location coordinates
    const setLocation = useCallback((location: GuestLocation | null) => {
        setLocationState(prev => ({
            ...prev,
            location,
            permission: location ? 'granted' : prev.permission,
        }));
    }, []);

    // Check if search can be performed
    const canSearch = useCallback(() => {
        // If distance sorting is disabled, search is always allowed
        if (!locationState.distanceSortingEnabled) {
            return true;
        }
        // If distance sorting is enabled, location must be set
        return locationState.location !== null;
    }, [locationState.distanceSortingEnabled, locationState.location]);
    // Perform search
    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) return;
        setIsSearching(true);
        setHasSearched(true);
        setIsDrawerOpen(true);
        try {
            // Pass location data if distance sorting is enabled and location is available
            const searchOptions = locationState.distanceSortingEnabled && locationState.location
                ? {
                    latitude: locationState.location.latitude,
                    longitude: locationState.location.longitude,
                }
                : undefined;

            const response = await productService.searchProducts(query, searchOptions);
            const products = (response.data as Product[]) || [];

            setSearchResults(products);
            saveRecentSearch(query);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [locationState.distanceSortingEnabled, locationState.location, saveRecentSearch]);
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
        toggleDistanceSorting,
        setManualAddress,
        setLocation,
        canSearch,
        clearRecentSearch,
        clearAllRecentSearches,
    };
};
