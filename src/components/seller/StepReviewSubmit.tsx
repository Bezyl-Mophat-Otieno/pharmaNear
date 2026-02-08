import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Send, Loader2, User, Building2, FileText, CheckCircle2 } from 'lucide-react';
import { sellerService } from '@/services/sellerService';
import { useToast } from '@/hooks/use-toast';
import { OnboardingData } from '@/pages/tenant/TenantOnboarding';
interface Props {
    data: OnboardingData;
    onBack: () => void;
    onSubmit: () => void;
}
const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {title}
        </h4>
        <div className="pl-6 space-y-1 text-sm text-muted-foreground">{children}</div>
    </div>
);
const StepReviewSubmit = ({ data, onBack, onSubmit }: Props) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await sellerService.submitOnboarding({
                userId: data.userId || '',
                business: {
                    businessName: data.businessName,
                    businessType: data.businessType,
                    address: data.address,
                    latitude: data.latitude,
                    longitude: data.longitude,
                },
                documents: {
                    ppbLicense: data.ppbLicenseUrl,
                    businessPermit: data.businessPermitUrl,
                },
            });
            if (res.success) {
                toast({ title: 'Submitted!', description: 'Your business registration is under review.' });
                onSubmit();
            } else {
                toast({ title: 'Submission failed', description: res.message, variant: 'destructive' });
            }
        } catch {
            // handled by interceptor
        } finally {
            setLoading(false);
        }
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Review & Submit
                </CardTitle>
                <CardDescription>
                    Please review your information before submitting. You can go back to edit any section.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <Section icon={User} title="Account">
                    <p><span className="text-foreground">{data.firstName} {data.lastName}</span></p>
                    <p>{data.email}</p>
                </Section>
                <Separator />
                <Section icon={Building2} title="Business">
                    <p><span className="text-foreground">{data.businessName}</span></p>
                    {data.businessType && <p>Type: {data.businessType}</p>}
                    <p>{data.address}</p>
                </Section>
                <Separator />
                <Section icon={FileText} title="Documents">
                    <div className="flex flex-wrap gap-2">
                        {data.ppbLicenseUrl ? (
                            <Badge variant="secondary" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" /> PPB License
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-muted-foreground">PPB License — not uploaded</Badge>
                        )}
                        {data.businessPermitUrl ? (
                            <Badge variant="secondary" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Business Permit
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-muted-foreground">Business Permit — not uploaded</Badge>
                        )}
                    </div>
                </Section>
                <Separator />
                <div className="flex justify-between pt-2">
                    <Button variant="ghost" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} size="lg">
                        {loading ? (
                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
                        ) : (
                            <><Send className="h-4 w-4 mr-2" /> Submit Business Registration</>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
export default StepReviewSubmit;