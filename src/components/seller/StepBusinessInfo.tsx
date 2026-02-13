import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Building2, MapPin, Info, Loader2 } from 'lucide-react';
import { OnboardingData } from '@/pages/seller/SellerOnboarding';
import geocodingService from '@/services/geocoding';
import type { Location } from '@/types/geocoding';
interface Props {
    data: OnboardingData;
    updateData: (d: Partial<OnboardingData>) => void;
    onNext: () => void;
    onBack: () => void;
}
const BUSINESS_TYPES = [
    'Pharmacy',
    'Wholesale Distributor',
    'Medical Equipment Supplier',
    'Herbal & Alternative Medicine',
    'Laboratory Supplier',
    'Other',
];
const StepBusinessInfo = ({ data, updateData, onNext, onBack }: Props) => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const debounceTimer = useRef<NodeJS.Timeout>();
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await geocodingService.geocode(searchQuery);
                if (response.success) {
                    setSuggestions(response.data);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                console.error('Geocoding error:', error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchQuery]);

    const handleLocationSelect = (location: Location) => {
        const fullAddress = `${location.name}${location.state ? ', ' + location.state : ''}, ${location.country}`;
        setSelectedLocation(location);
        setSearchQuery(fullAddress);
        updateData({
            address: fullAddress,
            latitude: location.lat,
            longitude: location.lon
        });
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!data.businessName.trim()) errs.businessName = 'Business name is required';
        if (!data.address.trim()) errs.address = 'Location is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (validate()) onNext();
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Business Information
                </CardTitle>
                <CardDescription>
                    Tell us about your business so customers can find you.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                        id="businessName"
                        value={data.businessName}
                        onChange={e => updateData({ businessName: e.target.value })}
                        placeholder="e.g. MediCare Pharmacy"
                    />
                    {errors.businessName && <p className="text-xs text-destructive">{errors.businessName}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Business Type (optional)</Label>
                    <Select value={data.businessType} onValueChange={v => updateData({ businessType: v })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {BUSINESS_TYPES.map(t => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 relative">
                    <Label htmlFor="address">Business Location</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="address"
                            value={searchQuery}
                            onChange={e => {
                                setSearchQuery(e.target.value);
                                if (!e.target.value.trim()) {
                                    updateData({ address: '', latitude: undefined, longitude: undefined });
                                    setSelectedLocation(null);
                                }
                            }}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            placeholder="Search for your business location..."
                            className="pl-9 pr-9"
                        />
                        {isLoading && (
                            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    {showSuggestions && suggestions.length > 0 && (
                        <div
                            ref={suggestionsRef}
                            className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto"
                        >
                            {suggestions.map((location, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleLocationSelect(location)}
                                    className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-start gap-2 border-b last:border-b-0"
                                >
                                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm">{location.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {location.state && `${location.state}, `}{location.country}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            Lat: {location.lat.toFixed(4)}, Lon: {location.lon.toFixed(4)}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedLocation && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 text-xs">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                            <div>
                                <div className="font-medium">Selected Location</div>
                                <div className="text-muted-foreground mt-1">
                                    {selectedLocation.name}{selectedLocation.state && `, ${selectedLocation.state}`}, {selectedLocation.country}
                                </div>
                                <div className="text-muted-foreground mt-0.5">
                                    Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
                                </div>
                            </div>
                        </div>
                    )}

                    {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}

                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>
                            Start typing your city or location name to see suggestions.
                            Select a location from the dropdown to automatically capture coordinates.
                        </span>
                    </div>
                </div>
                <div className="flex justify-between pt-2">
                    <Button variant="ghost" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <Button onClick={handleNext}>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
export default StepBusinessInfo;