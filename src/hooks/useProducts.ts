import { useState, useEffect, useCallback } from 'react';
import { Product, ProductSearchPagination } from '@/types/product';
import { productService } from '@/services/productService';

export interface SearchFilters {
  latitude?: number;
  longitude?: number;
  page?: number;
  limit?: number;
  business_id?: string;
  requires_prescription?: boolean;
  category_id?: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<ProductSearchPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts();
      setProducts(response.data as Product[]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const getProductsByCategory = async (category: string) => {
    try {
      setLoading(true);
      const response = await productService.getProductsByCategory(category);
      setProducts(response.data as Product[]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products by category');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query: string, filters: SearchFilters = {}) => {
    try {
      setLoading(true);
      const response = await productService.searchProducts(query, filters);
      setProducts(response.data as Product[]);
      setPagination(response.pagination ?? null);
      setError(null);
    } catch (err) {
      setError('Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    pagination,
    loading,
    error,
    refetch: fetchProducts,
    getProductsByCategory,
    searchProducts,
  };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id || id.trim() === '') { setLoading(false); return; }
    try {
      setLoading(true);
      const data = await productService.getProduct(id);
      setProduct(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
};
