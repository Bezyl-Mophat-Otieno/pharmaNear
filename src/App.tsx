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

import CategoryManagement from "./pages/seller/CategoryManagement";
import OrderManagement from "./pages/seller/OrderManagement";
import TransactionManagement from "./pages/seller/TransactionManagement";
import ProductManagement from "./pages/seller/ProductManagement";
import StockManagement from "./pages/seller/StockManagement";

import ScrollToTop from "@/components/ScrollToTop.ts";
import { RoleEnum } from "./types";
import BusinessManagement from "./pages/admin/BusinessManagement";
import SellerLogin from "./pages/seller/SellerLogin";
import SellerProfile from "./pages/seller/SellerProfile";
import { SellerLayout } from "./components/seller/SellerLayout";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerOnboarding from "./pages/seller/SellerOnboarding";


const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();

  // Check if current route is an admin route or a tenent route
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller');
  // Check if user is admin
  const isAdmin = [RoleEnum.SELLER, RoleEnum.ADMIN].includes(user?.role);

  // Show public layout only for non-admin routes or non-admin users
  const showPublicLayout = !isAdminRoute || !isAdmin
  const isLandinpage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      {(showPublicLayout && !isLandinpage) && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Guest />} />
          <Route path="/seller/home" element={<Index />} />
          <Route path="/seller/onboard" element={<SellerOnboarding />} />
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
              <SellerDashboard />
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
          {/* seller Routes */}
          <Route path="/seller/login" element={<SellerLogin />} />
          <Route path="/seller" element={
            <SellerLayout>
              <SellerDashboard />
            </SellerLayout>
          } />
          <Route path="/seller/sellers" element={
            <SellerLayout>
              <BusinessManagement />
            </SellerLayout>
          } />
          <Route path="/seller/profile" element={
            <SellerLayout>
              <SellerProfile />
            </SellerLayout>
          } />
          <Route path="/seller/products" element={
            <SellerLayout>
              <ProductManagement />
            </SellerLayout>
          } />
          <Route path="/seller/categories" element={
            <SellerLayout>
              <CategoryManagement />
            </SellerLayout>
          } />
          <Route path="/seller/orders" element={
            <SellerLayout>
              <OrderManagement />
            </SellerLayout>
          } />
          <Route path="/seller/stock" element={
            <SellerLayout>
              <StockManagement />
            </SellerLayout>
          } />
          <Route path="/seller/transactions" element={
            <SellerLayout>
              <TransactionManagement />
            </SellerLayout>
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
