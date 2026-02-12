import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface SellerDeleteModalProps {
    businessName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    loading?: boolean;
}

export function SellerDeleteModal({
    businessName,
    open,
    onOpenChange,
    onConfirm,
    loading,
}: SellerDeleteModalProps) {
    return (
        <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Business
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{businessName}</strong>? This action is irreversible and will permanently remove all associated data.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-md bg-destructive/10 p-4 my-2">
                    <p className="text-sm text-destructive font-medium">⚠️ This cannot be undone</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        All business information, documents, and related records will be permanently deleted.
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={loading}>
                        {loading ? 'Deleting...' : 'Delete Business'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
