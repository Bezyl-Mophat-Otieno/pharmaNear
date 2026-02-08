
import { useState } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShoppingCart, X, Search, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { productStatus } from '@/types/product';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const filteredItems = wishlistItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    removeFromWishlist(productId);
    toast({
      title: "Removed from wishlist",
      description: `${productName} has been removed from your wishlist.`,
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-4">
            My Wishlist
          </h1>
          <p className="text-lg text-muted-foreground">
            Your favorite products saved for later
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {filteredItems.length === 0 && wishlistItems.length > 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No items found matching your search.
            </p>
          </div>
        )}

        {wishlistItems.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold mb-4">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Start adding products you love to your wishlist!
            </p>
            <Button asChild>
              <a href="/products">Browse Products</a>
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((product) => {
            const isAvailable = product.status === productStatus.available && product.stock > 0
            return (
              <Card key={product.product_id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                <div className="relative overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 bg-white/80 hover:bg-white text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveFromWishlist(product.product_id, product.name)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-playfair font-semibold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      KSh {product.selling_price}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${isAvailable
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                      {isAvailable ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Button
                    className="w-full btn-primary"
                    disabled={!isAvailable}
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
