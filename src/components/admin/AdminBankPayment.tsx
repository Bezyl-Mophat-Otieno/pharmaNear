import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminBankPaymentProps {
    orderId: string;
    amount: number;
    onSuccess: (transactionData: any) => void;
}

const AdminBankPayment = ({ orderId, amount, onSuccess }: AdminBankPaymentProps) => {
    const [bankReference, setBankReference] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleConfirmPayment = async () => {
        if (!bankReference || !bankName) {
            toast({
                title: "Missing Information",
                description: "Please provide bank reference and bank name",
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
            //   paymentMethod: 'bank_transfer',
            //   description: `Bank: ${bankName}, Ref: ${bankReference}`,
            // });

            // Simulate API call
            setTimeout(() => {
                const transactionData = {
                    transactionId: `TXN-${Date.now()}`,
                    bankReference,
                    bankName,
                    accountNumber,
                    amount,
                    notes,
                    timestamp: new Date().toISOString(),
                };

                toast({
                    title: "Bank Payment Recorded",
                    description: "Bank transfer payment has been confirmed",
                });

                onSuccess(transactionData);
            }, 1500);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to record bank payment",
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
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Bank Transfer Payment</h3>
                            <p className="text-sm text-muted-foreground">Record bank transfer details</p>
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
                            <Label htmlFor="bank-reference">Bank Reference Number *</Label>
                            <Input
                                id="bank-reference"
                                value={bankReference}
                                onChange={(e) => setBankReference(e.target.value)}
                                placeholder="e.g., TRF202501240001"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="bank-name">Bank Name *</Label>
                            <Input
                                id="bank-name"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                placeholder="e.g., KCB Bank"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="account-number">Account Number (Optional)</Label>
                            <Input
                                id="account-number"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="Sender's account number"
                            />
                        </div>

                        <div>
                            <Label htmlFor="notes">Additional Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any additional information about this transfer..."
                                rows={3}
                            />
                        </div>

                        <Button
                            onClick={handleConfirmPayment}
                            className="w-full"
                            size="lg"
                            disabled={loading || !bankReference || !bankName}
                        >
                            {loading ? (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Recording Payment...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Confirm Bank Payment
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AdminBankPayment;