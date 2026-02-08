
import TestimonialCard from '@/components/TestimonialCard';

const testimonials = [
  {
    id: '1',
    name: 'Sarah Wanjiku',
    location: 'Nairobi',
    category: 'fashion',
    text: 'I love the quality of the fashion items from Shamsy. The fabrics are beautiful and the designs are modern yet traditional.',
    rating: 5
  },
  {
    id: '2',
    name: 'John Kimani',
    location: 'Mombasa',
    category: 'decor',
    text: 'The home decor pieces I bought have transformed my living space. Excellent craftsmanship and fast delivery.',
    rating: 5
  },
  {
    id: '3',
    name: 'Grace Muthoni',
    location: 'Kisumu',
    category: 'fashion',
    text: 'Shamsy makes it so easy to find authentic Kenyan fashion and decor. The platform is user-friendly and reliable.',
    rating: 4
  }
];

const Testimonials = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-4">
            What Our Customers Say
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Read stories from our satisfied customers across Kenya who love our products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="animate-fade-in">
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-primary/5 p-8 rounded-lg">
          <h2 className="text-2xl font-playfair font-bold mb-4">
            Share Your Experience
          </h2>
          <p className="text-muted-foreground mb-6">
            We'd love to hear about your experience with Shamsy products. 
            Your feedback helps us serve you better and supports our local partners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:feedback@shamsy.co.ke" 
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Send Feedback
            </a>
            <a 
              href="#" 
              className="bg-secondary text-foreground px-6 py-3 rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Leave a Review
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
