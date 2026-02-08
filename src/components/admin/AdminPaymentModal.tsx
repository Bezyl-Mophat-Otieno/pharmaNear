import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Smartphone, Building, Banknote } from 'lucide-react';
import AdminMpesaPayment from './AdminMpesaPayment';
import AdminBankPayment from './AdminBankPayment';
import AdminCashPayment from './AdminCashPayment';
import AdminCardPayment from './AdminCardPayment';
import { Order } from '@/types/order';

interface AdminPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order
    onPaymentComplete: (transactionData: any) => void;
}

type PaymentMethod = 'mpesa' | 'card' | 'bank_transfer' | 'cash';

const AdminPaymentModal = ({ isOpen, onClose, order, onPaymentComplete }: AdminPaymentModalProps) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
        (order.paymentMethod as PaymentMethod) || 'mpesa'
    );
    const [step, setStep] = useState<'select' | 'process'>('select');

    const handleMethodChange = (method: string) => {
        setSelectedMethod(method as PaymentMethod);
    };

    const handleBeginPayment = () => {
        setStep('process');
    };

    const handlePaymentSuccess = (transactionData: any) => {
        onPaymentComplete(transactionData);
        onClose();
    };

    const handleBack = () => {
        setStep('select');
    };

    const paymentIcons = {
        mpesa: <Smartphone className="h-5 w-5" />,
        card: <CreditCard className="h-5 w-5" />,
        bank_transfer: <Building className="h-5 w-5" />,
        cash: <Banknote className="h-5 w-5" />,
    };

    const paymentLabels = {
        mpesa: 'M-Pesa',
        card: 'Debit/Credit Card',
        bank_transfer: 'Bank Transfer',
        cash: 'Cash Payment',
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Process Payment - Order #{order.orderNumber}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {step === 'select' ? (
                        <>
                            <div className="bg-muted p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Customer:</span>
                                        <p className="font-medium">{order.customerInfo.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Amount:</span>
                                        <p className="font-medium text-lg">KSh {order.total.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium mb-2 block">Select Payment Method</Label>
                                    <Select value={selectedMethod} onValueChange={handleMethodChange}>
                                        <SelectTrigger className="w-full">
                                            <div className="flex items-center gap-2">
                                                {paymentIcons[selectedMethod]}
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mpesa">
                                                <div className="flex items-center gap-2">
                                                    <Smartphone className="h-4 w-4" />
                                                    M-Pesa
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="card">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4" />
                                                    Debit/Credit Card
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="bank_transfer">
                                                <div className="flex items-center gap-2">
                                                    <Building className="h-4 w-4" />
                                                    Bank Transfer
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="cash">
                                                <div className="flex items-center gap-2">
                                                    <Banknote className="h-4 w-4" />
                                                    Cash Payment
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg text-sm">
                                    <p className="text-blue-800 dark:text-blue-200">
                                        {order.paymentMethod && order.paymentMethod === selectedMethod
                                            ? '✓ This is the payment method selected by the customer'
                                            : order.paymentMethod
                                                ? `Note: Customer selected ${paymentLabels[order.paymentMethod as PaymentMethod]}`
                                                : 'No payment method was selected by the customer'}
                                    </p>
                                </div>

                                <Button onClick={handleBeginPayment} className="w-full" size="lg">
                                    Begin Payment
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <Button variant="outline" onClick={handleBack} className="mb-4">
                                ← Back to Payment Methods
                            </Button>

                            {selectedMethod === 'mpesa' && (
                                <AdminMpesaPayment
                                    orderId={order.orderId}
                                    amount={order.total}
                                    customerPhone={order.customerInfo.phone}
                                    onSuccess={handlePaymentSuccess}
                                />
                            )}

                            {selectedMethod === 'card' && (
                                <AdminCardPayment
                                    orderId={order.orderId}
                                    amount={order.total}
                                    onSuccess={handlePaymentSuccess}
                                />
                            )}

                            {selectedMethod === 'bank_transfer' && (
                                <AdminBankPayment
                                    orderId={order.orderId}
                                    amount={order.total}
                                    onSuccess={handlePaymentSuccess}
                                />
                            )}

                            {selectedMethod === 'cash' && (
                                <AdminCashPayment
                                    order={order}
                                    amount={order.total}
                                    onSuccess={handlePaymentSuccess}
                                />
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AdminPaymentModal;