import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function PWAUpdatePrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [updateSW, setUpdateSW] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            import('virtual:pwa-register').then(({ registerSW }) => {
                const update = registerSW({
                    onNeedRefresh() {
                        setShowPrompt(true);
                        setUpdateSW(() => update);
                    },
                    onOfflineReady() {
                        toast({
                            title: 'App ready to work offline',
                            description: 'You can now use the app without an internet connection.',
                        });
                    },
                });
            });
        }
    }, [toast]);

    const handleUpdate = () => {
        if (updateSW) {
            updateSW(true);
        }
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">Update Available</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                A new version of the app is available. Reload to update?
            </p>
            <div className="flex gap-2">
                <Button onClick={handleUpdate} size="sm">
                    Update Now
                </Button>
                <Button onClick={() => setShowPrompt(false)} variant="outline" size="sm">
                    Later
                </Button>
            </div>
        </div>
    );
}
