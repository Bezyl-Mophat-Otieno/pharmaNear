
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200&h=600&fit=crop',
      title: 'Everything Stylish. Everything Simple.',
      subtitle: 'Discover Kenya\'s finest fashion and home decor',
      category: 'All Categories'
    },
    {
      image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=1200&h=600&fit=crop',
      title: 'Handcrafted Textiles',
      subtitle: 'Traditional fabrics and contemporary designs',
      category: 'Fashion'
    },
    {
      image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&h=600&fit=crop',
      title: 'Beautiful Home Decor',
      subtitle: 'Handcrafted pieces to beautify your space',
      category: 'Decor'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const scrollToFeatured = () => {
    const featuredSection = document.getElementById('featured-products');
    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShopByCategory = () => {
    navigate('/products');
  };

  return (
    <div className="relative h-[70vh] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="max-w-4xl mx-auto px-4 text-white animate-fade-in">
              <p className="text-bee-gold font-medium mb-2">{slide.category}</p>
              <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-6">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                {slide.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="btn-primary"
                  onClick={handleShopByCategory}
                >
                  Shop by Category
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 border-white text-white hover:bg-white hover:text-primary"
                  onClick={scrollToFeatured}
                >
                  View Bestsellers
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
