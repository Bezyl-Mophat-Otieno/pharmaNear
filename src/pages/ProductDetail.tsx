
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingCart, Heart, Star, Loader2, MapPin } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import ProductRatingModal from '@/components/ProductRatingModal';
import ProductReviews from '@/components/ProductReviews';
import { productStatus } from '@/types/product';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const { product, loading, error } = useProduct(id || '')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 h-96 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading product details..." />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }
  const isAvailable = product.status === productStatus.available && product.stock > 0

  const productImages = product.images;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addItem(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (!isAvailable) return;

    addItem(product);
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.product_id)) {
      removeFromWishlist(product.product_id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Added to wishlist!",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  const getAverageRating = () => {
    const reviews = JSON.parse(localStorage.getItem(`reviews-${product.product_id}`) || '[]');
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const averageRating = Number(getAverageRating());

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border">
              <img
                src={productImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedImageIndex(selectedImageIndex)}
              />
            </div>

            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-20 h-20 rounded-md border-2 overflow-hidden ${selectedImageIndex === index ? 'border-primary' : 'border-gray-200'
                      }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">
                  {product.category_name === 'fashion' ? 'Fashion' : 'Decor'}
                </Badge>
                {product.sub_category_id && (
                  <Badge variant="outline">
                    {product.sub_category_name}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-playfair font-bold mb-2">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                {averageRating > 0 && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm">
                      {averageRating.toFixed(1)} rating
                    </span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRatingModal(true)}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Rate Product
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.materials && (
              <div>
                <h3 className="font-semibold mb-2">Materials</h3>
                <p className="text-muted-foreground">{product.materials}</p>
              </div>
            )}

            {product.available_sizes && (
              <div>
                <h3 className="font-semibold mb-2">Dimensions</h3>
                <p className="text-muted-foreground">{product.available_sizes}</p>
              </div>
            )}

            {product.available_sizes && (
              <div>
                <h3 className="font-semibold mb-2">Specifications</h3>
                <div className="space-y-1">
                  {product.available_sizes.map((size, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{index}:</span>
                      <span>{size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-primary">
                  KSh {product.selling_price}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${isAvailable
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                  {isAvailable ? 'Available' : 'Out of Stock'}
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  disabled={!isAvailable}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>

                <Button
                  variant="secondary"
                  className="flex-1"
                  disabled={!isAvailable}
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlistToggle}
                  className={isInWishlist(product.product_id) ? 'text-red-500' : ''}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.product_id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <ProductReviews productId={product.product_id} />
        </div>
      </div>

      <ProductRatingModal
        product={product}
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
      />
    </div>
  );
};

export default ProductDetail;
