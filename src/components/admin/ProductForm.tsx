import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Product, productStatus } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { Subcategory, Category } from '@/services/categoryService';
import { ApiResponse, UploadedItem } from '@/types'
import { productService } from '@/services/productService';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  buyingPrice: z.number().min(0.01, 'Buying price must be greater than 0'),
  sellingPrice: z.number().min(0.01, 'Selling price must be greater than 0'),
  discountAmount: z.number().min(0, 'Discount cannot be negative').default(0),
  stock: z.number().min(0, 'Stock must be 0 or more').default(0),
  lowStockThreshold: z.number().min(0, 'Threshold must be 0 or more').default(5),
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().min(1, 'Subcategory is required'),
  materials: z.string().optional(),
  careInstructions: z.string().optional(),
  status: z.enum(['available', 'out_of_stock', 'unavailable']),
  featured: z.boolean(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  sizes: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
  categories: Category[];
  processingProduct: boolean
}

const ProductForm = ({ product, onSave, onCancel, categories, processingProduct }: ProductFormProps) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false)


  const { toast } = useToast();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      buyingPrice: 0,
      sellingPrice: 0,
      categoryId: '',
      subcategoryId: '',
      materials: '',
      careInstructions: '',
      status: 'available',
      featured: false,
      images: [],
      sizes: [],
    },
  });

  const buying = form.watch('buyingPrice');
  const selling = form.watch('sellingPrice');
  const margin = selling - buying;
  const marginPercent = buying > 0 ? (margin / buying) * 100 : 0;

  // Update form when product prop changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || '',
        buyingPrice: parseFloat(product.buying_price),
        discountAmount: parseFloat(product.discount_amount),
        stock: product.stock,
        lowStockThreshold: product.low_stock_threshold,
        sellingPrice: parseFloat(product.selling_price),
        categoryId: product.category_id,
        subcategoryId: product.sub_category_id,
        materials: product.materials || '',
        careInstructions: product.care_instructions || '',
        status: product.status,
        featured: product.is_featured,
        images: product.images || [],
        sizes: product.available_sizes || [],
      });
      setSelectedCategory(product.category_id);
      setImageUrls(product.images);
      setSizes(product.available_sizes || []);
    }
  }, [product, form]);

  // Update available subcategories when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      const subs = categories.find(cat => cat.category_id === selectedCategory)?.subcategories || [];
      setAvailableSubcategories(subs);
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategory, categories]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    form.setValue('categoryId', value);
    form.setValue('subcategoryId', ''); // Reset subcategory when category changes
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);

      // Create preview URLs
      const newUrls = files.map(file => URL.createObjectURL(file));
      const updated = [...imageUrls, ...newUrls];
      setImageUrls(updated);
      form.setValue('images', updated);
    }
  };

  const removeImage = (index: number) => {
    const updated = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updated);
    form.setValue('images', updated);

    // Also remove from files if it's a new upload
    if (index >= (product?.images?.length || 0)) {
      const fileIndex = index - (product?.images?.length || 0);
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const addSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      const updated = [...sizes, newSize.trim()];
      setSizes(updated);
      form.setValue('sizes', updated);
      setNewSize('');
    }
  };

  const removeSize = (index: number) => {
    const updated = sizes.filter((_, i) => i !== index);
    setSizes(updated);
    form.setValue('sizes', updated);
  };
  const onSubmit = async (data: ProductFormData) => {
    let uploadedImages: ApiResponse[] = [];
    setUploadingImages(true);

    try {
      // Upload images sequentially
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await productService.uploadImage(formData);
        uploadedImages.push(response);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (uploadedImages.length > 0) {
        toast({
          title: 'Images uploaded successfully',
          description: 'Your images have been uploaded successfully.',
          variant: 'default',
        });
      }

    } catch (error) {
      toast({
        title: 'Error uploading images',
        description: 'There was an error uploading your images. Please try again before saving your product.',
        variant: 'destructive',
      });
      return;
    } finally {
      setUploadingImages(false);
    }

    const productData: Product = {
      product_id: product?.product_id,
      name: data.name,
      description: data.description,
      buying_price: data.buyingPrice.toFixed(2),
      selling_price: data.sellingPrice.toFixed(2),
      discount_amount: data.discountAmount.toString(),
      stock: data.stock,
      low_stock_threshold: data.lowStockThreshold,
      images: uploadedImages.map(response => ((response.data) as UploadedItem).secure_url),
      category_id: data.categoryId,
      sub_category_id: data.subcategoryId,
      materials: data.materials,
      available_sizes: data.sizes,
      care_instructions: data.careInstructions,
      status: data.status as productStatus,
      is_featured: data.featured,
      total_sold: product?.total_sold || 0,
      created_at: product?.created_at,
    };

    onSave(productData);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Ankara Print Dress" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your product..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="buyingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buying Price (KES) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 2000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value === "" ? "0" : e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price (KES) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 3500"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value === "" ? "0" : e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {(
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  {
                    <div className="text-sm text-green-800">
                      <strong>Profit Margin:</strong> KES {margin.toFixed(2)}
                      ({marginPercent.toFixed(2)}%)
                    </div>
                  }
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 50"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowStockThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Stock Threshold *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 5"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="discountAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Amount (KES)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 200"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </CardContent>
          </Card>

          {/* Category & Status */}
          <Card>
            <CardHeader>
              <CardTitle>Category & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select value={field.value} onValueChange={handleCategoryChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.filter(c => c.category_id !== 'all').map((category) => (
                          <SelectItem key={category.category_id} value={category.category_id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={availableSubcategories.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSubcategories.map((subcategory) => (
                          <SelectItem key={subcategory.sub_category_id} value={subcategory.sub_category_id}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        <SelectItem value="unavailable">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Featured Product</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Display this product prominently
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  {index === 0 && (
                    <Badge className="absolute top-1 left-1 text-xs">Primary</Badge>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload product images
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      PNG, JPG, JPEG up to 10MB each
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
                <Button type="button" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>
            </div>
            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="materials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materials</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 100% Cotton" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sizes & Care</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <FormLabel>Available Sizes</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sizes.map((size, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {size}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSize(index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add size (e.g., S, M, L)"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  />
                  <Button type="button" onClick={addSize}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="careInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Care Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Hand wash only, dry clean recommended"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={processingProduct || uploadingImages}>
            {(processingProduct || uploadingImages) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {product ? (processingProduct || uploadingImages) ? 'Updating...' : 'Update Product' : (processingProduct || uploadingImages) ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;