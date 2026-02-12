import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Building2, MapPin, Info } from 'lucide-react';
import { OnboardingData } from '@/pages/seller/SellerOnboarding'
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
                <div className="space-y-2">
                    <Label htmlFor="address">Business Location</Label>
                    <Textarea
                        id="address"
                        value={data.address}
                        onChange={e => updateData({ address: e.target.value })}
                        placeholder="Enter your full business address, e.g. Kenyatta Avenue, CBD, Nairobi"
                        rows={3}
                    />
                    {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>
                            Please provide an accurate address. You can confirm your exact location using Google Maps.
                            Accurate locations help customers discover your business more easily.
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