
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import { Link } from "react-router-dom";

const Footer = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "+254768039032";
    const message = "Hello! I'm interested in your products and would like to get more information.";
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src="/images/logos/pharmaNear.png"
                  alt="Shamsy Logo"
                  className="w-full h-full object-fit"
                />
              </div>
            </Link>
            <p className="text-white/80 mb-4 max-w-md">
              Your trusted marketplace for quality fashion and home decor.
              Connecting you with the best local artisans and products in Kenya.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <button
                onClick={handleWhatsAppClick}
                className="text-white/80 hover:text-white transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-playfair font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-white/80 hover:text-white transition-colors">Home</a></li>
              <li><a href="/products" className="text-white/80 hover:text-white transition-colors">Products</a></li>
              <li><a href="/about" className="text-white/80 hover:text-white transition-colors">About</a></li>
              <li><a href="/contact" className="text-white/80 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-playfair font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><a href="/products?category=fashion" className="text-white/80 hover:text-white transition-colors">Fashion</a></li>
              <li><a href="/products?category=decor" className="text-white/80 hover:text-white transition-colors">Decor</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/60">
          <p>&copy; 2024 Shamsy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
