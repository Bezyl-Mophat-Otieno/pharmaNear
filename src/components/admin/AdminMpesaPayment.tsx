import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminMpesaPaymentProps {
    orderId: string;
    amount: number;
    customerPhone: string;
    onSuccess: (transactionData: any) => void;
}

const AdminMpesaPayment = ({ orderId, amount, customerPhone, onSuccess }: AdminMpesaPaymentProps) => {
    const [phoneNumber, setPhoneNumber] = useState(customerPhone || '');
    const [status, setStatus] = useState<'idle' | 'initiating' | 'waiting' | 'success' | 'failed'>('idle');
    const [countdown, setCountdown] = useState(0);
    const [checkoutRequestId, setCheckoutRequestId] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && status === 'waiting') {
            // Timeout
            setStatus('failed');
            toast({
                title: "Payment Timeout",
                description: "The payment request has expired. Please try again.",
                variant: "destructive",
            });
        }
    }, [countdown, status]);

    const formatPhoneNumber = (value: string) => {
        const digits = value.replace(/\D/g, '');

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

    const handleInitiatePayment = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            toast({
                title: "Invalid Phone Number",
                description: "Please enter a valid M-Pesa phone number",
                variant: "destructive",
            });
            return;
        }

        setStatus('initiating');

        try {
            // TODO: Replace with actual API call
            // const response = await transactionService.processMpesaPayment({
            //   orderId,
            //   amount,
            //   phoneNumber
            // });

            // Simulate API call
            setTimeout(() => {
                const mockCheckoutId = `CHK-${Date.now()}`;
                setCheckoutRequestId(mockCheckoutId);
                setStatus('waiting');
                setCountdown(120); // 2 minutes

                toast({
                    title: "Payment Request Sent",
                    description: `M-Pesa prompt sent to ${phoneNumber}`,
                });

                // Simulate payment completion
                setTimeout(() => {
                    const success = Math.random() > 0.1; // 90% success rate
                    if (success) {
                        const transactionData = {
                            transactionId: `TXN-${Date.now()}`,
                            mpesaReceiptNumber: `MPE${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                            phoneNumber,
                            amount,
                            timestamp: new Date().toISOString(),
                        };
                        setStatus('success');
                        onSuccess(transactionData);
                    } else {
                        setStatus('failed');
                    }
                }, Math.random() * 15000 + 10000); // 10-25 seconds
            }, 2000);
        } catch {
            setStatus('failed');
            toast({
                title: "Error",
                description: "Failed to initiate M-Pesa payment",
                variant: "destructive",
            });
        }
    };

    if (status === 'initiating') {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                        <h3 className="text-lg font-semibold">Initiating M-Pesa Payment...</h3>
                        <p className="text-sm text-muted-foreground">Please wait</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (status === 'waiting') {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <div className="relative inline-block">
                            <Clock className="h-12 w-12 mx-auto text-orange-500" />
                            <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                {countdown}
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold">Waiting for Customer</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>M-Pesa prompt sent to <strong>{phoneNumber}</strong></p>
                            <p>Customer should enter their M-Pesa PIN to complete payment</p>
                            <p className="text-orange-600 font-medium">
                                Time remaining: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                            </p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                ⚠ Do not close this window until payment is complete
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (status === 'success') {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                        <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
                        <p className="text-sm text-muted-foreground">
                            M-Pesa payment has been processed successfully
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (status === 'failed') {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <XCircle className="h-12 w-12 mx-auto text-red-500" />
                        <h3 className="text-lg font-semibold text-red-600">Payment Failed</h3>
                        <p className="text-sm text-muted-foreground">
                            The payment could not be completed. Please try again.
                        </p>
                        <Button onClick={() => setStatus('idle')} variant="outline">
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">M-Pesa Payment</h3>
                            <p className="text-sm text-muted-foreground">Process mobile money payment</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="mpesa-phone">Customer Phone Number</Label>
                            <Input
                                id="mpesa-phone"
                                type="tel"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                placeholder="+254 XXX XXX XXX"
                                className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                M-Pesa registered phone number
                            </p>
                        </div>

                        <div className="bg-muted p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Payment Amount:</span>
                                <span className="text-xl font-bold text-primary">
                                    KSh {amount.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={handleInitiatePayment}
                            className="w-full"
                            size="lg"
                            disabled={!phoneNumber || phoneNumber.length < 10}
                        >
                            Send M-Pesa Prompt
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AdminMpesaPayment;