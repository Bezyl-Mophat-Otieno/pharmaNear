import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Seller } from '@/services/sellerService';
import { CheckCircle2, FileText, ShieldCheck } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SellerApprovalModalProps {
    seller: Seller;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (documentIds: string[]) => Promise<void>;
}

export function SellerApprovalModal({
    seller,
    open,
    onOpenChange,
    onConfirm,
}: SellerApprovalModalProps) {
    const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set());
    const [submitting, setSubmitting] = useState(false);

    const allChecked = seller.documents.length > 0 && checkedDocs.size === seller.documents.length;

    const toggleDoc = (docId: string) => {
        setCheckedDocs(prev => {
            const next = new Set(prev);
            if (next.has(docId)) next.delete(docId);
            else next.add(docId);
            return next;
        });
    };

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            await onConfirm(Array.from(checkedDocs));
            setCheckedDocs(new Set());
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={submitting ? undefined : onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Approve Business
                    </DialogTitle>
                    <DialogDescription>
                        Please confirm that you have reviewed all submitted documents for <strong>{seller.businessName}</strong> before approving.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-sm font-medium">Review & confirm each document:</p>
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
                                            <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                                            <span className="font-medium text-sm">{doc.name}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                                            {doc.type.replace('_', ' ')} · Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
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

                    {allChecked && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm font-medium">All documents reviewed</span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={!allChecked || submitting}>
                        {submitting ? <LoadingSpinner size="sm" /> : 'Confirm Approval'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
