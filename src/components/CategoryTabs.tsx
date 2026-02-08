
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { categories, subcategories } from '@/data/products';

interface CategoryTabsProps {
  activeCategory: string;
  activeSubcategory: string;
  onCategoryChange: (category: string) => void;
  onSubcategoryChange: (subcategory: string) => void;
}

const CategoryTabs = ({ 
  activeCategory, 
  activeSubcategory, 
  onCategoryChange, 
  onSubcategoryChange 
}: CategoryTabsProps) => {
  return (
    <div className="mb-8">
      <Tabs value={activeCategory} onValueChange={onCategoryChange}>
        <TabsList className="grid w-full grid-cols-3">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            {category.id !== 'all' && subcategories[category.id as keyof typeof subcategories] && (
              <div className="flex flex-wrap gap-2 justify-center">
                {subcategories[category.id as keyof typeof subcategories].map((subcategory) => (
                  <button
                    key={subcategory.id}
                    onClick={() => onSubcategoryChange(subcategory.id)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      activeSubcategory === subcategory.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {subcategory.name}
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CategoryTabs;
