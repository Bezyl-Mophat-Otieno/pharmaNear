import { useState, useEffect, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Search,
    MapPin,
    Clock,
    X,
    Navigation,
    AlertCircle,
    Sparkles,
    ArrowRight,
    Loader2,
    Info,
    ShoppingCart
} from 'lucide-react';
import { useGuestSearch } from '@/hooks/useGuestSearch';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types/product';
import SearchResultsDrawer from '@/components/guest/SearchResultsDrawer';
import SellerCallout from '@/components/seller/SellerCallout';
import geocodingService from '@/services/geocoding';
import type { Location } from '@/types/geocoding';
const Guest = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { items, addItem } = useCart();
    const {
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        isDrawerOpen,
        setIsDrawerOpen,
        recentSearches,
        locationState,
        performSearch,
        toggleDistanceSorting,
        setManualAddress,
        setLocation,
        canSearch,
        clearRecentSearch,
        clearAllRecentSearches,
        filters,
        updateFilters,
        pagination,
        currentPage,
    } = useGuestSearch();

    // Location autocomplete state
    const [locationSearchQuery, setLocationSearchQuery] = useState('');
    const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([]);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout>();
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowLocationSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Geocoding search with debounce
    useEffect(() => {
        if (locationSearchQuery.trim().length < 2) {
            setLocationSuggestions([]);
            return;
        }

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(async () => {
            setIsLoadingLocation(true);
            try {
                const response = await geocodingService.geocode(locationSearchQuery);
                if (response.success) {
                    setLocationSuggestions(response.data);
                    setShowLocationSuggestions(true);
                } else {
                    setLocationSuggestions([]);
                }
            } catch (error) {
                console.error('Geocoding error:', error);
                setLocationSuggestions([]);
            } finally {
                setIsLoadingLocation(false);
            }
        }, 500);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [locationSearchQuery]);
    const handleLocationSelect = (location: Location) => {
        const fullAddress = `${location.name}${location.state ? ', ' + location.state : ''}, ${location.country}`;
        setSelectedLocation(location);
        setLocationSearchQuery(fullAddress);
        setManualAddress(fullAddress);

        // Set the location coordinates in the hook
        setLocation({
            latitude: location.lat,
            longitude: location.lon,
            address: fullAddress,
        });

        setShowLocationSuggestions(false);
        setLocationSuggestions([]);

        toast({
            title: "Location set",
            description: `Using ${location.name} for distance sorting.`,
        });
    };

    const handleGetCurrentLocation = async () => {
        setIsGettingCurrentLocation(true);
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            const { latitude, longitude } = position.coords;

            // Reverse geocode to get location name
            const response = await fetch(
                `${import.meta.env.VITE_PUBLIC_BEEQ_API_URL}geocoding/reverse?lat=${latitude}&lon=${longitude}&limit=1`
            );

            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    const location = data[0];
                    const fullAddress = `${location.name}${location.state ? ', ' + location.state : ''}, ${location.country}`;

                    setSelectedLocation({
                        name: location.name,
                        country: location.country,
                        state: location.state,
                        lat: latitude,
                        lon: longitude
                    });
                    setLocationSearchQuery(fullAddress);
                    setManualAddress(fullAddress);

                    // Set the location coordinates in the hook
                    setLocation({
                        latitude,
                        longitude,
                        address: fullAddress,
                    });

                    toast({
                        title: "Location detected",
                        description: `Using your current location: ${location.name}`,
                    });
                } else {
                    // Fallback: just use coordinates
                    const coordsAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                    setManualAddress(coordsAddress);

                    // Set the location coordinates in the hook
                    setLocation({
                        latitude,
                        longitude,
                        address: coordsAddress,
                    });

                    toast({
                        title: "Location detected",
                        description: "Using your current coordinates for distance sorting.",
                    });
                }
            }
        } catch (error) {
            console.error('Error getting location:', error);
            toast({
                title: "Location error",
                description: "Could not get your current location. Please enter it manually.",
                variant: "destructive"
            });
        } finally {
            setIsGettingCurrentLocation(false);
        }
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            performSearch(searchQuery.trim());
        }
    };
    const handleRecentSearchClick = (query: string) => {
        setSearchQuery(query);
        performSearch(query);
    };
    const handleAddToCart = (product: Product, quantity: number) => {
        for (let i = 0; i < quantity; i++) {
            addItem(product);
        }
        toast({
            title: "Added to cart!",
            description: `${quantity}x ${product.name} added to your cart.`,
        });
    };
    const handleViewCart = () => {
        setIsDrawerOpen(false);
        navigate('/cart');
    };

    const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            {/* Hero Search Section */}
            <div className="relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />

                <div className="container mx-auto px-4 py-16 md:py-24 relative">
                    <div className="max-w-3xl mx-auto text-center">
                        {/* Header */}
                        <div className="mb-8">
                            <Badge variant="secondary" className="mb-4">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Quick Search
                            </Badge>
                            <h1 className="text-3xl md:text-5xl font-playfair font-bold mb-4">
                                Find What You Need
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Search for products and place orders without creating an account
                            </p>
                        </div>
                        {/* Search Form */}
                        <form onSubmit={handleSearch} className="relative mb-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for a drug or medical supply..."
                                    className="w-full h-14 pl-12 pr-32 text-lg rounded-full border-2 focus:border-primary shadow-lg"
                                />
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6"
                                    disabled={!searchQuery.trim() || isSearching || !canSearch()}
                                >
                                    {isSearching ? (
                                        <span className="animate-pulse">Searching...</span>
                                    ) : (
                                        <>
                                            Search
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Location Required Hint */}
                            {searchQuery.trim() && !canSearch() && locationState.distanceSortingEnabled && (
                                <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-500" />
                                    <div className="text-sm text-amber-800 dark:text-amber-200">
                                        <span className="font-medium">Location required:</span> Please set your location using one of the options below, or disable distance sorting to search without location.
                                    </div>
                                </div>
                            )}
                        </form>
                        {/* Location Controls */}
                        <Card className="bg-background/80 backdrop-blur-sm border shadow-sm mb-8">
                            <CardContent className="p-4">
                                <div className="space-y-4">
                                    {/* Location Status Header */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${locationState.location
                                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                : locationState.distanceSortingEnabled
                                                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                                    : 'bg-muted text-muted-foreground'
                                                }`}>
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium">
                                                    {locationState.location
                                                        ? 'Location set'
                                                        : locationState.distanceSortingEnabled
                                                            ? 'Location required'
                                                            : 'Set your location'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {locationState.distanceSortingEnabled
                                                        ? locationState.location
                                                            ? `${locationState.location.address || 'Ready for distance sorting'}`
                                                            : 'Please set your location below'
                                                        : 'Distance sorting is disabled'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="disable-distance"
                                                checked={!locationState.distanceSortingEnabled}
                                                onCheckedChange={(checked) => toggleDistanceSorting(!checked)}
                                            />
                                            <Label htmlFor="disable-distance" className="text-xs text-muted-foreground cursor-pointer">
                                                Skip distance sorting
                                            </Label>
                                        </div>
                                    </div>

                                    {/* Location Input Options - Always visible when distance sorting is enabled */}
                                    {locationState.distanceSortingEnabled && (
                                        <div className="space-y-4 pt-4 border-t">
                                            {/* Option 1: Auto-detect location */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                    <Navigation className="h-4 w-4" />
                                                    Option 1: Auto-detect your location
                                                </Label>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleGetCurrentLocation}
                                                    disabled={isGettingCurrentLocation}
                                                    className="w-full sm:w-auto"
                                                >
                                                    {isGettingCurrentLocation ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Getting location...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Navigation className="h-4 w-4 mr-2" />
                                                            Use my current location
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            {/* Option 2: Manual location search with autocomplete */}
                                            <div className="space-y-2 relative">
                                                <Label htmlFor="manual-location" className="text-sm font-medium flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    Option 2: Enter your location manually
                                                </Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="manual-location"
                                                        placeholder="Search for your location (e.g., Westlands, Nairobi)..."
                                                        value={locationSearchQuery}
                                                        onChange={(e) => {
                                                            setLocationSearchQuery(e.target.value);
                                                            if (!e.target.value.trim()) {
                                                                setSelectedLocation(null);
                                                                setManualAddress('');
                                                            }
                                                        }}
                                                        onFocus={() => locationSuggestions.length > 0 && setShowLocationSuggestions(true)}
                                                        className="pl-9 pr-9 text-sm"
                                                    />
                                                    {isLoadingLocation && (
                                                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                                                    )}
                                                </div>

                                                {/* Location Suggestions Dropdown */}
                                                {showLocationSuggestions && locationSuggestions.length > 0 && (
                                                    <div
                                                        ref={suggestionsRef}
                                                        className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto"
                                                    >
                                                        {locationSuggestions.map((location, index) => (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                onClick={() => handleLocationSelect(location)}
                                                                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-start gap-2 border-b last:border-b-0"
                                                            >
                                                                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-medium text-sm">{location.name}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {location.state && `${location.state}, `}{location.country}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                                        Lat: {location.lat.toFixed(4)}, Lon: {location.lon.toFixed(4)}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Selected Location Display */}
                                                {selectedLocation && (
                                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 text-xs">
                                                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                                                        <div>
                                                            <div className="font-medium">Selected Location</div>
                                                            <div className="text-muted-foreground mt-1">
                                                                {selectedLocation.name}{selectedLocation.state && `, ${selectedLocation.state}`}, {selectedLocation.country}
                                                            </div>
                                                            <div className="text-muted-foreground mt-0.5">
                                                                Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Info Text */}
                                                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                                                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                                    <span>
                                                        Start typing your city or location name to see suggestions.
                                                        Select a location from the dropdown to enable distance-based sorting.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        {/* Info Text */}
                        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                            Simply search for the product you need, add it to your cart, and checkout —
                            no account required. Your cart and searches are saved locally in your browser.
                        </p>
                    </div>
                </div>
            </div>
            {/* Recent Searches Section */}
            {recentSearches.length > 0 && (
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <h2 className="font-medium">Recent Searches</h2>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAllRecentSearches}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Clear all
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {recentSearches.map((query, index) => (
                                <Badge
                                    key={`${query}-${index}`}
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-secondary/80 transition-colors py-2 px-3 text-sm group"
                                    onClick={() => handleRecentSearchClick(query)}
                                >
                                    <Search className="h-3 w-3 mr-2 text-muted-foreground" />
                                    {query}
                                    <button
                                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearRecentSearch(query);
                                        }}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Seller Callout */}
            <SellerCallout />
            {/* Quick Tips Section */}
            <div className="container mx-auto px-4 py-8 pb-16">
                <div className="max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-background/50 border-dashed">
                            <CardContent className="p-4 text-center">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                    <Search className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-medium text-sm mb-1">Search Products</h3>
                                <p className="text-xs text-muted-foreground">
                                    Find exactly what you need using our quick search
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/50 border-dashed">
                            <CardContent className="p-4 text-center">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-medium text-sm mb-1">Nearby Options</h3>
                                <p className="text-xs text-muted-foreground">
                                    Enable location to see products sorted by distance
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/50 border-dashed">
                            <CardContent className="p-4 text-center">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-medium text-sm mb-1">No Account Needed</h3>
                                <p className="text-xs text-muted-foreground">
                                    Order directly without creating an account
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            {/* Search Results Drawer */}
            <SearchResultsDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                results={searchResults}
                isLoading={isSearching}
                searchQuery={searchQuery}
                pagination={pagination}
                currentPage={currentPage}
                filters={filters}
                onFiltersChange={(newFilters) => {
                    updateFilters(newFilters);
                    performSearch(searchQuery, 1, newFilters);
                }}
                onPageChange={(page) => performSearch(searchQuery, page)}
                onAddToCart={handleAddToCart}
                cartItemCount={cartItemCount}
                onViewCart={handleViewCart}
            />

            {/* Floating Cart Button — always visible */}
            {cartItemCount > 0 && (
                <button
                    onClick={handleViewCart}
                    className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-xl hover:bg-primary/90 transition-all active:scale-95"
                    aria-label="View cart"
                >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="font-semibold text-sm">{cartItemCount > 99 ? '99+' : cartItemCount}</span>
                </button>
            )}
        </div>
    );
};


export default Guest