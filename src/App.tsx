import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthTokenGuard } from "./components/AuthTokenGuard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import Vouchers from "./pages/Vouchers";
import Guest from "./pages/Guest";
import Wishlist from "./pages/Wishlist";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminProfile from "./pages/admin/AdminProfile";
import { AdminLayout } from "./components/admin/AdminLayout";

import CategoryManagement from "./pages/tenant/CategoryManagement";
import OrderManagement from "./pages/tenant/OrderManagement";
import TransactionManagement from "./pages/tenant/TransactionManagement";
import ProductManagement from "./pages/tenant/ProductManagement";
import StockManagement from "./pages/tenant/StockManagement";

import ScrollToTop from "@/components/ScrollToTop.ts";
import { RoleEnum } from "./types";
import TenantOnboarding from "./pages/tenant/TenantOnboarding";
import BusinessManagement from "./pages/admin/BusinessManagement";
import TenantLogin from "./pages/tenant/TenantLogin";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import TenantProfile from "./pages/tenant/TenantProfile";
import { TenantLayout } from "./components/tenant/TenantLayout";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();

  // Check if current route is an admin route or a tenent route
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/tenant');
  // Check if user is admin
  const isAdmin = [RoleEnum.TENANT, RoleEnum.ADMIN].includes(user?.role);

  // Show public layout only for non-admin routes or non-admin users
  const showPublicLayout = !isAdminRoute || !isAdmin;

  return (
    <div className="min-h-screen flex flex-col">
      {showPublicLayout && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/guest" element={<Guest />} />
          <Route path="/tenant/onboard" element={<TenantOnboarding />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/vouchers" element={<Vouchers />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <AdminLayout>
              <TenantDashboard />
            </AdminLayout>
          } />
          <Route path="/admin/business-management" element={
            <AdminLayout>
              <BusinessManagement />
            </AdminLayout>
          } />
          <Route path="/admin/profile" element={
            <AdminLayout>
              <AdminProfile />
            </AdminLayout>
          } />
          {/* Tenant Routes */}
          <Route path="/tenant/login" element={<TenantLogin />} />
          <Route path="/tenant" element={
            <TenantLayout>
              <TenantDashboard />
            </TenantLayout>
          } />
          <Route path="/tenant/businesses" element={
            <TenantLayout>
              <BusinessManagement />
            </TenantLayout>
          } />
          <Route path="/tenant/profile" element={
            <TenantLayout>
              <TenantProfile />
            </TenantLayout>
          } />
          <Route path="/tenant/products" element={
            <TenantLayout>
              <ProductManagement />
            </TenantLayout>
          } />
          <Route path="/tenant/categories" element={
            <TenantLayout>
              <CategoryManagement />
            </TenantLayout>
          } />
          <Route path="/tenant/orders" element={
            <TenantLayout>
              <OrderManagement />
            </TenantLayout>
          } />
          <Route path="/tenant/stock" element={
            <TenantLayout>
              <StockManagement />
            </TenantLayout>
          } />
          <Route path="/tenant/transactions" element={
            <TenantLayout>
              <TransactionManagement />
            </TenantLayout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {showPublicLayout && <Footer />}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WishlistProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AuthTokenGuard>
                <ScrollToTop />
                <AppContent />
              </AuthTokenGuard>
            </AuthProvider>
          </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
