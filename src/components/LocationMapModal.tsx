import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

interface LocationMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessName: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    distance?: number;
}

const LocationMapModal = ({
    isOpen,
    onClose,
    businessName,
    latitude,
    longitude,
    address,
    distance,
}: LocationMapModalProps) => {
    if (!latitude || !longitude) {
        return null;
    }

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const appleMapsUrl = `http://maps.apple.com/?q=${latitude},${longitude}`;
    const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;

    // OpenStreetMap embed URL
    const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        {businessName} Location
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Map Embed */}
                    <div className="relative w-full h-[400px] rounded-lg overflow-hidden border">
                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            src={osmEmbedUrl}
                            title={`${businessName} location map`}
                        />
                    </div>

                    {/* Location Details */}
                    <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Address</p>
                                <p className="text-sm text-muted-foreground">
                                    {address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`}
                                </p>
                            </div>
                        </div>

                        {distance !== undefined && (
                            <div className="flex items-start gap-2">
                                <Navigation className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Distance</p>
                                    <p className="text-sm text-muted-foreground">
                                        {distance < 1
                                            ? `${(distance * 1000).toFixed(0)} meters away`
                                            : `${distance.toFixed(2)} km away`
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Options */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Open in:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => window.open(googleMapsUrl, '_blank')}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Google Maps
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => window.open(appleMapsUrl, '_blank')}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Apple Maps
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => window.open(wazeUrl, '_blank')}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Waze
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LocationMapModal;
