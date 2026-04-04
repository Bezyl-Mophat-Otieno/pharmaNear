import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package, AlertTriangle, X, TrendingUp, RotateCcw, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminStock } from '@/hooks/useAdminData';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StockProduct } from '@/services/stockService';
import { DataPagination } from '@/components/ui/data-pagination';

export default function StockManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [restocking, setRestocking] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'out-of-stock' | 'low-stock' | 'in-stock'>('all');
  const [selectedProduct, setSelectedProduct] = useState<StockProduct | null>(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [restockNotes, setRestockNotes] = useState('');
  const { toast } = useToast();

  const {
    products,
    stats,
    loading,
    error,
    refetch,
    topSellers,
    restockProduct,
    page, totalPages, total, pageSize, goToPage,
  } = useAdminStock();

  // Filter products based on search and status
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

      if (statusFilter === 'all') return matchesSearch;
      if (statusFilter === 'out-of-stock') return matchesSearch && product.stock === 0;
      if (statusFilter === 'low-stock') return matchesSearch && product.stock > 0 && product.stock <= product.low_stock_threshold;
      if (statusFilter === 'in-stock') return matchesSearch && product.stock > product.low_stock_threshold;

      return matchesSearch;
    });
  }, [products, searchTerm, statusFilter]);

  const getStockStatus = (stockQuantity: number, reorderThreshold: number) => {
    if (stockQuantity === 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const, icon: X };
    } else if (stockQuantity <= reorderThreshold) {
      return { label: 'Low Stock', variant: 'secondary' as const, icon: AlertTriangle };
    } else {
      return { label: 'In Stock', variant: 'default' as const, icon: Package };
    }
  };

  const handleStatusFilterChange = (value: string) => {
    if (value === 'all' || value === 'out-of-stock' || value === 'low-stock' || value === 'in-stock') {
      setStatusFilter(value);
    }
  };

  const handleRestock = async () => {
    if (!selectedProduct || !restockQuantity) return;

    const quantity = parseInt(restockQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid positive number",
        variant: "destructive"
      });
      return;
    }

    try {
      setRestocking(true)

      await restockProduct(selectedProduct.product_id, quantity, restockNotes || 'Manual restock');

      toast({
        title: "Stock Updated",
        description: `Added ${quantity} units to ${selectedProduct.name}`,
      });

      // Reset form
      setSelectedProduct(null);
      setRestockQuantity('');
      setRestockNotes('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRestocking(false)
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Stock Management</h1>
        </div>
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading stock data..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Stock Management</h1>
        </div>
        <div className="text-center">
          <p className="text-destructive">Error loading stock data: {error}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Management</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_products || 0}</div>
            <p className="text-xs text-muted-foreground">Active inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats?.low_stock_count || 0}</div>
            <p className="text-xs text-muted-foreground">Need restocking soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <X className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats?.out_of_stock_count || 0}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Stock</CardTitle>
            <Package className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats?.healthy_stock_count || 0}</div>
            <p className="text-xs text-muted-foreground">Well stocked items</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Sellers Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Selling Products
          </CardTitle>
          <CardDescription>Best performing products by total sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topSellers.map((product, index) => (
              <div key={product.product_id} className="flex items-center justify-between p-2 rounded-md border">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                  <span className="font-medium">{product.name}</span>
                </div>
                <Badge variant="outline">{product.total_sold} sold</Badge>
              </div>
            ))}
            {topSellers.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No sales data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>Monitor and manage product stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Reorder Threshold</TableHead>
                <TableHead>Total Sold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const status = getStockStatus(product.stock, product.low_stock_threshold);
                const StatusIcon = status.icon;

                return (
                  <TableRow key={product.product_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0] || '/placeholder.svg'}
                          alt={product.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">KES {product.selling_price}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${product.stock === 0 ? 'text-destructive' :
                        product.stock <= product.low_stock_threshold ? 'text-warning' :
                          'text-foreground'
                        }`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>{product.low_stock_threshold}</TableCell>
                    <TableCell>{product.total_sold}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog open={Boolean(selectedProduct)}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedProduct(product)}
                            className="flex items-center gap-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Restock
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Restock Product</DialogTitle>
                            <DialogDescription>
                              Add inventory for {product.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="quantity" className="text-right">
                                Quantity
                              </Label>
                              <Input
                                id="quantity"
                                type="number"
                                min="1"
                                placeholder="Enter quantity"
                                value={restockQuantity}
                                onChange={(e) => setRestockQuantity(e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                              <Label htmlFor="notes" className="text-right">
                                Notes
                              </Label>
                              <Textarea
                                id="notes"
                                placeholder="Optional restocking notes..."
                                value={restockNotes}
                                onChange={(e) => setRestockNotes(e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleRestock}>
                              {restocking ? "Restocking..." : "Update Stock"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No products found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <DataPagination page={page} totalPages={totalPages} total={total} limit={pageSize} onPageChange={goToPage} />
        </CardContent>
      </Card>
    </div>
  );
}