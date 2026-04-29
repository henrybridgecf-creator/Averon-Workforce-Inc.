

'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, ShieldCheck, FileText, Map, KeyRound, Mail, BadgeCheck, Upload } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import React, { useEffect, useState } from "react";
import { updateUserData, initializeUsers, saveData } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export default function VerificationPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        initializeUsers();
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            setUserProfile(JSON.parse(storedUser));
        } else {
            router.push('/login');
        }
    }, [router]);

    const handleProceedToPayment = () => {
        if (!userProfile?.verificationIdUrl) {
            toast({
                variant: 'destructive',
                title: 'ID Document Required',
                description: 'Please upload your verification ID document before proceeding to payment.'
            });
            return;
        }

        const recipient = "averon.hrdesk@outlook.com";
        const subject = "Request to Proceed with Account Verification Payment";
        const body = `
            Hello Averon Workforce Support,

            I have uploaded my verification documents and am ready to proceed with the payment of £1,400 for my account verification, security checks, and AverPay ID activation.

            My User ID is: ${userProfile?.uid}
            My Full Name is: ${userProfile?.fullName}

            Please provide me with the necessary payment instructions.

            Thank you.
        `;

        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'verification' | 'address') => {
        
        const file = e.target.files?.[0];
        if (!file || !userProfile) return;

        const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

        if (file.size > MAX_SIZE_BYTES) {
            toast({ variant: "destructive", title: "Upload Failed", description: "File is too large. Max 5MB." });
            return;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            toast({ variant: "destructive", title: "Upload Failed", description: "Unsupported file type. Please use JPG, PNG, or PDF." });
            return;
        }
        
        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const fieldName = fileType === 'verification' ? 'verificationIdUrl' : 'proofOfAddressUrl';
            
                const updatedUser = updateUserData(userProfile.uid, { [fieldName]: dataUrl });
                setUserProfile(updatedUser);
                saveData('loggedInUser', updatedUser);


                toast({
                    title: `${fileType === 'verification' ? 'ID' : 'Address Proof'} Uploaded`,
                    description: `Your document has been updated.`,
                });
            };
            reader.readAsDataURL(file);

        } catch (error: any) {
            console.error("Verification file upload error: ", error);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: error.message || `Could not update your document.`
            });
        }
    };


    const verificationSteps = [
        {
            icon: <FileText className="h-5 w-5 text-primary" />,
            title: "Identity Verification (ID)",
            description: "Upload a clear, valid government-issued photo ID (e.g., Passport, National ID Card). This is mandatory for financial compliance.",
            uploadType: 'verification',
            uploadUrl: userProfile?.verificationIdUrl,
        },
        {
            icon: <Map className="h-5 w-5 text-primary" />,
            title: "Proof of Address",
            description: "Provide a recent utility bill or bank statement (issued within the last 3 months) showing your full name and current address.",
            uploadType: 'address',
            uploadUrl: userProfile?.proofOfAddressUrl,
        }
    ];

    return (
        <div className="bg-background min-h-screen font-sans">
            <div className="container mx-auto px-4 pt-4 pb-24 max-w-3xl">
                <header className="flex items-center py-2 mb-6">
                    <Link href="/dashboard/settings">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-xl md:text-2xl font-semibold ml-4">Account Verification</h1>
                </header>

                <main className="space-y-8">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                                Complete Your Verification
                            </CardTitle>
                            <CardDescription>
                                To ensure the security of our platform and comply with international regulations, all team members must complete a one-time verification process. This activates your account for full features, including project withdrawals.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {verificationSteps.map((step) => (
                                <Card key={step.title} className="bg-background">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3 text-lg">
                                            {step.icon}
                                            {step.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                                        {step.uploadUrl ? (
                                            <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-300 mb-4">
                                                <FileText className="h-4 w-4 !text-green-500" />
                                                <AlertTitle className="font-semibold text-sm">Document Uploaded</AlertTitle>
                                            </Alert>
                                        ) : (
                                            <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800/50 dark:text-yellow-300 mb-4">
                                                <AlertTitle className="font-semibold text-sm">Action Required</AlertTitle>
                                                <AlertDescription>Please upload the required document.</AlertDescription>
                                            </Alert>
                                        )}
                                        <div>
                                            <Label htmlFor={`${step.uploadType}-upload`} className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
                                                <Upload className="mr-2 h-4 w-4" />
                                                {step.uploadUrl ? 'Upload New Document' : 'Upload Document'}
                                            </Label>
                                            <Input id={`${step.uploadType}-upload`} type="file" className="hidden" onChange={(e) => handleFileUpload(e, step.uploadType as 'verification' | 'address')} accept="image/jpeg,image/png,application/pdf" />
                                            <p className="text-xs text-muted-foreground mt-2">PDF, PNG, JPG up to 5MB.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                           <CardTitle className="flex items-center gap-3 text-lg">
                                <KeyRound className="h-5 w-5 text-primary" />
                                Security Fee & ID Activation
                           </CardTitle>
                           <CardDescription>This one-time fee covers all administrative and security costs associated with activating your professional freelance account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="text-center bg-secondary/50 p-6 rounded-lg">
                                <p className="text-muted-foreground">Total Amount Due</p>
                                <p className="text-5xl font-bold tracking-tight text-primary">£1,400.00 <span className="text-lg font-medium text-muted-foreground">GBP</span></p>
                            </div>
                             <Alert>
                                <BadgeCheck className="h-4 w-4" />
                                <AlertTitle>What's Included?</AlertTitle>
                                <AlertDescription>
                                    This fee covers lifetime AverPay ID activation, international background checks, secure document processing, and anti-fraud monitoring for your account.
                                </AlertDescription>
                            </Alert>
                             <Button size="lg" className="w-full text-lg py-7" onClick={handleProceedToPayment}>
                                <Mail className="mr-2 h-5 w-5" />
                                Proceed to Payment
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">
                                By clicking, you will be redirected to your email client to contact support and receive payment instructions.
                            </p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
