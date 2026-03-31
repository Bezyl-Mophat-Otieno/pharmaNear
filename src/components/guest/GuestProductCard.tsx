import { Product, productStatus } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, MapPin, Star, Plus, Minus, Navigation } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationMapModal from '@/components/LocationMapModal';

interface GuestProductCardProps {
    product: Product;
    onAddToCart: (product: Product, quantity: number) => void;
}

const GuestProductCard = ({ product, onAddToCart }: GuestProductCardProps) => {
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const isAvailable = product.status === productStatus.available && product.stock > 0

    const handleAddToCart = () => {
        if (!isAvailable) return;
        onAddToCart(product, quantity);
        setQuantity(1);
    };

    const handleViewDetails = () => {
        navigate(`/product/${product.product_id}`);
    };

    // Get the display price
    const displayPrice = Number.parseFloat(product.selling_price || '0');

    // Get the image
    const productImage = (product.images && product.images[0]) || '/placeholder.svg';

    // Check if location data is available
    const hasLocation = product.latitude !== undefined && product.longitude !== undefined;

    return (
        <>
            <Card className="group overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex gap-3 p-3">
                    {/* Product Image */}
                    <div
                        className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer"
                        onClick={handleViewDetails}
                    >
                        <img
                            src={productImage}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                        <h3
                            className="font-medium text-sm line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                            onClick={handleViewDetails}
                        >
                            {product.name}
                        </h3>

                        {product.business_name && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                <span className="font-medium font-black">Sold by:</span> {`${product.business_name} (${product.address})`}
                            </p>
                        )}
                        {product.manufacturer && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                <span className="font-medium font-black">Manufuctured by:</span> {product.manufacturer}
                            </p>
                        )}

                        {/* Distance Badge */}
                        {product.distance_km !== undefined && (
                            <div className="flex items-center gap-1 mt-1">
                                <Navigation className="h-3 w-3 text-primary" />
                                <span className="text-xs font-medium text-primary">
                                    {product.distance_km < 1
                                        ? `${(product.distance_km * 1000).toFixed(0)}m away`
                                        : `${product.distance_km.toFixed(2)} km away`
                                    }
                                </span>
                            </div>
                        )}

                        {product.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {product.description}
                            </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                            <span className="text-base font-bold text-primary">
                                KSh {displayPrice.toLocaleString()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${isAvailable
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                {isAvailable ? 'Available' : 'Out of Stock'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <CardContent className="p-3 pt-0 space-y-2">
                    <div className="flex items-center gap-2">
                        {/* Quantity Selector */}
                        <div className="flex items-center border rounded-lg">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>

                        {/* Add to Cart */}
                        <Button
                            className="flex-1 h-8 text-sm"
                            disabled={!isAvailable}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                            Add to Cart
                        </Button>
                    </div>

                    {/* View Location Button */}
                    {hasLocation && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs"
                            onClick={() => setShowLocationModal(true)}
                        >
                            <MapPin className="h-3.5 w-3.5 mr-1.5" />
                            View Location
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Location Modal */}
            <LocationMapModal
                isOpen={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                businessName={product.business_name}
                latitude={product.latitude}
                longitude={product.longitude}
                address={product.address}
                distance={product.distance_km}
            />
        </>
    );
};

export default GuestProductCard;