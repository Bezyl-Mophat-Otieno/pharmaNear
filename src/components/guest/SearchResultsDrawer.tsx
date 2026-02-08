import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { X, Package, ShoppingCart, Loader2 } from 'lucide-react';
import GuestProductCard from './GuestProductCard';
import ProductCard from '../ProductCard';
interface SearchResultsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    results: Product[];
    isLoading: boolean;
    searchQuery: string;
    onAddToCart: (product: Product, quantity: number) => void;
    cartItemCount: number;
    onViewCart: () => void;
}
const SearchResultsDrawer = ({
    isOpen,
    onClose,
    results,
    isLoading,
    searchQuery,
    onAddToCart,
    cartItemCount,
    onViewCart,
}: SearchResultsDrawerProps) => {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="w-full sm:w-[420px] p-0 flex flex-col"
            >
                {/* Header */}
                <SheetHeader className="p-4 pb-2 border-b flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <SheetTitle className="text-lg">Search Results</SheetTitle>
                            {searchQuery && !isLoading && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {results.length} result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
                                </p>
                            )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </SheetHeader>
                {/* Loading State */}
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
                            {results.map((product) => (
                                <GuestProductCard
                                    key={product.product_id}
                                    product={product}
                                    onAddToCart={onAddToCart}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                )}
                {/* Empty State */}
                {!isLoading && results.length === 0 && searchQuery && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium">No products found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Try adjusting your search terms or browse our categories
                            </p>
                        </div>
                    </div>
                )}
                {/* Cart Footer */}
                {cartItemCount > 0 && (
                    <div className="p-4 border-t flex-shrink-0 bg-background">
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={onViewCart}
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            View Cart
                            <Badge variant="secondary" className="ml-2">
                                {cartItemCount}
                            </Badge>
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
export default SearchResultsDrawer;