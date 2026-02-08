import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MpesaPaymentProps {
  amount: number;
  orderId: string;
  onPaymentSuccess: () => void;
  onPaymentFailed: () => void;
}

const MpesaPayment: React.FC<MpesaPaymentProps> = ({
  amount,
  orderId,
  onPaymentSuccess,
  onPaymentFailed,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'requesting' | 'waiting' | 'success' | 'failed'>('idle');
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInitiatePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid M-Pesa phone number",
        variant: "destructive",
      });
      return;
    }

    setPaymentStatus('requesting');
    
    // Simulate API call to initiate M-Pesa payment
    setTimeout(() => {
      setPaymentStatus('waiting');
      setCountdown(120); // 2 minutes countdown
      
      toast({
        title: "M-Pesa Payment Initiated",
        description: "Please check your phone for the M-Pesa prompt",
      });

      // Simulate payment completion after random time (15-30 seconds)
      const paymentTime = Math.random() * 15000 + 15000;
      setTimeout(() => {
        // 90% success rate for demo
        if (Math.random() > 0.1) {
          setPaymentStatus('success');
          onPaymentSuccess();
        } else {
          setPaymentStatus('failed');
          onPaymentFailed();
        }
      }, paymentTime);
    }, 2000);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as +254 XXX XXX XXX
    if (digits.startsWith('254')) {
      return '+' + digits.slice(0, 12);
    } else if (digits.startsWith('07') || digits.startsWith('01')) {
      return '+254' + digits.slice(1, 10);
    }
    return digits.slice(0, 13);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'requesting':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h3 className="text-lg font-semibold">Initiating Payment...</h3>
            <p className="text-muted-foreground">Please wait while we process your request</p>
          </div>
        );

      case 'waiting':
        return (
          <div className="text-center space-y-4">
            <div className="relative">
              <Clock className="h-12 w-12 mx-auto text-orange-500" />
              <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {countdown}
              </div>
            </div>
            <h3 className="text-lg font-semibold">Check Your Phone</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>We've sent an M-Pesa payment request to <strong>{phoneNumber}</strong></p>
              <p>Enter your M-Pesa PIN to complete the payment</p>
              <p className="text-sm">Request expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
            <p className="text-muted-foreground">Your M-Pesa payment has been processed successfully</p>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 mx-auto text-red-500" />
            <h3 className="text-lg font-semibold text-red-600">Payment Failed</h3>
            <p className="text-muted-foreground">Your payment could not be processed. Please try again.</p>
            <Button onClick={() => setPaymentStatus('idle')} variant="outline">
              Try Again
            </Button>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Smartphone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">M-Pesa Payment</h3>
                <p className="text-sm text-muted-foreground">Pay securely with your mobile money</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
                <Input
                  id="mpesa-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="+254 XXX XXX XXX"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the phone number registered with M-Pesa
                </p>
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

              <Button 
                onClick={handleInitiatePayment}
                className="w-full"
                size="lg"
                disabled={!phoneNumber || phoneNumber.length < 10}
              >
                Pay with M-Pesa
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>M-Pesa Payment</CardTitle>
      </CardHeader>
      <CardContent>
        {renderPaymentStatus()}
      </CardContent>
    </Card>
  );
};

export default MpesaPayment;