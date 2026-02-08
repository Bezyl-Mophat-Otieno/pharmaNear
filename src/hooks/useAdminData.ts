import { useState, useEffect } from 'react';
import { productService } from '@/services/productService';
import { orderService, } from '@/services/orderService';
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from '@/types/order';
import { transactionService } from '@/services/transactionService';
import { stockService, StockProduct, StockStats } from '@/services/stockService';
import { Category, categoryService, Subcategory } from '@/services/categoryService';
import { Product } from '@/types/product';
import { ApiResponse } from '@/types';
import { FinancialSummary, Transaction, TransactionType } from '@/types/transaction';

export const useAdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts();
      const data = response.data as Product[];
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await productService.createProduct(productData);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const updatedProduct = await productService.updateProduct(id, productData);
      setProducts(prev => prev.map(p => p.product_id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    setDeleting(true);
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.product_id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  const updateStock = async (id: string, stock: number) => {
    try {
      const updatedProduct = await productService.updateStock(id, stock);
      setProducts(prev => prev.map(p => p.product_id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      console.error('Error updating stock:', err);
      throw err;
    }
  };

  const uploadImages = async (files: File[]) => {
    try {
      return await productService.uploadImages(files);
    } catch (err) {
      console.error('Error uploading images:', err);
      throw err;
    }
  };

  return {
    products,
    loading,
    deleting,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    uploadImages,
  };
};

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      setOrders(response.data as Order[]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const response: ApiResponse  = await orderService.updateOrderStatus(id, status);
      if (response.success && response.data) {
        const updatedOrder = response.data as Order;
        setOrders(prev => prev.map(order => 
          order.orderId === id ? updatedOrder : order
        ));
        return updatedOrder;
      }
      throw new Error(response.message || 'Failed to update order status');
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  const updatePaymentStatus = async (id: string, paymentStatus: PaymentStatus ) => {
    try {
      const response: ApiResponse = await orderService.updatePaymentStatus(id, paymentStatus);
      if (response.success && response.data) {
        const updatedOrder = response.data as Order;
        setOrders(prev => prev.map(order => 
          order.orderId === id ? updatedOrder : order
        ));
        return updatedOrder;
      }
      throw new Error(response.message || 'Failed to update order payment status');
    } catch (err) {
      console.error('Error updating payment status:', err);
      throw err;
    }
  };

  const cancelOrder = async (id: string, reason?: string) => {
    try {
      const response: ApiResponse = await orderService.cancelOrder(id);
      if (response.success && response.data) {
        const cancelledOrder = response.data as Order;
        setOrders(prev => prev.map(order => 
          order.orderId === id ? cancelledOrder : order
        ));
        return cancelledOrder;
      }
      throw new Error(response.message || 'Failed to cancel order');
    } catch (err) {
      console.error('Error cancelling order:', err);
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
  };
};

export const useAdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (filters?: {
    status?: string;
    transactionType?: string;
    methodOfPayment?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      const response: ApiResponse = await transactionService.getTransactions(filters);

      if (response.success && response.data) {
        setTransactions(response.data as Transaction[]);
        return response.data 
      }
      throw new Error(response.message || 'Failed to fetch transactions');
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionStats = async () => {
    try {
      const response = await transactionService.getTransactionStats();
      setStats(response.data as FinancialSummary);
    } catch (err) {
      console.error('Error fetching transaction stats:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchTransactionStats();
  }, []);

  const createTransaction = async (transactionData: {
    orderId: string;
    customerFullname: string;
    customerEmail: string;
    customerPhone?: string;
    methodOfPayment: string;
    transactionType?: TransactionType;
    totalAmount: number;
    totalAmountReceived?: number;
    notes?: string;
  }) => {
    try {
      const response: ApiResponse = await transactionService.createTransaction(transactionData);
      if (response.success && response.data) {
      await fetchTransactions(); // Refresh the list
      return response.data;
      }
      throw new Error(response.message || 'Failed to create the Transaction.');
    } catch (err) {
      console.error('Error creating transaction:', err);
      throw err;
    }
  };

  const updateTransactionStatus = async (id: string, status: string) => {
    try {
      const response = await transactionService.updateTransactionStatus(id, status);
      setTransactions(prev => prev.map((transaction: any) => 
        transaction.transaction_id === id ? { ...transaction, payment_status: status } : transaction
      ));
      return response.data;
    } catch (err) {
      console.error('Error updating transaction status:', err);
      throw err;
    }
  };

  const reconcileTransaction = async (id: string, notes?: string) => {
    try {
      const response = await transactionService.reconcileTransaction(id, notes);
      setTransactions(prev => prev.map((transaction: any) => 
        transaction.transaction_id === id 
          ? { ...transaction, reconcilled: true, payment_status: 'paid' } 
          : transaction
      ));
      return response.data;
    } catch (err) {
      console.error('Error reconciling transaction:', err);
      throw err;
    }
  };

  const createRefund = async (id: string, refundAmount: number, reason: string) => {
    try {
      const response = await transactionService.createRefund(id, refundAmount, reason);
      await fetchTransactions(); // Refresh to show the new refund transaction
      return response.data;
    } catch (err) {
      console.error('Error creating refund:', err);
      throw err;
    }
  };

  const getTransactionsByOrderId = async (orderId: string) => {
    try {
      const response = await transactionService.getTransactionsByOrderId(orderId);
      return response.data;
    } catch (err) {
      console.error('Error fetching order transactions:', err);
      throw err;
    }
  };

  const exportTransactions = async (dateRange?: { from: string; to: string }) => {
    try {
      return await transactionService.exportTransactions(dateRange);
    } catch (err) {
      console.error('Error exporting transactions:', err);
      throw err;
    }
  };

  return {
    transactions,
    stats,
    loading,
    error,
    refetch: fetchTransactions,
    fetchTransactionStats,
    createTransaction,
    updateTransactionStatus,
    reconcileTransaction,
    createRefund,
    getTransactionsByOrderId,
    exportTransactions,
  };
};

export const useAdminStock = () => {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [topSellers, setTopSellers] = useState<StockProduct[]>([]);
  const [stats, setStats] = useState<StockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockData = async (filters?: {
    search?: string;
    categoryId?: string;
    status?: 'all' | 'out-of-stock' | 'low-stock' | 'in-stock';
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      const response = await stockService.getStockData(filters);
      setProducts(response.data as StockProduct[] || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockStats = async () => {
    try {
      const response = await stockService.getStockStats();
      setStats(response.data as StockStats);
    } catch (err) {
      console.error('Error fetching stock stats:', err);
    }
  };

  const getTopSellingProducts = async (limit = 10) => {
    try {
      const response = await stockService.getTopSellingProducts({ limit });
      return response.data;
    } catch (err) {
      console.error('Error fetching top selling products:', err);
      throw err;
    }
  };

  const getLowStockProducts = async (limit = 20) => {
    try {
      const response = await stockService.getLowStockProducts({ limit });
      return response.data;
    } catch (err) {
      console.error('Error fetching low stock products:', err);
      throw err;
    }
  };

  const getOutOfStockProducts = async (limit = 20) => {
    try {
      const response = await stockService.getOutOfStockProducts({ limit });
      return response.data;
    } catch (err) {
      console.error('Error fetching out of stock products:', err);
      throw err;
    }
  };

  const updateProductStock = async (productId: string, newStock: number, reason?: string) => {
    try {
      const response = await stockService.updateProductStock(productId, newStock, reason);
      // Update the product in the local state
      setProducts(prev => prev.map(product => 
        product.product_id === productId 
          ? { ...product, stock: newStock }
          : product
      ));
      return response.data;
    } catch (err) {
      console.error('Error updating product stock:', err);
      throw err;
    }
  };

  const restockProduct = async (productId: string, quantity: number, reason?: string) => {
    try {
      const response = await stockService.restockProduct(productId, quantity, reason);
      // Update the product in the local state
      setProducts(prev => prev.map(product => 
        product.product_id === productId 
          ? { ...product, stock: product.stock + quantity }
          : product
      ));
      // Refresh stats after restocking
      await fetchStockStats();
      return response.data;
    } catch (err) {
      console.error('Error restocking product:', err);
      throw err;
    }
  };

const fetchTopSellers = async () => {
try {
  const topSellingProducts = await getTopSellingProducts(5);
  setTopSellers(topSellingProducts as StockProduct[]);
} catch (err) {
  console.error('Error fetching top sellers:', err);
}
};

  useEffect(() => {
    fetchStockData();
    fetchStockStats();
    fetchTopSellers();
  }, []);

  return {
    products,
    topSellers,
    stats,
    loading,
    error,
    refetch: fetchStockData,
    fetchStockStats,
    getTopSellingProducts,
    getLowStockProducts,
    getOutOfStockProducts,
    updateProductStock,
    restockProduct,
  };
};

export const useAdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCategories, setaddingCategories] = useState(false);
  const [addingSubCategories, setaddingSubCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: Category) => {
    setaddingCategories(true)
    try {
      const newCategory = await categoryService.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    } finally{
      setaddingCategories(false)
    }
  };

  const updateCategory = async (id: string, categoryData: Category) => {
    try {
      const updatedCategory = await categoryService.updateCategory(id, categoryData);
      setCategories(prev => prev.map((cat: Category) => 
        cat.category_id === id ? updatedCategory : cat
      ));
      return updatedCategory;
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(prev => prev.filter((cat: Category) => cat.category_id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  const createSubcategory = async (subcategoryData: Subcategory) => {
    setaddingSubCategories(true)
    try {
      const category = categories.find((cat: Category) => cat.category_id === subcategoryData.category_id);
      const newSubcategory = await categoryService.createSubcategory(subcategoryData);
      if (category) {
        const updatedCategory = {
         ...category,
          subcategories: [...(category.subcategories || []), newSubcategory],
        };
        setCategories(prev => prev.map((cat: Category) =>
        cat.category_id === subcategoryData.category_id? updatedCategory : cat
      ));
      }
      return newSubcategory;
    } catch (err) {
      console.error('Error creating subcategory:', err);
      throw err;
    } finally{
       setaddingSubCategories(false)
    }
  };

  const updateSubcategory = async (id: string, subcategoryData: Subcategory) => {
    try {
      const updatedSubcategory = await categoryService.updateSubcategory(id, subcategoryData);
      categories.map((cat: Category) => {
        if (cat.category_id === subcategoryData.category_id) {
          return {
            ...cat,
            subcategories: cat.subcategories?.map((subcat: Subcategory) =>
              subcat.sub_category_id === id? updatedSubcategory : subcat
            ) || [],
          };
        }
        
      })
      return updatedSubcategory;
    } catch (err) {
      console.error('Error updating subcategory:', err);
      throw err;
    }
  };

  const deleteSubcategory = async (id: string) => {
    try {
      const category = categories.find((cat: Category) =>
        cat.subcategories?.some((subcat: Subcategory) => subcat.sub_category_id === id)
      );
      await categoryService.deleteSubcategory(id);

      if (category) {
        const updatedCategory = {
          ...category,
          subcategories: category.subcategories?.filter((subcat: Subcategory) => subcat.sub_category_id !== id) || [],
        };

        setCategories(prev => prev.map((cat: Category) =>
          cat.category_id === category.category_id? updatedCategory : cat
        ));
      }

    } catch (err) {
      console.error('Error deleting subcategory:', err);
      throw err;
    }
  };



  return {
    categories,
    loading,
    addingCategories,
    addingSubCategories,
    error,
    selectedCategory: categories.find((cat: Category) => cat.category_id === selectedCategoryId) || null,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    setSelectedCategoryId,
  };
};