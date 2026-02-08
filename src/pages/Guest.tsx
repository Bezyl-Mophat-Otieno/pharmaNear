import { useState, useEffect, FormEvent } from 'react';
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
    ArrowRight
} from 'lucide-react';
import { useGuestSearch } from '@/hooks/useGuestSearch';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types/product';
import SearchResultsDrawer from '@/components/guest/SearchResultsDrawer';
import { useProducts } from '@/hooks/useProducts';
import SellerCallout from '@/components/seller/SellerCallout';
const Guest = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { items, addItem } = useCart();
    const [showLocationInput, setShowLocationInput] = useState(false);
    const {
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
    } = useGuestSearch();
    // Show location input if permission denied and distance sorting enabled
    useEffect(() => {
        if (locationState.permission === 'denied' && locationState.distanceSortingEnabled) {
            setShowLocationInput(true);
        }
    }, [locationState.permission, locationState.distanceSortingEnabled]);
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
    const handleRequestLocation = async () => {
        const granted = await requestLocation();
        if (granted) {
            toast({
                title: "Location enabled",
                description: "We'll show you products sorted by distance.",
            });
        }
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
                                    disabled={!searchQuery.trim() || isSearching}
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
                        </form>
                        {/* Location Controls */}
                        <Card className="bg-background/80 backdrop-blur-sm border shadow-sm mb-8">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    {/* Location Status */}
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${locationState.permission === 'granted'
                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-muted text-muted-foreground'
                                            }`}>
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium">
                                                {locationState.permission === 'granted'
                                                    ? 'Location enabled'
                                                    : locationState.permission === 'denied'
                                                        ? 'Location disabled'
                                                        : 'Enable location'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {locationState.permission === 'granted'
                                                    ? 'Sorting by distance is active'
                                                    : 'For distance-based sorting'}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Location Actions */}
                                    {locationState.permission !== 'granted' && (
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            {locationState.permission === 'not-requested' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleRequestLocation}
                                                    className="flex-1 sm:flex-none"
                                                >
                                                    <Navigation className="h-4 w-4 mr-2" />
                                                    Enable
                                                </Button>
                                            )}

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
                                    )}
                                </div>
                                {/* Manual Location Input */}
                                {showLocationInput && locationState.distanceSortingEnabled && (
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="flex items-start gap-2 mb-3">
                                            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                                            <p className="text-xs text-muted-foreground">
                                                Location access was denied. Please enter your location manually for distance sorting.
                                            </p>
                                        </div>
                                        <Input
                                            placeholder="Enter your area or address (e.g., Westlands, Nairobi)"
                                            value={locationState.manualAddress}
                                            onChange={(e) => setManualAddress(e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>
                                )}
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
                onAddToCart={handleAddToCart}
                cartItemCount={cartItemCount}
                onViewCart={handleViewCart}
            />
        </div>
    );
};


export default Guest