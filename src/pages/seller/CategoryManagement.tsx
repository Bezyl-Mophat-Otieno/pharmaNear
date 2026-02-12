import { useState } from "react"
import { Plus, Edit, Trash2, Search, FolderTree, Tag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { useAdminCategories } from "@/hooks/useAdminData"
import { Category, NewCategory, NewSubcategory, Subcategory } from "@/services/categoryService"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Mock data for demonstrat
export default function CategoryManagement() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [subcategorySearch, setSubcategorySearch] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  const [isAddSubcategoryOpen, setIsAddSubcategoryOpen] = useState(false)
  const [isEditSubcategoryOpen, setIsEditSubcategoryOpen] = useState(false)
  const {
    categories,
    loading,
    addingCategories,
    addingSubCategories,
    error,
    selectedCategory,
    setSelectedCategoryId,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
  } = useAdminCategories()

  const categoryFormSchema = z.object({
    name: z.string().min(1, "Category name is required"),
    description: z.string().optional(),
  })

  const subCategoryFormSchema = z.object({
    name: z.string().min(1, "Subcategory name is required"),
    description: z.string().optional(),
  })


  // Forms
  const categoryForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", description: "" }
  })

  const subcategoryForm = useForm<z.infer<typeof subCategoryFormSchema>>({
    resolver: zodResolver(subCategoryFormSchema),
    defaultValues: { name: "", description: "" }
  })


  // Filter categories by search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []


  // Filter subcategories by search
  const filteredSubcategories = selectedCategory?.subcategories.filter(sub =>
    sub.name.toLowerCase().includes(subcategorySearch.toLowerCase())
  ) || []

  // Category CRUD operations
  const handleAddCategory = async (data: NewCategory) => {
    await createCategory(data)
    categoryForm.reset()
    setIsAddCategoryOpen(false)
    toast({
      title: "Success",
      description: "Category added successfully"
    })
  }

  const handleEditCategory = async (data: Category) => {
    if (!editingCategory) return

    await updateCategory(editingCategory.category_id, data)
    categoryForm.reset()
    setEditingCategory(null)
    toast({
      title: "Success",
      description: "Category updated successfully"
    })
  }

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteCategory(categoryId)
    toast({
      title: "Success",
      description: "Category deleted successfully"
    })
  }

  // Subcategory CRUD operations
  const handleAddSubcategory = async (data: NewSubcategory) => {
    if (!selectedCategory) return

    await createSubcategory({ ...data, category_id: selectedCategory.category_id })

    subcategoryForm.reset()
    setIsAddSubcategoryOpen(false)
    toast({
      title: "Success",
      description: "Subcategory added successfully"
    })
  }

  const handleEditSubcategory = async (data: Subcategory) => {
    if (!editingSubcategory || !selectedCategory) return

    await updateSubcategory(editingSubcategory.sub_category_id, data)

    subcategoryForm.reset()
    setEditingSubcategory(null)
    toast({
      title: "Success",
      description: "Subcategory updated successfully"
    })
  }

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!selectedCategory) return

    await deleteSubcategory(subcategoryId)

    toast({
      title: "Success",
      description: "Subcategory deleted successfully"
    })
  }

  if (loading) {
    return (
      <div className="p-6 h-96 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading categories..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-muted-foreground">Manage product categories and subcategories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Left Pane - Main Categories */}
        <Card className="flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                Main Categories
              </CardTitle>
              <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>
                  <Form {...categoryForm}>
                    <form onSubmit={categoryForm.handleSubmit(handleAddCategory)} className="space-y-4">
                      <FormField
                        control={categoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter category name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={categoryForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter category description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={addingCategories}>
                          {
                            addingCategories ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              "Add Category"
                            )
                          }
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2">
            {filteredCategories.map((category) => (
              <Card
                key={category.category_id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedCategory?.category_id === category.category_id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-muted/50'
                  }`}
                onClick={() => setSelectedCategoryId(category.category_id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.subcategories.length} subcategories
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingCategory(category)
                                categoryForm.setValue('name', category.name)
                                categoryForm.setValue('description', category.description || '')
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Category</DialogTitle>
                            </DialogHeader>
                            <Form {...categoryForm}>
                              <form onSubmit={categoryForm.handleSubmit(handleEditCategory)} className="space-y-4">
                                <FormField
                                  control={categoryForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Category Name</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Enter category name" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={categoryForm.control}
                                  name="description"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Description</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Enter category description" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex justify-end gap-2">
                                  <Button type="button" variant="outline" onClick={
                                    () => {
                                      setEditingCategory(null)
                                      categoryForm.reset()
                                      setIsEditCategoryOpen(false)
                                    }}>
                                    Cancel
                                  </Button>
                                  <Button type="submit">Update Category</Button>
                                </div>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{category.name}"?
                                {category.subcategories.length > 0 &&
                                  " This category has subcategories that must be removed first."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCategory(category.category_id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Right Pane - Subcategories */}
        <Card className="flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {selectedCategory ? `${selectedCategory.name} Subcategories` : 'Select a Category'}
              </CardTitle>
              {selectedCategory && (
                <Dialog open={isAddSubcategoryOpen} onOpenChange={setIsAddSubcategoryOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subcategory
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Subcategory</DialogTitle>
                    </DialogHeader>
                    <Form {...subcategoryForm}>
                      <form onSubmit={subcategoryForm.handleSubmit(handleAddSubcategory)} className="space-y-4">
                        <FormField
                          control={subcategoryForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subcategory Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter subcategory name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={subcategoryForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter subcategory description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />


                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsAddSubcategoryOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={addingSubCategories}>
                            {

                              addingSubCategories ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                "Add Subcategory"
                              )
                            }

                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {selectedCategory && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subcategories..."
                  value={subcategorySearch}
                  onChange={(e) => setSubcategorySearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {!selectedCategory ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FolderTree className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Category Selected</h3>
                <p className="text-muted-foreground">
                  Select a category from the left to view and manage its subcategories
                </p>
              </div>
            ) : filteredSubcategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Subcategories</h3>
                <p className="text-muted-foreground mb-4">
                  This category doesn't have any subcategories yet
                </p>
                <Button onClick={() => setIsAddSubcategoryOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Subcategory
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSubcategories.map((subcategory) => (
                  <Card key={subcategory.sub_category_id} className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{subcategory.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {/* {subcategory.productCount} products */}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <Dialog open={isEditSubcategoryOpen} onOpenChange={setIsEditSubcategoryOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingSubcategory(subcategory)
                                    subcategoryForm.setValue('name', subcategory.name)
                                    subcategoryForm.setValue('description', subcategory.description || '')
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Subcategory</DialogTitle>
                                </DialogHeader>
                                <Form {...subcategoryForm}>
                                  <form onSubmit={subcategoryForm.handleSubmit(handleEditSubcategory)} className="space-y-4">
                                    <FormField
                                      control={subcategoryForm.control}
                                      name="name"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Subcategory Name</FormLabel>
                                          <FormControl>
                                            <Input placeholder="Enter subcategory name" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={subcategoryForm.control}
                                      name="description"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Description</FormLabel>
                                          <FormControl>
                                            <Input placeholder="Enter subcategory description" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button type="button" variant="outline" onClick={() => {
                                        setEditingSubcategory(null)
                                        setIsEditSubcategoryOpen(false)
                                        subcategoryForm.reset()
                                      }}>
                                        Cancel
                                      </Button>
                                      <Button type="submit">Update Subcategory</Button>
                                    </div>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{subcategory.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSubcategory(subcategory.sub_category_id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}