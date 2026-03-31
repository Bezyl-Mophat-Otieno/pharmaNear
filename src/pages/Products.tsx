import { useState, useEffect, useCallback, useRef } from 'react';
import { useProducts, SearchFilters } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import CategoryTabs from '@/components/CategoryTabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

interface Seller { business_id: string; business_name: string; }
interface Category { category_id: string; name: string; }

const PAGE_SIZE = 10;

const Products = () => {
  const { products, pagination, loading, error, searchProducts, getProductsByCategory, refetch } = useProducts();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  // Primary filter
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Category tabs
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState('all');

  // Secondary filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterSeller, setFilterSeller] = useState('');
  const [filterPrescription, setFilterPrescription] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Pagination
  const [page, setPage] = useState(1);

  // Filter data
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // User location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch sellers + categories for filter dropdowns
  useEffect(() => {
    api.get('/sellers').then(r => setSellers(r.data?.data ?? [])).catch(() => { });
    api.get('/categories').then(r => setCategories(Array.isArray(r.data) ? r.data : [])).catch(() => { });
    navigator.geolocation?.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { }
    );
  }, []);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  // Run search whenever query, filters, or page changes
  const runSearch = useCallback(() => {
    if (!debouncedQuery && activeCategory === 'all' && !filterSeller && !filterPrescription && !filterCategory) {
      refetch();
      return;
    }

    const filters: SearchFilters = {
      page,
      limit: PAGE_SIZE,
      ...(userLocation && { latitude: userLocation.lat, longitude: userLocation.lng }),
      ...(filterSeller && { business_id: filterSeller }),
      ...(filterPrescription && { requires_prescription: filterPrescription === 'yes' }),
      ...(filterCategory && { category_id: filterCategory }),
    };

    if (debouncedQuery) {
      searchProducts(debouncedQuery, filters);
    } else if (activeCategory !== 'all') {
      getProductsByCategory(activeCategory);
    }
  }, [debouncedQuery, activeCategory, filterSeller, filterPrescription, filterCategory, page, userLocation]);

  useEffect(() => { runSearch(); }, [runSearch]);

  // Reset page when filters/query change
  useEffect(() => { setPage(1); }, [debouncedQuery, filterSeller, filterPrescription, filterCategory, activeCategory]);

  const filteredProducts = products.filter(p =>
    activeSubcategory === 'all' || p.sub_category_id === activeSubcategory
  );

  const activeFilterCount = [filterSeller, filterPrescription, filterCategory].filter(Boolean).length;

  const clearFilters = () => {
    setFilterSeller('');
    setFilterPrescription('');
    setFilterCategory('');
  };

  const totalPages = pagination?.totalPages ?? 1;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading products..." />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen py-8 pb-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-3">Our Products</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Search by drug name, then narrow down with filters
          </p>
        </div>

        {/* ── Search + Filter toggle ── */}
        <div className="flex gap-2 max-w-2xl mx-auto mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by drug / product name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(v => !v)}
            className="relative shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* ── Secondary filters panel ── */}
        {showFilters && (
          <div className="max-w-2xl mx-auto mb-6 p-4 border rounded-lg bg-muted/30 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Secondary Filters</span>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                  <X className="h-3 w-3 mr-1" /> Clear all
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Seller filter */}
              <Select value={filterSeller || 'all'} onValueChange={v => setFilterSeller(v === 'all' ? '' : v)}>
                <SelectTrigger>
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

              {/* Prescription filter */}
              <Select value={filterPrescription || 'all'} onValueChange={v => setFilterPrescription(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Prescription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="yes">Prescription required</SelectItem>
                  <SelectItem value="no">No prescription needed</SelectItem>
                </SelectContent>
              </Select>

              {/* Category filter */}
              <Select value={filterCategory || 'all'} onValueChange={v => setFilterCategory(v === 'all' ? '' : v)}>
                <SelectTrigger>
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
            </div>

            <p className="text-xs text-muted-foreground">
              Results are sorted by lowest price first
              {userLocation ? ', then closest to you.' : '.'}
            </p>
          </div>
        )}

        <CategoryTabs
          activeCategory={activeCategory}
          activeSubcategory={activeSubcategory}
          onCategoryChange={setActiveCategory}
          onSubcategoryChange={setActiveSubcategory}
        />

        {/* ── Product grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredProducts.map(product => (
            <div key={product.product_id} className="animate-fade-in">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
              {pagination.total > 0 && ` · ${pagination.total} results`}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* ── Floating Cart Button — always visible ── */}
      <button
        onClick={() => navigate('/cart')}
        style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999 }}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-xl hover:bg-primary/90 transition-all active:scale-95"
        aria-label="Open cart"
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="font-semibold text-sm">{itemCount > 99 ? '99+' : itemCount}</span>
        )}
      </button>
    </div>
  );
};

export default Products;
