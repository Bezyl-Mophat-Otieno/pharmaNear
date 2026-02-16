import { Product, productStatus } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, MapPin, Star, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
interface GuestProductCardProps {
    product: Product;
    onAddToCart: (product: Product, quantity: number) => void;
}
const GuestProductCard = ({ product, onAddToCart }: GuestProductCardProps) => {
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
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
    return (
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
                            <span className="font-medium">Sold by:</span> {product.business_name}
                        </p>
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
            <CardContent className="p-3 pt-0">
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
            </CardContent>
        </Card>
    );
};
export default GuestProductCard;