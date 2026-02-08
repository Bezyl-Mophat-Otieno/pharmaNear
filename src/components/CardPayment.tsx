import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CardPaymentProps {
  amount: number;
  orderId: string;
  onPaymentSuccess: () => void;
  onPaymentFailed: () => void;
}

const CardPayment: React.FC<CardPaymentProps> = ({
  amount,
  orderId,
  onPaymentSuccess,
  onPaymentFailed,
}) => {
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ').slice(0, 19) : digits;
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardData({ ...cardData, [field]: formattedValue });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateCard = () => {
    const newErrors: Record<string, string> = {};

    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 13) {
      newErrors.number = 'Please enter a valid card number';
    }

    if (!cardData.expiry || cardData.expiry.length < 5) {
      newErrors.expiry = 'Please enter a valid expiry date';
    }

    if (!cardData.cvv || cardData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!cardData.name.trim()) {
      newErrors.name = 'Please enter the cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateCard()) {
      return;
    }

    setPaymentStatus('processing');

    // Simulate card payment processing
    setTimeout(() => {
      // 85% success rate for demo
      if (Math.random() > 0.15) {
        setPaymentStatus('success');
        toast({
          title: "Payment Successful!",
          description: "Your card payment has been processed successfully",
        });
        onPaymentSuccess();
      } else {
        setPaymentStatus('failed');
        toast({
          title: "Payment Failed",
          description: "Your card payment could not be processed. Please try again.",
          variant: "destructive",
        });
        onPaymentFailed();
      }
    }, 3000);
  };

  const getCardType = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'Visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'MasterCard';
    return 'Card';
  };

  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h3 className="text-lg font-semibold">Processing Payment...</h3>
            <p className="text-muted-foreground">Please wait while we securely process your card</p>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              <Lock className="h-4 w-4 inline-block mr-2" />
              Your payment is secured with 256-bit SSL encryption
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
            <p className="text-muted-foreground">Your card payment has been processed successfully</p>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 mx-auto text-red-500" />
            <h3 className="text-lg font-semibold text-red-600">Payment Failed</h3>
            <p className="text-muted-foreground">Your payment could not be processed. Please check your card details and try again.</p>
            <Button onClick={() => setPaymentStatus('idle')} variant="outline">
              Try Again
            </Button>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Card Payment</h3>
                <p className="text-sm text-muted-foreground">Secure payment with your debit or credit card</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="card-number">Card Number</Label>
                <div className="relative">
                  <Input
                    id="card-number"
                    type="text"
                    value={cardData.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className={`mt-1 ${errors.number ? 'border-red-500' : ''}`}
                  />
                  {cardData.number && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                      {getCardType(cardData.number)}
                    </div>
                  )}
                </div>
                {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="card-expiry">Expiry Date</Label>
                  <Input
                    id="card-expiry"
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) => handleInputChange('expiry', e.target.value)}
                    placeholder="MM/YY"
                    className={`mt-1 ${errors.expiry ? 'border-red-500' : ''}`}
                  />
                  {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
                </div>

                <div>
                  <Label htmlFor="card-cvv">CVV</Label>
                  <Input
                    id="card-cvv"
                    type="text"
                    value={cardData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    placeholder="123"
                    className={`mt-1 ${errors.cvv ? 'border-red-500' : ''}`}
                  />
                  {errors.cvv && <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="card-name">Cardholder Name</Label>
                <Input
                  id="card-name"
                  type="text"
                  value={cardData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="John Doe"
                  className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Amount to Pay:</span>
                  <span className="text-xl font-bold text-primary">KSh {amount.toLocaleString()}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Order ID: {orderId}
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Your payment information is encrypted and secure</span>
              </div>

              <Button 
                onClick={handlePayment}
                className="w-full"
                size="lg"
                disabled={!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name}
              >
                Pay KSh {amount.toLocaleString()}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Payment</CardTitle>
      </CardHeader>
      <CardContent>
        {renderPaymentStatus()}
      </CardContent>
    </Card>
  );
};

export default CardPayment;