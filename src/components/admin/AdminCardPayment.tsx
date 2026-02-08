import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminCardPaymentProps {
    orderId: string;
    amount: number;
    onSuccess: (transactionData: any) => void;
}

const AdminCardPayment = ({ orderId, amount, onSuccess }: AdminCardPaymentProps) => {
    const [cardReference, setCardReference] = useState('');
    const [cardLast4, setCardLast4] = useState('');
    const [cardType, setCardType] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleConfirmPayment = async () => {
        if (!cardReference) {
            toast({
                title: "Missing Information",
                description: "Please provide the card transaction reference",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            // TODO: Replace with actual API call
            // const response = await transactionService.createTransaction({
            //   orderId,
            //   amount,
            //   paymentMethod: 'card',
            //   description: `Card payment - Ref: ${cardReference}`,
            // });

            // Simulate API call
            setTimeout(() => {
                const transactionData = {
                    transactionId: `TXN-${Date.now()}`,
                    cardReference,
                    cardLast4,
                    cardType,
                    amount,
                    notes,
                    timestamp: new Date().toISOString(),
                };

                toast({
                    title: "Card Payment Recorded",
                    description: "Card payment has been confirmed",
                });

                onSuccess(transactionData);
            }, 1500);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to record card payment",
                variant: "destructive",
            });
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Card Payment</h3>
                            <p className="text-sm text-muted-foreground">Record card payment details</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Payment Amount:</span>
                                <span className="text-xl font-bold text-primary">
                                    KSh {amount.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="card-reference">Transaction Reference *</Label>
                            <Input
                                id="card-reference"
                                value={cardReference}
                                onChange={(e) => setCardReference(e.target.value)}
                                placeholder="e.g., AUTH123456"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="card-last4">Last 4 Digits (Optional)</Label>
                                <Input
                                    id="card-last4"
                                    value={cardLast4}
                                    onChange={(e) => setCardLast4(e.target.value.slice(0, 4))}
                                    placeholder="1234"
                                    maxLength={4}
                                />
                            </div>

                            <div>
                                <Label htmlFor="card-type">Card Type (Optional)</Label>
                                <Input
                                    id="card-type"
                                    value={cardType}
                                    onChange={(e) => setCardType(e.target.value)}
                                    placeholder="Visa, Mastercard..."
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="notes">Additional Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any additional information about this payment..."
                                rows={3}
                            />
                        </div>

                        <Button
                            onClick={handleConfirmPayment}
                            className="w-full"
                            size="lg"
                            disabled={loading || !cardReference}
                        >
                            {loading ? (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Recording Payment...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Confirm Card Payment
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AdminCardPayment;