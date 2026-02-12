import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Mail, User, FileText, ExternalLink, Calendar, Building2 } from 'lucide-react';
import { Seller } from '@/services/sellerService';

interface SellerDetailModalProps {
    seller: Seller;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (seller: Seller) => void;
    onApprove: () => void;
    onReject: () => void;
}

export function SellerDetailModal({
    seller,
    open,
    onOpenChange,
    onEdit,
    onApprove,
    onReject,
}: SellerDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        businessName: seller.businessName,
        businessType: seller.businessType || '',
        address: seller.address,
    });

    const handleSave = () => {
        onEdit({ ...seller, ...editData });
        setIsEditing(false);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            approved: 'bg-green-100 text-green-800 border-green-300',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            rejected: 'bg-red-100 text-red-800 border-red-300',
        };
        return <Badge className={`${variants[status] || ''} border`}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {seller.businessName}
                        </DialogTitle>
                        {getStatusBadge(seller.status)}
                    </div>
                </DialogHeader>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">Business Details</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="owner">Owner Info</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 mt-4">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Business Name</Label>
                                    <Input
                                        value={editData.businessName}
                                        onChange={(e) => setEditData(prev => ({ ...prev, businessName: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Business Type</Label>
                                    <Input
                                        value={editData.businessType}
                                        onChange={(e) => setEditData(prev => ({ ...prev, businessType: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Address</Label>
                                    <Input
                                        value={editData.address}
                                        onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleSave}>Save Changes</Button>
                                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Card>
                                    <CardContent className="pt-6 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Business Name</p>
                                                <p className="font-medium">{seller.businessName}</p>
                                            </div>
                                        </div>
                                        {seller.businessType && (
                                            <div className="flex items-start gap-3">
                                                <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Business Type</p>
                                                    <p className="font-medium">{seller.businessType}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Location</p>
                                                <p className="font-medium">{seller.address}</p>
                                                {seller.latitude && seller.longitude && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Coordinates: {seller.latitude.toFixed(6)}, {seller.longitude.toFixed(6)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Registered</p>
                                                <p className="font-medium">{new Date(seller.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Details</Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="documents" className="space-y-4 mt-4">
                        {seller.documents.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No documents uploaded</p>
                        ) : (
                            <div className="space-y-3">
                                {seller.documents.map((doc) => (
                                    <Card key={doc.id}>
                                        <CardContent className="flex items-center justify-between py-4">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-primary" />
                                                <div>
                                                    <p className="font-medium">{doc.name}</p>
                                                    <p className="text-sm text-muted-foreground capitalize">
                                                        {doc.type.replace('_', ' ')} · Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4 mr-1" />
                                                    View
                                                </a>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="owner" className="space-y-4 mt-4">
                        <Card>
                            <CardContent className="pt-6 space-y-3">
                                <div className="flex items-start gap-3">
                                    <User className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Owner Name</p>
                                        <p className="font-medium">{seller.owner.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{seller.owner.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {seller.rejectionReason && (
                    <>
                        <Separator />
                        <div className="rounded-md bg-destructive/10 p-4">
                            <p className="text-sm font-medium text-destructive">Rejection Reason</p>
                            <p className="text-sm mt-1">{seller.rejectionReason}</p>
                        </div>
                    </>
                )}

                <DialogFooter className="gap-2">
                    {seller.status === 'pending' && (
                        <>
                            <Button variant="destructive" onClick={onReject}>Reject</Button>
                            <Button onClick={onApprove}>Approve</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
