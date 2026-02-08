
import HeroSection from '@/components/HeroSection';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { products, loading } = useProducts();
  const featuredProducts = products.filter(product => product.is_featured);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <section id="featured-products" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-muted-foreground">
              Top-rated favorites chosen by our customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading featured products...</span>
                </div>
              </div>
            ) : (
              featuredProducts.map((product) => (
                <div key={product.product_id} className="animate-fade-in">
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="btn-primary">
              <Link to="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>


      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">
            About Shamsy
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            At Shamsy we keep things stylish, simple, and budget-friendly. From everyday fashion to elegant home décor, we offer quality pieces that add charm, color, and comfort to your space.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
