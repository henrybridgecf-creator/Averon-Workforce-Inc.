'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2,
  CreditCard,
  Wallet,
  CheckCircle2,
  ChevronLeft,
  ShieldQuestion,
  Terminal,
  ExternalLink,
  Mail,
  ShieldCheck,
  Lock,
  Plus
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { useRouter } from "next/navigation";
import { initializeUsers } from '@/lib/mock-data';
import { cn } from "@/lib/utils";
import { triggerEmailNotification, emailTemplates } from "@/lib/notifications";

type PaymentMethod = 'bank' | 'card' | 'wallet';

export default function WithdrawPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bank');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [isImfModalOpen, setIsImfModalOpen] = useState(false);
  const [imfCode, setImfCode] = useState('');
  const [imfError, setImfError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    initializeUsers();
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUserProfile(userData);
        setFullName(userData.fullName || '');
    } else {
        router.push('/login');
    }
  }, [router]);

  const isWithdrawalDisabled = (userProfile?.totalBalance || 0) <= 0;

  const handleWithdrawalRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if ((userProfile?.totalBalance || 0) <= 0) {
        toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Your account balance is currently zero.' });
        return;
    }
    
    if (userProfile?.imfCleared) {
        setIsProcessing(true);
        // Simulate immediate success for cleared users
        setTimeout(() => {
            toast({
                title: "Withdrawal Approved",
                description: `£${(userProfile?.totalBalance || 0).toLocaleString()} has being dispatched to your ${selectedMethod}. Final clearance verified.`,
            });
            if (userProfile?.email) {
                triggerEmailNotification(
                    userProfile.email,
                    "AverPay Withdrawal Successful",
                    emailTemplates.withdrawalSuccess(userProfile.fullName, userProfile.totalBalance || 0, selectedMethod)
                );
            }
            setIsProcessing(false);
        }, 1500);
        return;
    }
    
    setIsImfModalOpen(true);
  };

  const handleImfCodeSubmit = async () => {
    if (imfCode.length < 7) {
        setImfError('The IMF Code must be 7 digits.');
        return;
    }

    setImfError('');
    setIsProcessing(true);

    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // MASTER OVERRIDE FOR TESTING: 9999999
        if (imfCode === '9999999') {
            toast({
                title: "Withdrawal Successful",
                description: `£${(userProfile?.totalBalance || 0).toLocaleString()} has being dispatched to your ${selectedMethod}.`,
            });

            // Send email notification
            if (userProfile?.email) {
                triggerEmailNotification(
                    userProfile.email,
                    "AverPay Withdrawal Successful",
                    emailTemplates.withdrawalSuccess(userProfile.fullName, userProfile.totalBalance || 0, selectedMethod)
                );
            }

            setIsImfModalOpen(false);
            setImfCode('');
            return;
        }

        toast({
            title: "Authentication Failed",
            description: `The IMF code entered is incorrect or expired. Please contact support.`,
            variant: "destructive"
        });

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Request Failed', description: error.message });
    } finally {
        setIsProcessing(false);
    }
  };

  const methods = [
    { id: 'bank' as const, title: 'Bank Transfer', sub: '2-3 business days', icon: Building2 },
    { id: 'card' as const, title: 'Debit/Credit Card', sub: 'Instant - 1 hour', icon: CreditCard },
    { id: 'wallet' as const, title: 'Digital Wallet', sub: '1-2 hours', icon: Wallet },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#030a1c] p-4 sm:p-6 lg:p-8">
        <div className="max-w-md mx-auto w-full space-y-6">
          
          {/* Method Selection */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Clearance Channel</h3>
            <div className="grid gap-3">
              {methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    "w-full flex items-center gap-5 p-6 rounded-[2rem] transition-all duration-300 border h-24",
                    selectedMethod === method.id 
                      ? "bg-primary/5 border-primary/40 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]" 
                      : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500",
                    selectedMethod === method.id 
                      ? "bg-primary/20 text-primary border-primary/30" 
                      : "bg-white/5 text-white/40 border-white/5"
                  )}>
                    <method.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className={cn("font-black text-sm uppercase tracking-widest transition-colors", selectedMethod === method.id ? "text-primary" : "text-white")}>{method.title}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{method.sub}</p>
                  </div>
                  <div className={cn(
                    "h-6 w-6 rounded-full border flex items-center justify-center transition-all",
                    selectedMethod === method.id ? "bg-primary border-primary scale-110" : "border-white/20"
                  )}>
                    {selectedMethod === method.id && <CheckCircle2 className="h-4 w-4 text-black" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bank Details Form */}
          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-3 px-2">
                <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Building2 className="h-3 w-3 text-primary" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Target Account Registry</h3>
            </div>

            <form onSubmit={handleWithdrawalRequest} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Financial Institution</Label>
                    <Input
                    placeholder="e.g. Chase Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white placeholder:text-white/20 focus:border-primary/50 transition-all"
                    required
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Registry Key / ID</Label>
                    <Input
                    placeholder="xxxx-xxxx-xxxx"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white placeholder:text-white/20 focus:border-primary/50 transition-all"
                    required
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Full Identification</Label>
                    <Input
                    placeholder="Full name as registered"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white placeholder:text-white/20 focus:border-primary/50 transition-all font-bold"
                    required
                    />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  type="button"
                  variant="ghost" 
                  onClick={() => router.back()}
                  className="flex-1 h-14 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl border border-white/5"
                >
                  Return
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 h-14 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                  Establish Link
                </Button>
              </div>
            </form>
          </div>

          {/* Account Info Footer */}
          <div className="text-center pt-10 pb-6">
            <div className="inline-block px-10 py-8 bg-gradient-to-b from-white/5 to-transparent rounded-[3rem] border border-white/5">
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">Available Liquid Asset</p>
                <p className="text-5xl font-black text-white mt-4 tracking-tighter italic">
                £{(userProfile?.totalBalance || 0).toLocaleString()}
                </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isImfModalOpen} onOpenChange={setIsImfModalOpen}>
        <DialogContent className="max-w-md bg-[#050f26] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">IMF Clearance Authentication</DialogTitle>
            <DialogDescription className="text-white/60">
                A 7-digit IMF Clearance Code is required to authorize this international withdrawal for legal and security reasons.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {imfError && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Authentication Failed</AlertTitle>
                    <AlertDescription>{imfError}</AlertDescription>
                </Alert>
            )}
            
            <Alert className="bg-primary/5 border-primary/20 text-white">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary font-bold">How to find your IMF Code?</AlertTitle>
                <AlertDescription className="text-sm mt-2 text-white/70">
                    You can purchase your personal clearance code from the official IMF website or contact support for assistance.
                </AlertDescription>
                <div className="mt-4 flex flex-col gap-2">
                    <a href="https://preview-gv319r8uowpb.hellofigwebsite.com/" target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button className="w-full h-11 bg-primary font-bold rounded-xl">
                            <ExternalLink className="mr-2 h-4 w-4" /> Visit Official IMF Website
                        </Button>
                    </a>
                    <a href="mailto:suportdeck.transact@outlook.com" className="w-full">
                        <Button variant="outline" className="w-full h-11 border-white/10 hover:bg-white/5 text-white font-bold rounded-xl">
                            <Mail className="mr-2 h-4 w-4" /> Email IMF Support
                        </Button>
                    </a>
                </div>
            </Alert>
            
            <div className="space-y-2">
                 <Label htmlFor="imf-code" className="text-white/60">7-Digit IMF Authentication Code</Label>
                <div className="relative">
                    <ShieldQuestion className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                    <Input 
                        id="imf-code"
                        placeholder="Enter 7-digit code"
                        value={imfCode}
                        onChange={(e) => setImfCode(e.target.value)}
                        className="pl-10 h-14 bg-[#0a1631] border-white/5 rounded-2xl text-lg text-white"
                        maxLength={7}
                    />
                </div>
            </div>
          </div>
          <DialogFooter className="flex gap-3">
            <Button variant="ghost" onClick={() => setIsImfModalOpen(false)} disabled={isProcessing} className="flex-1 border-white/10 text-white hover:bg-white/5 h-12 rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleImfCodeSubmit} disabled={isProcessing || imfCode.length !== 7} className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl">
              {isProcessing ? "Authenticating..." : "Authorize"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
