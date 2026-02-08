import api from '@/lib/api';
import  { z } from 'zod';


export const subcategorySchema = z.object({
  sub_category_id: z.string(),
  name: z.string().min(1, "Subcategory name is required").min(2, "Subcategory name must be at least 2 characters")
  .min(2, "Subcategory name must be at least 2 characters"),
  description: z.string(),
  category_id: z.string().min(1, "Category ID is required"),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Subcategory = z.infer<typeof subcategorySchema>;
export type NewSubcategory = Omit<Subcategory, 'id' | 'createdAt' | 'updatedAt'>;


export const categorySchema = z.object({
  category_id: z.string(),
  name: z.string().min(1, "Category name is required").min(2, "Category name must be at least 2 characters"),
  subcategories: z.array(subcategorySchema).optional(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Category = z.infer<typeof categorySchema>;

export type NewCategory = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;

export const categoryService = {
  // Get all categories
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get category by ID
  async getCategory(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Admin: Create category
  async createCategory(categoryData: NewCategory): Promise<Category> {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Admin: Update category
  async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Admin: Delete category
  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },

  // Admin: Create subcategory
  async createSubcategory(subcategoryData: Subcategory): Promise<Subcategory> {
    const response = await api.post('/subcategories', subcategoryData);
    return response.data;
  },

  // Admin: Update subcategory
  async updateSubcategory(id: string, subcategoryData: Partial<Subcategory>): Promise<Subcategory> {
    const response = await api.put(`/subcategories/${id}`, subcategoryData);
    return response.data;
  },

  // Admin: Delete subcategory
  async deleteSubcategory(id: string): Promise<void> {
    await api.delete(`/subcategories/${id}`);
  },
};