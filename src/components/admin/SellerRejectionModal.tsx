import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, FileText } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Seller } from '@/services/sellerService';

interface SellerRejectionModalProps {
    seller: Seller;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason: string, rejectedDocumentIds: string[]) => Promise<void>;
}

export function SellerRejectionModal({
    seller,
    open,
    onOpenChange,
    onConfirm,
}: SellerRejectionModalProps) {
    const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set());
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isValid = checkedDocs.size > 0 && reason.trim().length > 0;

    const toggleDoc = (docId: string) => {
        setCheckedDocs(prev => {
            const next = new Set(prev);
            if (next.has(docId)) next.delete(docId);
            else next.add(docId);
            return next;
        });
    };

    const handleConfirm = async () => {
        if (!isValid) return;
        setSubmitting(true);
        try {
            await onConfirm(reason.trim(), Array.from(checkedDocs));
            setCheckedDocs(new Set());
            setReason('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={submitting ? undefined : onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Reject Business
                    </DialogTitle>
                    <DialogDescription>
                        Please specify the reason for rejecting <strong>{seller.businessName}</strong> and select the documents that are non-compliant.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Select non-compliant documents (at least one):</p>
                        {seller.documents.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">No documents submitted</p>
                        ) : (
                            <div className="space-y-3">
                                    {seller.documents.map((doc) => (
                                    <label
                                        key={doc.id}
                                        className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                                    >
                                        <Checkbox
                                            checked={checkedDocs.has(doc.id)}
                                            onCheckedChange={() => toggleDoc(doc.id)}
                                            className="mt-0.5"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-destructive flex-shrink-0" />
                                                <span className="font-medium text-sm">{doc.name}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 capitalize">
                                                {doc.type.replace('_', ' ')}
                                            </p>
                                        </div>
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline flex-shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            View
                                        </a>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rejection-reason">
                            Rejection Reason <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="rejection-reason"
                            placeholder="Explain why this business registration is being rejected. This message will be sent to the business owner via email."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                        />
                        {reason.trim().length === 0 && (
                            <p className="text-xs text-muted-foreground">A rejection reason is required</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm} disabled={!isValid || submitting}>
                        {submitting ? <LoadingSpinner size="sm" /> : 'Confirm Rejection'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
