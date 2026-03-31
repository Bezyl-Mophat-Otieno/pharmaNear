import { useState, useEffect } from 'react';
import { Product, ProductSearchPagination } from '@/types/product';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    X, Package, ShoppingCart, Loader2, Navigation,
    SlidersHorizontal, ChevronLeft, ChevronRight,
} from 'lucide-react';
import GuestProductCard from './GuestProductCard';
import api from '@/lib/api';
import { GuestSearchFilters } from '@/hooks/useGuestSearch';

interface Seller { business_id: string; business_name: string; }
interface Category { category_id: string; name: string; }


interface SearchResultsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    results: Product[];
    isLoading: boolean;
    searchQuery: string;
    pagination: ProductSearchPagination | null;
    currentPage: number;
    filters: GuestSearchFilters;
    onFiltersChange: (f: GuestSearchFilters) => void;
    onPageChange: (page: number) => void;
    onAddToCart: (product: Product, quantity: number) => void;
    cartItemCount: number;
    onViewCart: () => void;
}

const SearchResultsDrawer = ({
    isOpen, onClose,
    results, isLoading, searchQuery,
    pagination, currentPage,
    filters, onFiltersChange, onPageChange,
    onAddToCart, cartItemCount, onViewCart,
}: SearchResultsDrawerProps) => {
    const [showFilters, setShowFilters] = useState(false);
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [manufacturers, setManufacturers] = useState<string[]>([]);

    useEffect(() => {
        if (!isOpen) return;
        api.get('/sellers').then(r => setSellers(r.data?.data ?? [])).catch(() => { });
        api.get('/categories').then(r => setCategories(Array.isArray(r.data) ? r.data : [])).catch(() => { });
        api.get('/products/manufacturers').then(r => {
            setManufacturers(Array.isArray(r.data.data) ? r.data.data : [])
        }).catch(() => { });

    }, [isOpen]);



    const hasDistanceData = results.length > 0 && results[0].distance_km !== undefined;
    const activeFilterCount = [filters.business_id, filters.requires_prescription !== undefined ? 'x' : '', filters.category_id]
        .filter(Boolean).length;

    const handleFilterChange = (key: keyof GuestSearchFilters, value: string) => {
        const updated: GuestSearchFilters = { ...filters };
        if (key === 'requires_prescription') {
            if (value === 'all') delete updated.requires_prescription;
            else updated.requires_prescription = value === 'yes';
        } else if (key === 'business_id' || key === 'category_id' || key === "manufacturer") {
            if (value === 'all') delete updated[key];
            else updated[key] = value;
        }
        onFiltersChange(updated);
        onPageChange(1);
    };

    const clearFilters = () => {
        onFiltersChange({});
        onPageChange(1);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:w-[460px] p-0 flex flex-col">
                {/* Header */}
                <SheetHeader className="p-4 pb-2 border-b flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <SheetTitle className="text-lg">Search Results</SheetTitle>
                            {searchQuery && !isLoading && (
                                <div className="space-y-0.5 mt-0.5">
                                    <p className="text-sm text-muted-foreground">
                                        {pagination ? `${pagination.total} result${pagination.total !== 1 ? 's' : ''}` : `${results.length} result${results.length !== 1 ? 's' : ''}`} for "{searchQuery}"
                                    </p>
                                    {hasDistanceData && (
                                        <div className="flex items-center gap-1 text-xs text-primary">
                                            <Navigation className="h-3 w-3" />
                                            <span>Sorted by price · distance</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant={showFilters ? 'default' : 'ghost'}
                                size="sm"
                                className="relative h-8 px-2"
                                onClick={() => setShowFilters(v => !v)}
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Secondary filters panel */}
                    {showFilters && (
                        <div className="mt-3 pt-3 border-t space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Filters</span>
                                {activeFilterCount > 0 && (
                                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={clearFilters}>
                                        Clear all
                                    </Button>
                                )}
                            </div>

                            {/* Prescription */}
                            <Select
                                value={filters.requires_prescription === undefined ? 'all' : filters.requires_prescription ? 'yes' : 'no'}
                                onValueChange={v => handleFilterChange('requires_prescription', v)}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Prescription: Any" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Prescription: Any</SelectItem>
                                    <SelectItem value="yes">Prescription required</SelectItem>
                                    <SelectItem value="no">No prescription needed</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Seller */}
                            <Select
                                value={filters.business_id ?? 'all'}
                                onValueChange={v => handleFilterChange('business_id', v)}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="All sellers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All sellers</SelectItem>
                                    {sellers.map(s => (
                                        <SelectItem key={s.business_id} value={s.business_id}>
                                            {s.business_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Category */}
                            <Select
                                value={filters.category_id ?? 'all'}
                                onValueChange={v => handleFilterChange('category_id', v)}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All categories</SelectItem>
                                    {categories.map(c => (
                                        <SelectItem key={c.category_id} value={c.category_id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* Manufucturer */}
                            <Select
                                value={filters.manufacturer ?? 'all'}
                                onValueChange={v => handleFilterChange('manufacturer', v)}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="All Manufacturers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Manufacturers</SelectItem>
                                    {manufacturers.map((m, index) => (
                                        <SelectItem key={index} value={m}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <p className="text-[11px] text-muted-foreground">
                                Results sorted by lowest price first{hasDistanceData ? ', then closest to you' : ''}.
                            </p>
                        </div>
                    )}
                </SheetHeader>

                {/* Loading */}
                {isLoading && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                        <div className="relative">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <div className="absolute inset-0 h-12 w-12 animate-ping opacity-20 rounded-full bg-primary" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium">Searching products...</p>
                            <p className="text-sm text-muted-foreground mt-1">Finding the best matches for you</p>
                        </div>
                    </div>
                )}

                {/* Results */}
                {!isLoading && results.length > 0 && (
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-3">
                            {results.map(product => (
                                <GuestProductCard
                                    key={product.product_id}
                                    product={product}
                                    onAddToCart={onAddToCart}
                                />
                            ))}
                        </div>

                        {/* Pagination inside scroll area */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 px-4 pb-4">
                                <Button
                                    variant="outline" size="sm"
                                    disabled={currentPage <= 1}
                                    onClick={() => onPageChange(currentPage - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    {currentPage} / {pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline" size="sm"
                                    disabled={currentPage >= pagination.totalPages}
                                    onClick={() => onPageChange(currentPage + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </ScrollArea>
                )}

                {/* Empty */}
                {!isLoading && results.length === 0 && searchQuery && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium">No products found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Try adjusting your search or filters
                            </p>
                        </div>
                    </div>
                )}

                {/* Cart footer */}
                {cartItemCount > 0 && (
                    <div className="p-4 border-t flex-shrink-0 bg-background">
                        <Button className="w-full" size="lg" onClick={onViewCart}>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            View Cart
                            <Badge variant="secondary" className="ml-2">{cartItemCount}</Badge>
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default SearchResultsDrawer;
