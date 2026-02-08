import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Smartphone, Check } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: 'mpesa' | 'card' | null;
  onSelectMethod: (method: 'mpesa' | 'card') => void;
  onProceed: () => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  onProceed,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Payment Method</h2>
        <p className="text-muted-foreground">Select your preferred payment option</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* M-Pesa Option */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedMethod === 'mpesa' 
              ? 'ring-2 ring-primary bg-primary/5' 
              : 'hover:bg-muted/50'
          }`}
          onClick={() => onSelectMethod('mpesa')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">M-Pesa</h3>
                  <p className="text-sm text-muted-foreground">Mobile Money</p>
                </div>
              </div>
              {selectedMethod === 'mpesa' && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Pay using your M-Pesa account</p>
              <p>• Instant payment confirmation</p>
              <p>• Secure and convenient</p>
            </div>
          </CardContent>
        </Card>

        {/* Card Option */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedMethod === 'card' 
              ? 'ring-2 ring-primary bg-primary/5' 
              : 'hover:bg-muted/50'
          }`}
          onClick={() => onSelectMethod('card')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Debit/Credit Card</h3>
                  <p className="text-sm text-muted-foreground">Visa, MasterCard</p>
                </div>
              </div>
              {selectedMethod === 'card' && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Visa, MasterCard accepted</p>
              <p>• Secure 3D authentication</p>
              <p>• International cards supported</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={onProceed}
        disabled={!selectedMethod}
        className="w-full"
        size="lg"
      >
        Continue to Payment
      </Button>
    </div>
  );
};

export default PaymentMethodSelector;