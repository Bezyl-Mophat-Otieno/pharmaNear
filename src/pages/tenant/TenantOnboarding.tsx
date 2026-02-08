import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Store } from 'lucide-react';
import StepAccountCreation from '@/components/seller/StepAccountCreation';
import StepEmailVerification from '@/components/seller/StepEmailVerification';
import StepBusinessInfo from '@/components/seller/StepBusinessInfo';
import StepDocumentUpload from '@/components/seller/StepDocumentUpload';
import StepReviewSubmit from '@/components/seller/StepReviewSubmit';
import StepSuccess from '@/components/seller/StepSuccess';
export interface OnboardingData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    userId?: string;
    businessName: string;
    businessType: string;
    address: string;
    latitude?: number;
    longitude?: number;
    ppbLicenseUrl?: string;
    ppbLicenseName?: string;
    businessPermitUrl?: string;
    businessPermitName?: string;
}
const STEPS = [
    { label: 'Account', description: 'Create your account' },
    { label: 'Verify', description: 'Verify your email' },
    { label: 'Business', description: 'Business details' },
    { label: 'Documents', description: 'Upload documents' },
    { label: 'Review', description: 'Review & submit' },
];
const TenantOnboarding = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<OnboardingData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        businessName: '',
        businessType: '',
        address: '',
    });
    const progress = currentStep >= 5 ? 100 : ((currentStep) / 5) * 100;
    const updateData = (partial: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...partial }));
    };
    const next = () => setCurrentStep(prev => prev + 1);
    const back = () => setCurrentStep(prev => Math.max(0, prev - 1));
    const goToStep = (step: number) => {
        if (step < currentStep) setCurrentStep(step);
    };
    if (currentStep >= 5) {
        return <StepSuccess />;
    }
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Store className="h-5 w-5 text-primary" />
                        </div>
                        <h1 className="text-2xl font-semibold">Seller Onboarding</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {STEPS[currentStep].description}
                    </p>
                </div>
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {STEPS.map((step, i) => (
                            <button
                                key={step.label}
                                onClick={() => goToStep(i)}
                                disabled={i >= currentStep}
                                className={`text-xs font-medium transition-colors ${i === currentStep
                                        ? 'text-primary'
                                        : i < currentStep
                                            ? 'text-primary/60 cursor-pointer hover:text-primary'
                                            : 'text-muted-foreground'
                                    }`}
                            >
                                <Badge
                                    variant={i <= currentStep ? 'default' : 'secondary'}
                                    className={`h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs mx-auto mb-1 ${i < currentStep ? 'bg-primary/60' : ''
                                        }`}
                                >
                                    {i + 1}
                                </Badge>
                                <span className="hidden sm:block">{step.label}</span>
                            </button>
                        ))}
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
                {/* Steps */}
                {currentStep === 0 && (
                    <StepAccountCreation data={data} updateData={updateData} onNext={next} />
                )}
                {currentStep === 1 && (
                    <StepEmailVerification
                        email={data.email}
                        onNext={next}
                        onBack={back}
                    />
                )}
                {currentStep === 2 && (
                    <StepBusinessInfo data={data} updateData={updateData} onNext={next} onBack={back} />
                )}
                {currentStep === 3 && (
                    <StepDocumentUpload data={data} updateData={updateData} onNext={next} onBack={back} />
                )}
                {currentStep === 4 && (
                    <StepReviewSubmit data={data} onBack={back} onSubmit={next} />
                )}
            </div>
        </div>
    );
};
export default TenantOnboarding;