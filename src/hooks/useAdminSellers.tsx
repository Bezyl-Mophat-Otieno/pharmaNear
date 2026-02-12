import { Seller, sellerService, SellerStats, SellerStatus } from '@/services/sellerService';
import { useState, useEffect, useCallback } from 'react';

export const useAdminsellers = () => {
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [stats, setStats] = useState<SellerStats>({ total: 0, approved: 0, pending: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<{
        status?: SellerStatus;
        search?: string;
        dateFrom?: string;
        dateTo?: string;
    }>({});

    const fetchsellers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await sellerService.getSellers(filters);
            setSellers(response.data);
            setStats(response.stats);
            setError(null);
        } catch (err) {
            setError('Failed to fetch sellers');
            console.error('Error fetching sellers:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchsellers();
    }, [fetchsellers]);

    const updateSeller = async (id: string, data: Partial<Seller>) => {
        const updated = await sellerService.updateSeller(id, data);
        setSellers(prev => prev.map(b => b.id === id ? updated : b));
        return updated;
    };

    const deleteSeller = async (id: string) => {
        await sellerService.deleteSeller(id);
        setSellers(prev => prev.filter(b => b.id !== id));
        setStats(prev => ({ ...prev, total: prev.total - 1 }));
    };

    const approveSeller = async (id: string, documentIds: string[]) => {
        const updated = await sellerService.approveSeller(id, documentIds);
        setSellers(prev => prev.map(b => b.id === id ? updated : b));
        setStats(prev => ({ ...prev, approved: prev.approved + 1, pending: prev.pending - 1 }));
        return updated;
    };

    const rejectSeller = async (id: string, reason: string, rejectedDocumentIds: string[]) => {
        const updated = await sellerService.rejectSeller(id, { reason, rejectedDocumentIds });
        setSellers(prev => prev.map(b => b.id === id ? updated : b));
        setStats(prev => ({ ...prev, rejected: prev.rejected + 1, pending: prev.pending - 1 }));
        return updated;
    };

    return {
        sellers,
        stats,
        loading,
        error,
        filters,
        setFilters,
        refetch: fetchsellers,
        updateSeller,
        deleteSeller,
        approveSeller,
        rejectSeller,
    };
};
