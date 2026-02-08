import React from 'react';
import { Star, MapPin, Package, Shirt, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/types/product';
import { Category } from '@/services/categoryService';

interface ProductPreviewProps {
  product: Product;
  onClose: () => void;
  categories: Category[]
}

const ProductPreview = ({ product, onClose, categories }: ProductPreviewProps) => {
  const formatPrice = (price: string) => {
    return `KES ${price}`;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Available': 'bg-green-100 text-green-800',
      'Out of Stock': 'bg-red-100 text-red-800',
      'Hidden': 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const category = categories.find(c => c.category_id === product.category_id);
  const subcategories = category?.subcategories || [];

  const categoryName = category?.name || 'Unknown Category';
  const subcategoryName = subcategories.find(sc => sc.sub_category_id === product.sub_category_id)?.name || 'Unknown Subcategory';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getStatusBadge(product.status)}>
              {product.status}
            </Badge>
            {product.is_featured && (
              <Badge variant="secondary">Featured</Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">
            {formatPrice(product.selling_price)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= (product.rating || 4)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">
              ({product.rating || 4.0})
            </span>
          </div>
        </div>
      </div>

      {/* Images */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.images?.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`${product.name} - ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {index === 0 && (
                  <Badge className="absolute top-2 left-2">Primary</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Category:</span>
              <span className="ml-2 text-muted-foreground">
                {categoryName} → {subcategoryName}
              </span>
            </div>
            
            {product.origin && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{product.origin}</span>
              </div>
            )}

            {product.materials && (
              <div>
                <span className="font-medium">Materials:</span>
                <span className="ml-2 text-muted-foreground">{product.materials}</span>
              </div>
            )}

            {product.style && (
              <div>
                <span className="font-medium">Style:</span>
                <span className="ml-2 text-muted-foreground">{product.style}</span>
              </div>
            )}

            {product.available_sizes && product.available_sizes.length > 0 && (
              <div>
                <span className="font-medium">Available Sizes:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.available_sizes.map((size, index) => (
                    <Badge key={index} variant="outline">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description & Care */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {product.care_instructions && (
              <div>
                <h4 className="font-medium mb-2">Care Instructions</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.care_instructions}
                </p>
              </div>
            )}

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Specifications</h4>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Product ID:</span>
              <div className="text-muted-foreground font-mono">{product.product_id}</div>
            </div>
            <div>
              <span className="font-medium">URL Slug:</span>
              <div className="text-muted-foreground font-mono">{product.slug}</div>
            </div>
            <div>
              <span className="font-medium">Created:</span>
              <div className="text-muted-foreground">
                {product.created_at ? new Date(product.updated_at).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Note */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <Info className="h-4 w-4" />
          <span className="font-medium">Preview Mode</span>
        </div>
        <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
          This is how the product will appear to customers on your website.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onClose}>Close Preview</Button>
      </div>
    </div>
  );
};

export default ProductPreview;