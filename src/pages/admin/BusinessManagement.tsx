import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { SellerDetailModal } from '@/components/admin/Seller';
import { SellerApprovalModal } from '@/components/admin/SellerApprovalModal';
import { SellerRejectionModal } from '@/components/admin/SellerRejectionModal';
import { SellerDeleteModal } from '@/components/admin/SellerDeleteModal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
    Search, Eye, Trash2, CheckCircle, XCircle,
    Building2, Clock, ShieldCheck, ShieldX,
} from 'lucide-react';
import { useAdminsellers } from '@/hooks/useAdminSellers';
import { Seller, SellerStatus } from '@/services/sellerService';
const BusinessManagement = () => {
    const { toast } = useToast();
    const {
        sellers, stats, loading, error, filters, setFilters,
        refetch, updateSeller, deleteSeller, approveSeller, rejectSeller,
    } = useAdminsellers();
    const [selectedBusiness, setSelectedBusiness] = useState<Seller | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [approvalOpen, setApprovalOpen] = useState(false);
    const [rejectionOpen, setRejectionOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    // Local filtering on top of server-side filters
    const filtered = sellers.filter(b => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            b.businessName.toLowerCase().includes(q) ||
            b.owner.email.toLowerCase().includes(q) ||
            b.owner.name.toLowerCase().includes(q)
        );
    });
    const handleStatusFilter = (status: string) => {
        setFilters(prev => ({
            ...prev,
            status: status === 'all' ? undefined : status as SellerStatus,
        }));
    };
    const handleStatClick = (status?: SellerStatus) => {
        setFilters(prev => ({ ...prev, status }));
    };
    const handleEdit = async (business: Seller) => {
        try {
            await updateSeller(business.id, {
                businessName: business.businessName,
                businessType: business.businessType,
                address: business.address,
            });
            toast({ title: 'Business Updated', description: 'Business details have been saved.' });
            setDetailOpen(false);
        } catch {
            toast({ title: 'Error', description: 'Failed to update business.', variant: 'destructive' });
        }
    };
    const handleApprove = async (documentIds: string[]) => {
        if (!selectedBusiness) return;
        try {
            await approveSeller(selectedBusiness.id, documentIds);
            toast({ title: 'Business Approved', description: `${selectedBusiness.businessName} has been approved.` });
            setApprovalOpen(false);
            setDetailOpen(false);
        } catch {
            toast({ title: 'Error', description: 'Failed to approve business.', variant: 'destructive' });
        }
    };
    const handleReject = async (reason: string, rejectedDocumentIds: string[]) => {
        if (!selectedBusiness) return;
        try {
            await rejectSeller(selectedBusiness.id, reason, rejectedDocumentIds);
            toast({ title: 'Business Rejected', description: `${selectedBusiness.businessName} has been rejected. Owner will be notified.` });
            setRejectionOpen(false);
            setDetailOpen(false);
        } catch {
            toast({ title: 'Error', description: 'Failed to reject business.', variant: 'destructive' });
        }
    };
    const handleDelete = async () => {
        if (!selectedBusiness) return;
        setDeleteLoading(true);
        try {
            await deleteSeller(selectedBusiness.id);
            toast({ title: 'Business Deleted', description: `${selectedBusiness.businessName} has been removed.` });
            setDeleteOpen(false);
            setSelectedBusiness(null);
        } catch {
            toast({ title: 'Error', description: 'Failed to delete business.', variant: 'destructive' });
        } finally {
            setDeleteLoading(false);
        }
    };
    const getStatusBadge = (status: SellerStatus) => {
        const variants: Record<string, string> = {
            approved: 'bg-green-100 text-green-800 border-green-300',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            rejected: 'bg-red-100 text-red-800 border-red-300',
        };
        return <Badge className={`${variants[status]} border`}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };
    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Business Management</h1>
                    <p className="text-muted-foreground">Monitor and manage registered sellers</p>
                </div>
                <div className="h-96 flex items-center justify-center">
                    <LoadingSpinner size="lg" text="Loading sellers..." />
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Business Management</h1>
                    <p className="text-muted-foreground">Monitor and manage registered sellers</p>
                </div>
                <div className="text-center py-12">
                    <p className="text-destructive">{error}</p>
                    <Button onClick={refetch} className="mt-4">Retry</Button>
                </div>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Business Management</h1>
                <p className="text-muted-foreground">Monitor and manage registered sellers</p>
            </div>
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card
                    className={`cursor-pointer transition-shadow hover:shadow-md ${!filters.status ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleStatClick(undefined)}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total sellers</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card
                    className={`cursor-pointer transition-shadow hover:shadow-md ${filters.status === 'approved' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleStatClick('approved')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                    </CardContent>
                </Card>
                <Card
                    className={`cursor-pointer transition-shadow hover:shadow-md ${filters.status === 'pending' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleStatClick('pending')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Awaiting Approval</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card
                    className={`cursor-pointer transition-shadow hover:shadow-md ${filters.status === 'rejected' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleStatClick('rejected')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        <ShieldX className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    </CardContent>
                </Card>
            </div>
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters & Search</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by business name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Select value={filters.status || 'all'} onValueChange={handleStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="pending">Awaiting Approval</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => { setSearchTerm(''); setFilters({}); }}>
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {/* Business Table */}
            <Card>
                <CardHeader>
                    <CardTitle>sellers ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Business Name</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No sellers found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((business) => (
                                    <TableRow key={business.id}>
                                        <TableCell className="font-medium">{business.businessName}</TableCell>
                                        <TableCell>{business.owner.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{business.owner.email}</TableCell>
                                        <TableCell>{getStatusBadge(business.status)}</TableCell>
                                        <TableCell>
                                            {new Date(business.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button size="sm" variant="outline" onClick={() => { setSelectedBusiness(business); setDetailOpen(true); }}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {business.status === 'pending' && (
                                                    <>
                                                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700"
                                                            onClick={() => { setSelectedBusiness(business); setApprovalOpen(true); }}>
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700"
                                                            onClick={() => { setSelectedBusiness(business); setRejectionOpen(true); }}>
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive"
                                                    onClick={() => { setSelectedBusiness(business); setDeleteOpen(true); }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {/* Modals */}
            {selectedBusiness && (
                <>
                    <SellerDetailModal
                        seller={selectedBusiness}
                        open={detailOpen}
                        onOpenChange={setDetailOpen}
                        onEdit={handleEdit}
                        onApprove={() => { setDetailOpen(false); setApprovalOpen(true); }}
                        onReject={() => { setDetailOpen(false); setRejectionOpen(true); }}
                    />
                    <SellerApprovalModal
                        seller={selectedBusiness}
                        open={approvalOpen}
                        onOpenChange={setApprovalOpen}
                        onConfirm={handleApprove}
                    />
                    <SellerRejectionModal
                        seller={selectedBusiness}
                        open={rejectionOpen}
                        onOpenChange={setRejectionOpen}
                        onConfirm={handleReject}
                    />
                    <SellerDeleteModal
                        businessName={selectedBusiness.businessName}
                        open={deleteOpen}
                        onOpenChange={setDeleteOpen}
                        onConfirm={handleDelete}
                        loading={deleteLoading}
                    />
                </>
            )}
        </div>
    );
};
export default BusinessManagement;