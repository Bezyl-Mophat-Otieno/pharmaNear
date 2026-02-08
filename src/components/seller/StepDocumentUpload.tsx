import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, FileText, Upload, CheckCircle2, Loader2, Info } from 'lucide-react';
import { sellerService } from '@/services/sellerService';
import { useToast } from '@/hooks/use-toast';
import { OnboardingData } from '@/pages/tenant/TenantOnboarding';
interface Props {
    data: OnboardingData;
    updateData: (d: Partial<OnboardingData>) => void;
    onNext: () => void;
    onBack: () => void;
}
const StepDocumentUpload = ({ data, updateData, onNext, onBack }: Props) => {
    const { toast } = useToast();
    const ppbRef = useRef<HTMLInputElement>(null);
    const permitRef = useRef<HTMLInputElement>(null);
    const [uploadingPpb, setUploadingPpb] = useState(false);
    const [uploadingPermit, setUploadingPermit] = useState(false);
    const handleUpload = async (
        file: File,
        type: 'ppb' | 'permit'
    ) => {
        const setLoading = type === 'ppb' ? setUploadingPpb : setUploadingPermit;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await sellerService.uploadDocument(formData);
            const resData = res.data as any;
            if (res.success && resData?.url) {
                if (type === 'ppb') {
                    updateData({ ppbLicenseUrl: resData.url, ppbLicenseName: file.name });
                } else {
                    updateData({ businessPermitUrl: resData.url, businessPermitName: file.name });
                }
                toast({ title: 'Uploaded!', description: `${file.name} uploaded successfully.` });
            }
        } catch {
            toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'ppb' | 'permit') => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file, type);
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Regulatory Documents
                </CardTitle>
                <CardDescription>
                    Upload your regulatory documents for verification. These ensure compliance and build customer trust.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* PPB License */}
                <div className="space-y-2">
                    <Label>PPB License (Pharmacy and Poisons Board)</Label>
                    <input ref={ppbRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => onFileChange(e, 'ppb')} />
                    {data.ppbLicenseUrl ? (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="text-sm flex-1 truncate">{data.ppbLicenseName}</span>
                            <Button variant="ghost" size="sm" onClick={() => ppbRef.current?.click()}>Replace</Button>
                        </div>
                    ) : (
                        <button
                            onClick={() => ppbRef.current?.click()}
                            disabled={uploadingPpb}
                            className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center gap-2 hover:border-primary/40 transition-colors"
                        >
                            {uploadingPpb ? (
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            ) : (
                                <Upload className="h-6 w-6 text-muted-foreground" />
                            )}
                            <span className="text-sm text-muted-foreground">
                                {uploadingPpb ? 'Uploading...' : 'Click to upload PPB License'}
                            </span>
                            <span className="text-xs text-muted-foreground/60">PDF, JPG, PNG</span>
                        </button>
                    )}
                </div>
                {/* Business Permit */}
                <div className="space-y-2">
                    <Label>Business Permit</Label>
                    <input ref={permitRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => onFileChange(e, 'permit')} />
                    {data.businessPermitUrl ? (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="text-sm flex-1 truncate">{data.businessPermitName}</span>
                            <Button variant="ghost" size="sm" onClick={() => permitRef.current?.click()}>Replace</Button>
                        </div>
                    ) : (
                        <button
                            onClick={() => permitRef.current?.click()}
                            disabled={uploadingPermit}
                            className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center gap-2 hover:border-primary/40 transition-colors"
                        >
                            {uploadingPermit ? (
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            ) : (
                                <Upload className="h-6 w-6 text-muted-foreground" />
                            )}
                            <span className="text-sm text-muted-foreground">
                                {uploadingPermit ? 'Uploading...' : 'Click to upload Business Permit'}
                            </span>
                            <span className="text-xs text-muted-foreground/60">PDF, JPG, PNG</span>
                        </button>
                    )}
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>
                        Documents are stored securely and only reviewed by our moderation team during the approval process.
                    </span>
                </div>
                <div className="flex justify-between pt-2">
                    <Button variant="ghost" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <Button onClick={onNext}>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
export default StepDocumentUpload;