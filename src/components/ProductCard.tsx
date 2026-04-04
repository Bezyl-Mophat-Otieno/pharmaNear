import { Product, productStatus } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ShoppingCart, Heart, Star, MapPin, Navigation,
  Building2, Pill, FlaskConical, FileText, Tag,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductRatingModal from '@/components/ProductRatingModal';
import LocationMapModal from '@/components/LocationMapModal';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const isAvailable = product.status === productStatus.available && product.stock > 0;
  const hasLocation = product.latitude !== undefined && product.longitude !== undefined;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addItem(product);
    toast({ title: 'Added to cart!', description: `${product.name} has been added to your cart.` });
  };

  const handleBuyNow = () => {
    if (!isAvailable) return;
    addItem(product);
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.product_id)) {
      removeFromWishlist(product.product_id);
      toast({ title: 'Removed from wishlist', description: `${product.name} removed.` });
    } else {
      addToWishlist(product);
      toast({ title: 'Added to wishlist!', description: `${product.name} added.` });
    }
  };

  const averageRating = (() => {
    const reviews = JSON.parse(localStorage.getItem(`reviews-${product.product_id}`) || '[]');
    if (!reviews.length) return 0;
    return reviews.reduce((a: number, r: any) => a + r.rating, 0) / reviews.length;
  })();

  return (
    <TooltipProvider>
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover-scale relative cursor-pointer flex flex-col">

        {/* ── Image ── */}
        <div className="relative overflow-hidden">
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            onClick={() => navigate(`/product/${product.product_id}`)}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
          />

          {/* Category badge */}
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium text-white bg-primary">
            {product.category_name}
          </div>

          {/* Prescription badge */}
          {product.requires_prescription && (
            <div className="absolute top-3 left-3 mt-6 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-amber-500">
              Rx Required
            </div>
          )}

          {/* Rate button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon"
                className="absolute top-3 right-14 bg-white/80 hover:bg-white text-yellow-500 hover:text-yellow-600 z-10"
                onClick={() => setShowRatingModal(true)}>
                <Star className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left"><p>Rate this product</p></TooltipContent>
          </Tooltip>

          {/* Wishlist button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon"
                className={`absolute top-3 right-3 z-10 ${isInWishlist(product.product_id)
                  ? 'text-red-500 bg-white/80 hover:bg-white'
                  : 'text-gray-500 bg-white/80 hover:bg-white hover:text-red-500'}`}
                onClick={handleWishlistToggle}>
                <Heart className={`h-4 w-4 ${isInWishlist(product.product_id) ? 'fill-current' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isInWishlist(product.product_id) ? 'Remove from wishlist' : 'Add to wishlist'}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* ── Content ── */}
        <CardContent className="p-4 cursor-pointer flex-1" onClick={() => navigate(`/product/${product.product_id}`)}>
          <h3 className="font-playfair font-semibold text-lg mb-1 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Seller */}
          {product.business_name && (
            <div className="flex items-center gap-1 mb-2">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">{product.business_name}</span>
              {product.address && (
                <span className="text-xs text-muted-foreground truncate">· {product.address}</span>
              )}
            </div>
          )}

          {/* Pharmacy fields */}
          <div className="flex flex-wrap gap-1 mb-2">
            {product.dosage_form && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Pill className="h-3 w-3" />{product.dosage_form}
              </Badge>
            )}
            {product.strength && (
              <Badge variant="secondary" className="text-xs gap-1">
                <FlaskConical className="h-3 w-3" />{product.strength}
              </Badge>
            )}
            {product.manufacturer && (
              <Badge variant="outline" className="text-xs gap-1">
                <Tag className="h-3 w-3" />{product.manufacturer}
              </Badge>
            )}
            {product.sub_category_name && (
              <Badge variant="outline" className="text-xs">{product.sub_category_name}</Badge>
            )}
          </div>

          {/* Prescription warning */}
          {product.requires_prescription && (
            <div className="flex items-start gap-1.5 p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-2">
              <FileText className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 dark:text-amber-300">Prescription required</p>
            </div>
          )}

          {/* Distance */}
          {product.distance_km !== undefined && (
            <div className="flex items-center gap-1 mb-2">
              <Navigation className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">
                {product.distance_km < 1
                  ? `${(product.distance_km * 1000).toFixed(0)}m away`
                  : `${product.distance_km.toFixed(2)} km away`}
              </span>
            </div>
          )}

          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>

          {averageRating > 0 && (
            <div className="flex items-center mb-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-muted-foreground ml-1">{averageRating.toFixed(1)} rating</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              KSh {Number(product.selling_price).toLocaleString()}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${isAvailable
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
              {isAvailable ? 'Available' : 'Out of Stock'}
            </span>
          </div>
        </CardContent>

        {/* ── Footer ── */}
        <CardFooter className="p-4 pt-0 space-y-2 flex-col">
          <div className="w-full flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="flex-1 btn-primary" disabled={!isAvailable} onClick={handleAddToCart}>
                  <ShoppingCart className="h-4 w-4 mr-2" />Add to Cart
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Add {product.name} to your cart</p></TooltipContent>
            </Tooltip>
            <Button variant="secondary" className="flex-1" disabled={!isAvailable} onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>

          {hasLocation && (
            <Button variant="outline" size="sm" className="w-full"
              onClick={(e) => { e.stopPropagation(); setShowLocationModal(true); }}>
              <MapPin className="h-4 w-4 mr-2" />View Seller Location
            </Button>
          )}
        </CardFooter>
      </Card>

      <ProductRatingModal product={product} isOpen={showRatingModal} onClose={() => setShowRatingModal(false)} />
      <LocationMapModal
        isOpen={showLocationModal} onClose={() => setShowLocationModal(false)}
        businessName={product.business_name}
        latitude={product.latitude} longitude={product.longitude}
        address={product.address} distance={product.distance_km}
      />
    </TooltipProvider>
  );
};

export default ProductCard;
