
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin } from 'lucide-react';

interface TestimonialCardProps {
  testimonial: {
    id: string;
    name: string;
    location: string;
    category: string;
    text: string;
    rating: number;
  };
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'clothing':
        return 'text-clothing-accent';
      case 'bakery':
        return 'text-bakery-accent';
      case 'fresh':
        return 'text-farm-accent';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        
        <blockquote className="text-muted-foreground mb-4 italic">
          "{testimonial.text}"
        </blockquote>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">{testimonial.name}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-3 h-3 mr-1" />
              {testimonial.location}
            </div>
          </div>
          <div className={`text-sm font-medium ${getCategoryColor(testimonial.category)}`}>
            {testimonial.category === 'clothing' && '🧵'}
            {testimonial.category === 'bakery' && '🥐'}
            {testimonial.category === 'fresh' && '🌽'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
