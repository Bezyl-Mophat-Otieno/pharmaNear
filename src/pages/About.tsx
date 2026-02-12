
import { Leaf, Users, Award, Target } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: <Leaf className="h-8 w-8" />,
      title: 'Technology',
      description: 'We provide cutting-edge digital solutions to help small sellers thrive in the online marketplace.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Community',
      description: 'Every business on our platform is part of a growing community of entrepreneurs supporting each other.'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Quality',
      description: 'We maintain the highest standards in our platform and support every business to deliver excellence.'
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Growth',
      description: 'We focus on helping SMEs scale their sellers through technology and digital presence.'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-6">
            About Shamsy
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering small and medium enterprises with technology-driven solutions for online success
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-primary/5 p-8 rounded-lg">
            <h2 className="text-2xl font-playfair font-bold mb-4 text-primary">
              Our Mission
            </h2>
            <p className="text-muted-foreground text-lg">
              To provide small and medium enterprises with an intuitive, technology-enabled platform
              that simplifies online business management, from customer engagement to order fulfillment
              and sales tracking.
            </p>
          </div>

          <div className="bg-bee-gold/10 p-8 rounded-lg">
            <h2 className="text-2xl font-playfair font-bold mb-4 text-bee-gold">
              Our Vision
            </h2>
            <p className="text-muted-foreground text-lg">
              To be Kenya's leading digital commerce platform, enabling every small business
              to establish a strong online presence and compete effectively in the digital marketplace.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-playfair font-bold text-center mb-8">
            Our Story
          </h2>
          <div className="max-w-4xl mx-auto text-lg text-muted-foreground space-y-6">
            <p>
              Shamsy was founded with a vision to bridge the digital divide for small and medium
              enterprises across Kenya. We recognized that many talented entrepreneurs lacked
              the technical resources to establish an effective online presence.
            </p>
            <p>
              Today, we're proud to serve hundreds of SMEs across various industries - from fashion
              designers and bakers to home decor artisans. Our platform provides everything needed
              to run a successful online business: inventory management, customer relationship tools,
              order processing, and sales analytics.
            </p>
            <p>
              Every business on Shamsy represents entrepreneurial spirit and innovation. When you
              shop with our merchants, you're not just buying a product — you're supporting
              digital transformation and economic growth in Kenya's SME sector.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-playfair font-bold text-center mb-12">
            What Makes Shamsy Special
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="font-playfair font-semibold text-xl mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Section */}
        <div className="bg-secondary/30 p-8 rounded-lg text-center">
          <h2 className="text-3xl font-playfair font-bold mb-6">
            Our Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">200+</div>
              <p className="text-muted-foreground">SME Partners</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">5,000+</div>
              <p className="text-muted-foreground">Orders Processed</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <p className="text-muted-foreground">Client Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
