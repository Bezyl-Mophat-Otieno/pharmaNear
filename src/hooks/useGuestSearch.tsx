import { useState, useEffect, useCallback } from 'react';
import { Product, ProductSearchPagination } from '@/types/product';
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

export interface GuestSearchFilters {
    business_id?: string;
    requires_prescription?: boolean;
    category_id?: string;
    manufacturer?: string;
}

export const useGuestSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [pagination, setPagination] = useState<ProductSearchPagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [filters, setFilters] = useState<GuestSearchFilters>({});
    const [locationState, setLocationState] = useState<LocationState>({
        permission: 'not-requested',
        location: null,
        manualAddress: '',
        distanceSortingEnabled: true,
    });

    useEffect(() => {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
            try { setRecentSearches(JSON.parse(stored)); } catch { setRecentSearches([]); }
        }
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
            } catch { /* ignore */ }
        }
    }, []);

    const saveRecentSearch = useCallback((query: string) => {
        setRecentSearches(prev => {
            const filtered = prev.filter(s => s.toLowerCase() !== query.toLowerCase());
            const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

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

    const setLocation = useCallback((location: GuestLocation | null) => {
        setLocationState(prev => ({
            ...prev,
            location,
            permission: location ? 'granted' : prev.permission,
        }));
    }, []);

    const canSearch = useCallback(() => {
        if (!locationState.distanceSortingEnabled) return true;
        return locationState.location !== null;
    }, [locationState.distanceSortingEnabled, locationState.location]);

    const performSearch = useCallback(async (query: string, page = 1, activeFilters?: GuestSearchFilters) => {
        if (!query.trim()) return;
        setIsSearching(true);
        setHasSearched(true);
        setIsDrawerOpen(true);
        setCurrentPage(page);

        const filtersToUse = activeFilters ?? filters;

        try {
            const searchOptions = {
                page,
                limit: 10,
                ...(locationState.distanceSortingEnabled && locationState.location
                    ? { latitude: locationState.location.latitude, longitude: locationState.location.longitude }
                    : {}),
                ...(filtersToUse.business_id && { business_id: filtersToUse.business_id }),
                ...(filtersToUse.requires_prescription !== undefined && { requires_prescription: filtersToUse.requires_prescription }),
                ...(filtersToUse.category_id && { category_id: filtersToUse.category_id }),
                ...(filtersToUse.manufacturer && { manufacturer: filtersToUse.manufacturer }),
            };

            const response = await productService.searchProducts(query, searchOptions);
            setSearchResults((response.data as Product[]) || []);
            setPagination(response.pagination ?? null);
            saveRecentSearch(query);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
            setPagination(null);
        } finally {
            setIsSearching(false);
        }
    }, [locationState, filters, saveRecentSearch]);

    const updateFilters = useCallback((newFilters: GuestSearchFilters) => {
        setFilters(newFilters);
    }, []);

    const clearRecentSearch = useCallback((query: string) => {
        setRecentSearches(prev => {
            const updated = prev.filter(s => s !== query);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearAllRecentSearches = useCallback(() => {
        setRecentSearches([]);
        localStorage.removeItem(RECENT_SEARCHES_KEY);
    }, []);

    return {
        searchQuery, setSearchQuery,
        searchResults,
        pagination, currentPage,
        isSearching,
        isDrawerOpen, setIsDrawerOpen,
        recentSearches,
        hasSearched,
        filters, updateFilters,
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
