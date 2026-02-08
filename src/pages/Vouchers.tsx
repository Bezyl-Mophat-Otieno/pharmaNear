
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Gift, Percent, Calendar, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minAmount?: number;
  expiryDate: string;
  isUsed: boolean;
  category?: string;
}

const Vouchers = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load vouchers from localStorage
    const savedVouchers = localStorage.getItem('bee-q-vouchers');
    if (savedVouchers) {
      setVouchers(JSON.parse(savedVouchers));
    } else {
      // Add some sample vouchers for demonstration
      const sampleVouchers: Voucher[] = [
        {
          id: '1',
          code: 'WELCOME10',
          title: 'Welcome Bonus',
          description: 'Get 10% off your first order',
          discount: 10,
          type: 'percentage',
          minAmount: 50,
          expiryDate: '2024-12-31',
          isUsed: false,
          category: 'New Customer'
        },
        {
          id: '2',
          code: 'HONEY20',
          title: 'Honey Lover',
          description: '$20 off on honey products',
          discount: 20,
          type: 'fixed',
          minAmount: 100,
          expiryDate: '2024-11-30',
          isUsed: false,
          category: 'Product Specific'
        },
        {
          id: '3',
          code: 'SUMMER15',
          title: 'Summer Special',
          description: '15% off on all items',
          discount: 15,
          type: 'percentage',
          expiryDate: '2024-08-31',
          isUsed: true,
          category: 'Seasonal'
        }
      ];
      setVouchers(sampleVouchers);
      localStorage.setItem('bee-q-vouchers', JSON.stringify(sampleVouchers));
    }
  }, []);

  const addVoucherByCode = () => {
    if (!newVoucherCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a voucher code",
        variant: "destructive"
      });
      return;
    }

    // Simulate voucher code validation
    const existingVoucher = vouchers.find(v => v.code === newVoucherCode.toUpperCase());
    if (existingVoucher) {
      toast({
        title: "Code Already Added",
        description: "This voucher code is already in your collection",
        variant: "destructive"
      });
      return;
    }

    // Add new voucher (in a real app, this would validate with backend)
    const newVoucher: Voucher = {
      id: Date.now().toString(),
      code: newVoucherCode.toUpperCase(),
      title: 'Special Offer',
      description: 'Added by voucher code',
      discount: 5,
      type: 'percentage',
      expiryDate: '2024-12-31',
      isUsed: false,
      category: 'Manual'
    };

    const updatedVouchers = [...vouchers, newVoucher];
    setVouchers(updatedVouchers);
    localStorage.setItem('bee-q-vouchers', JSON.stringify(updatedVouchers));
    setNewVoucherCode('');

    toast({
      title: "Voucher Added!",
      description: "Your voucher has been successfully added"
    });
  };

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    
    toast({
      title: "Code Copied!",
      description: "Voucher code has been copied to clipboard"
    });
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const formatDiscount = (voucher: Voucher) => {
    return voucher.type === 'percentage' 
      ? `${voucher.discount}% OFF`
      : `$${voucher.discount} OFF`;
  };

  const availableVouchers = vouchers.filter(v => !v.isUsed && !isExpired(v.expiryDate));
  const usedExpiredVouchers = vouchers.filter(v => v.isUsed || isExpired(v.expiryDate));

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-4">
            My Vouchers
          </h1>
          <p className="text-lg text-muted-foreground">
            Your discount vouchers and promotional codes
          </p>
        </div>

        {/* Add Voucher Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Add New Voucher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter voucher code"
                value={newVoucherCode}
                onChange={(e) => setNewVoucherCode(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addVoucherByCode}>
                Add Voucher
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Enter a promo code to add it to your vouchers collection
            </p>
          </CardContent>
        </Card>

        {/* Available Vouchers */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Percent className="h-6 w-6" />
            Available Vouchers ({availableVouchers.length})
          </h2>
          
          {availableVouchers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No available vouchers at the moment. Check back later for special offers!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableVouchers.map((voucher) => (
                <Card key={voucher.id} className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-bold">
                    {formatDiscount(voucher)}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{voucher.title}</CardTitle>
                        {voucher.category && (
                          <Badge variant="secondary" className="mt-1">
                            {voucher.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {voucher.description}
                    </p>
                    
                    {voucher.minAmount && (
                      <p className="text-sm mb-2">
                        Minimum order: <span className="font-semibold">${voucher.minAmount}</span>
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4" />
                      Expires: {new Date(voucher.expiryDate).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono flex-1">
                        {voucher.code}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyVoucherCode(voucher.code)}
                      >
                        {copiedCode === voucher.code ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Used/Expired Vouchers */}
        {usedExpiredVouchers.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-muted-foreground">
              Used & Expired Vouchers ({usedExpiredVouchers.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usedExpiredVouchers.map((voucher) => (
                <Card key={voucher.id} className="opacity-60">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{voucher.title}</CardTitle>
                        <Badge 
                          variant={voucher.isUsed ? "secondary" : "destructive"} 
                          className="mt-1"
                        >
                          {voucher.isUsed ? "Used" : "Expired"}
                        </Badge>
                      </div>
                      <div className="bg-muted text-muted-foreground px-3 py-1 text-sm font-bold rounded">
                        {formatDiscount(voucher)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {voucher.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Expired: {new Date(voucher.expiryDate).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vouchers;
