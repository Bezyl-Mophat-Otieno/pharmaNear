import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Banknote, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminTransactions } from '@/hooks/useAdminData';
import { Order } from '@/types/order';
import { Transaction } from '@/types/transaction';

interface AdminCashPaymentProps {
    order: Order;
    amount: number;
    onSuccess: (transactionData: any) => void;
}

const AdminCashPayment = ({ order, amount, onSuccess }: AdminCashPaymentProps) => {
    const [receivedAmount, setReceivedAmount] = useState(amount.toString());
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const {createTransaction} = useAdminTransactions();
    const parsedAmount = Number.parseFloat(receivedAmount) || 0;
    const change = parsedAmount - amount;

    const handleConfirmPayment = async () => {
        if (parsedAmount < amount) {
            toast({
                title: "Insufficient Amount",
                description: `Received amount is less than the required KSh ${amount.toLocaleString()}`,
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await createTransaction({
                orderId: order.orderId,
                customerFullname: order.customerInfo.name,
                customerEmail: order.customerInfo.email,
                customerPhone: order.customerInfo.phone,
                methodOfPayment: 'cash',
                transactionType: 'order_payment',
                totalAmount: order.total,
                totalAmountReceived: parsedAmount,
                notes: notes,
            });
            const transactionData = response.data as Transaction;
                toast({
                    title: "Cash Payment Recorded",
                    description: `KSh ${parsedAmount.toLocaleString()} received in cash`,
                });

                onSuccess(transactionData);
        } catch {
            toast({
                title: "Error",
                description: "Failed to record cash payment",
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
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                            <Banknote className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Cash Payment</h3>
                            <p className="text-sm text-muted-foreground">Confirm cash payment received</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Required Amount:</span>
                                <span className="text-lg font-bold">KSh {amount.toLocaleString()}</span>
                            </div>
                            {change > 0 && (
                                <div className="flex justify-between items-center text-sm border-t pt-2">
                                    <span className="text-muted-foreground">Change to Return:</span>
                                    <span className="font-semibold text-orange-600">
                                        KSh {change.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="received-amount">Amount Received *</Label>
                            <Input
                                id="received-amount"
                                type="number"
                                value={receivedAmount}
                                onChange={(e) => setReceivedAmount(e.target.value)}
                                placeholder="0"
                                required
                                min={0}
                                step="0.01"
                            />
                            {parsedAmount < amount && parsedAmount > 0 && (
                                <p className="text-xs text-red-600 mt-1">
                                    Amount is less than required by KSh {(amount - parsedAmount).toLocaleString()}
                                </p>
                            )}
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
                            disabled={loading || parsedAmount < amount}
                        >
                            {loading ? (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Recording Payment...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Confirm Cash Payment
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AdminCashPayment;