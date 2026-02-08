
import { useState, useEffect } from 'react';
import { Star, MessageCircle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadReviews = () => {
      const savedReviews = localStorage.getItem(`reviews-${productId}`);
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      }
    };

    loadReviews();
    
    // Listen for storage changes to update reviews when new ones are added
    const handleStorageChange = () => {
      loadReviews();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event when reviews are added in the same tab
    const handleReviewUpdate = () => {
      loadReviews();
    };
    
    window.addEventListener('reviewUpdated', handleReviewUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('reviewUpdated', handleReviewUpdate);
    };
  }, [productId]);

  if (reviews.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="w-full mt-8">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-primary" />
          <span className="text-2xl font-playfair">Customer Reviews</span>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {reviews.length}
          </span>
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ChevronDown className="h-4 w-4" />
          <span>Scroll to view all reviews</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div key={review.id} className={`pb-6 ${index !== reviews.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {review.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{review.userName}</span>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-muted-foreground leading-relaxed ml-13 bg-gray-50 p-3 rounded-lg">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ProductReviews;
