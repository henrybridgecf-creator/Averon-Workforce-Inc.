'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wallet, ArrowLeft, ArrowRight, UserPlus, Globe, Sparkles, ShieldAlert, FileText } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "motion/react";

export default function ApplyPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [reason, setReason] = useState('');
  const [agreedToFee, setAgreedToFee] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !phone || !country || !reason) {
      setError('VALIDATION ERROR: Personal dossier incomplete. All fields mandatory.');
      return;
    }
    if (!agreedToFee) {
      setError('CONSENT ERROR: Administrative processing fee acknowledgement required.');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
        const recipient = "averon.hrdesk@outlook.com";
        const subject = "Portal Recruitment: New Membership Application";
        const body = `
          New recruitment data received from the AverPay Secure Portal:
          ------------------------------------------
          Dossier Name: ${fullName}
          Registry Email: ${email}
          Comms (WhatsApp): ${phone}
          Origin: ${country}
          ------------------------------------------
          Intent Statement:
          ${reason}
          ------------------------------------------
          The applicant has formally acknowledged the ADMINISTRATIVE PROCESSING FEE.
          Status: PENDING REVIEW
        `;

        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
        setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030a1c] text-white flex flex-col items-center justify-center p-4 py-12 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-600/5 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="bg-[#050f26] border border-white/5 p-10 sm:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
            <div className="text-center mb-12">
                <div className="inline-flex flex-col items-center gap-4 mb-10">
                    <div className="bg-primary/20 p-5 rounded-[2rem] border border-primary/30 relative">
                        <UserPlus className="h-10 w-10 text-primary"/>
                        <motion.div 
                            animate={{ rotate: 360 }} 
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-[2rem] -m-2" 
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white italic">
                            AVER<span className="text-primary">PAY</span>
                        </h1>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Personnel Acquisition Portal</p>
                    </div>
                </div>
                
                <h2 className="text-3xl font-black text-white mb-2">Recruitment Intake</h2>
                <p className="text-muted-foreground font-medium">Initialize your membership dossier to join the Averon Workforce.</p>
            </div>
            
            <form className="space-y-8" onSubmit={handleApply}>
                {error && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500 rounded-2xl p-5">
                            <ShieldAlert className="h-5 w-5" />
                            <div className="ml-3">
                                <AlertTitle className="text-[10px] font-black uppercase tracking-widest">Protocol Failure</AlertTitle>
                                <AlertDescription className="text-xs mt-1 font-medium italic">{error}</AlertDescription>
                            </div>
                        </Alert>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Legal Name</Label>
                        <div className="relative">
                            <Input 
                                placeholder="J. Doe" 
                                className="h-14 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:border-primary/50"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Registry Email</Label>
                        <div className="relative">
                            <Input
                                type="email"
                                placeholder="name@domain.com"
                                className="h-14 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:border-primary/50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Comms Liaison (WhatsApp)</Label>
                        <div className="relative">
                            <Input
                                placeholder="+44 700 000 000"
                                className="h-14 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:border-primary/50"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Geo-Origin</Label>
                        <div className="relative flex items-center">
                            <Globe className="absolute left-4 h-4 w-4 text-primary/40" />
                            <Input
                                placeholder="Country of Residency"
                                className="h-14 pl-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:border-primary/50"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3 px-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Capability Statement</Label>
                    <Textarea
                        placeholder="Detail your operational expertise and value proposition to Averon Workforce..."
                        className="bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:border-primary/50 min-h-[120px] p-6 lg:text-lg"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    />
                </div>
                
                <div className="flex items-start gap-4 rounded-[2rem] border border-primary/20 bg-primary/10 p-8 shadow-inner group hover:bg-primary/[0.15] transition-all">
                    <Checkbox id="terms" checked={agreedToFee} onCheckedChange={(checked) => setAgreedToFee(checked as boolean)} className="mt-1 h-5 w-5 border-white/20 transition-all data-[state=checked]:bg-primary" />
                    <div className="grid gap-2 leading-tight">
                        <Label htmlFor="terms" className="text-base font-black text-white flex items-center gap-2 cursor-pointer">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Acknowledge PROTOCOL CREATION FEE
                        </Label>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            I verify that I understand a mandatory, non-refundable <span className="text-white font-bold">RECRUITMENT PROCESSING FEE</span> is required to initialize security clearance and unlock the operational dashboard. 
                            Refer to our <Link href="/terms-of-service" className="text-primary hover:underline font-bold">Regulatory Framework</Link> for full details.
                        </p>
                    </div>
                </div>

                <div className="pt-6">
                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary/90 text-black font-black text-xl h-20 rounded-[2.5rem] shadow-[0_20px_60px_rgba(var(--primary-rgb),0.2)] transition-all active:scale-[0.98] group"
                    >
                        {isSubmitting ? 'ENCRYPTING DOSSIER...' : 'DISPATCH APPLICATION'}
                        <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </form>
            
            <div className="text-center mt-12 pt-8 border-t border-white/5">
                <p className="text-sm font-bold text-muted-foreground">
                    EXISTING PERSONNEL?{' '}
                    <Link href="/login" className="text-primary hover:underline ml-2">
                        RETURN TO TERMINAL
                    </Link>
                </p>
            </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft className="h-3 w-3" />
                Return to Surface
            </Link>
        </div>
      </motion.div>
    </div>
  );
}
