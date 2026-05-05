'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, ShieldCheck, Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { requestPasswordReset } from "@/lib/mock-data";
import { triggerEmailNotification } from "@/lib/notifications";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
        const token = requestPasswordReset(email);
        if (token) {
            const url = `${window.location.origin}/reset-password?token=${token}`;
            setResetUrl(url);
            
            // Trigger Email Simulation
            triggerEmailNotification(
                email,
                "Security Key Restoration Protocol",
                `Access code: ${token}\nOr click here: ${url}`
            );
        }
        setIsSubmitted(true);
        setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030a1c] text-white flex flex-col items-center justify-center p-4 overflow-hidden">
       {/* Background Elements */}
       <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,102,255,0.05),transparent_50%)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
       </div>

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-[#050f26] border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden text-center">
            <AnimatePresence mode="wait">
                {!isSubmitted ? (
                    <motion.div 
                        key="request-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex flex-col items-center gap-2 mb-2">
                            <div className="bg-primary/10 p-4 rounded-[1.5rem] border border-primary/20">
                                <ShieldCheck className="h-8 w-8 text-primary"/>
                            </div>
                            <h1 className="text-2xl font-black text-white italic mt-4">
                                KEY<span className="text-primary">RECOVERY</span>
                            </h1>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl font-bold">Credential Restoration</h2>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-relaxed">
                                Enter your verified AverPay ID to receive a one-time restoration transmission.
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleResetRequest}>
                            <div className="space-y-2 text-left">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">AVERPAY ID</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50" />
                                    <Input
                                        type="email"
                                        placeholder="registry_id@averpay.io"
                                        className="h-14 pl-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:border-primary/50"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-primary/90 text-black font-black text-lg h-16 rounded-[2rem] shadow-2xl shadow-primary/20 transition-all active:scale-95"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    "Dispatch Request"
                                )}
                            </Button>
                        </form>

                        <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/50 hover:text-primary transition-colors">
                            <ArrowLeft className="h-3 w-3" />
                            Return to Terminal
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="success-message"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8 py-4"
                    >
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                            <CheckCircle2 className="h-8 w-8 text-primary" />
                        </div>
                        
                        <div className="space-y-2">
                             <h2 className="text-xl font-bold">Transmission Sent</h2>
                             <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-relaxed">
                                Secure instructions have been dispatched to <span className="text-white">{email}</span>.
                             </p>
                        </div>

                        {resetUrl && (
                             <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                                <p className="text-[9px] font-bold text-primary/70 uppercase tracking-widest">Local Debug: Discovery Token Detected</p>
                                <Button 
                                    onClick={() => window.location.href = resetUrl}
                                    variant="outline" 
                                    className="w-full border-primary/20 text-primary hover:bg-primary/10 rounded-xl"
                                >
                                    Access Reset Terminal
                                </Button>
                             </div>
                        )}

                        <div className="pt-4">
                            <Link href="/login">
                                <Button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl h-14">
                                    Return to Authentication
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        <p className="mt-8 text-center text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] opacity-30 italic">Averon Secure Core v9.x</p>
      </motion.main>
    </div>
  );
}
