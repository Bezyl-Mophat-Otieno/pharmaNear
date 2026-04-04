import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellerService } from '@/services/sellerService';
import { Product } from '@/types/product';
import ProductCard from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Package, Search, Store, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface BusinessInfo {
    business_id: string;
    business_name: string;
    address: string;
    business_type?: string;
    latitude?: number;
    longitude?: number;
}

export default function SellerStorefront() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { itemCount } = useCart();

    const [business, setBusiness] = useState<BusinessInfo | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [filtered, setFiltered] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!slug) return;
        (async () => {
            try {
                const res = await sellerService.getStorefront(slug);
                if (res.success && res.data) {
                    const { business: biz, products: prods } = res.data as { business: BusinessInfo; products: Product[] };
                    setBusiness(biz);
                    setProducts(prods);
                    setFiltered(prods);
                } else {
                    setNotFound(true);
                }
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        })();
    }, [slug]);

    useEffect(() => {
        if (!search.trim()) { setFiltered(products); return; }
        const q = search.toLowerCase();
        setFiltered(products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.manufacturer?.toLowerCase().includes(q) ||
            p.dosage_form?.toLowerCase().includes(q)
        ));
    }, [search, products]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" text="Loading store..." />
        </div>
    );

    if (notFound) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
            <Store className="h-16 w-16 text-muted-foreground" />
            <h1 className="text-2xl font-bold">Store not found</h1>
            <p className="text-muted-foreground max-w-sm">
                This store link may be incorrect or the pharmacy is no longer active on pharmaNear.
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* ── Store Header ── */}
            <div className="bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 py-10">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
                            <Store className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold">{business?.business_name}</h1>
                            {business?.address && (
                                <div className="flex items-center gap-1.5 mt-1 text-primary-foreground/80 text-sm">
                                    <MapPin className="h-4 w-4 shrink-0" />
                                    <span>{business.address}</span>
                                </div>
                            )}
                            {business?.business_type && (
                                <Badge variant="secondary" className="mt-2 bg-primary-foreground/20 text-primary-foreground border-0">
                                    {business.business_type}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-2xl font-bold">{products.length}</p>
                                <p className="text-sm text-primary-foreground/70">products available</p>
                            </div>
                            <Package className="h-8 w-8 text-primary-foreground/60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* ── Search ── */}
                <div className="relative max-w-md mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products in this store..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* ── Grid ── */}
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map(product => (
                            <div key={product.product_id} className="animate-fade-in">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-lg text-muted-foreground">No products found.</p>
                    </div>
                )}
            </div>

            {/* ── Floating Cart ── */}
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
}
