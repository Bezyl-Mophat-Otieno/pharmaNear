import { useState, useEffect, useCallback } from 'react';
import { Business, BusinessStats, BusinessStatus, businessService } from '@/services/businessService';

export const useAdminBusinesses = () => {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [stats, setStats] = useState<BusinessStats>({ total: 0, approved: 0, pending: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<{
        status?: BusinessStatus;
        search?: string;
        dateFrom?: string;
        dateTo?: string;
    }>({});

    const fetchBusinesses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await businessService.getBusinesses(filters);
            setBusinesses(response.data);
            setStats(response.stats);
            setError(null);
        } catch (err) {
            setError('Failed to fetch businesses');
            console.error('Error fetching businesses:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchBusinesses();
    }, [fetchBusinesses]);

    const updateBusiness = async (id: string, data: Partial<Business>) => {
        const updated = await businessService.updateBusiness(id, data);
        setBusinesses(prev => prev.map(b => b.id === id ? updated : b));
        return updated;
    };

    const deleteBusiness = async (id: string) => {
        await businessService.deleteBusiness(id);
        setBusinesses(prev => prev.filter(b => b.id !== id));
        setStats(prev => ({ ...prev, total: prev.total - 1 }));
    };

    const approveBusiness = async (id: string, documentIds: string[]) => {
        const updated = await businessService.approveBusiness(id, documentIds);
        setBusinesses(prev => prev.map(b => b.id === id ? updated : b));
        setStats(prev => ({ ...prev, approved: prev.approved + 1, pending: prev.pending - 1 }));
        return updated;
    };

    const rejectBusiness = async (id: string, reason: string, rejectedDocumentIds: string[]) => {
        const updated = await businessService.rejectBusiness(id, { reason, rejectedDocumentIds });
        setBusinesses(prev => prev.map(b => b.id === id ? updated : b));
        setStats(prev => ({ ...prev, rejected: prev.rejected + 1, pending: prev.pending - 1 }));
        return updated;
    };

    return {
        businesses,
        stats,
        loading,
        error,
        filters,
        setFilters,
        refetch: fetchBusinesses,
        updateBusiness,
        deleteBusiness,
        approveBusiness,
        rejectBusiness,
    };
};
