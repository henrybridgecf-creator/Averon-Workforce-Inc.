'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock, ArrowRight, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { resetPassword } from "@/lib/mock-data";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid or Missing Protocol Token.');
        }
    }, [token]);

    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError('Key Mismatch: Security keys do not align.');
            return;
        }

        if (password.length < 8) {
            setError('Insecure Payload: Key must be at least 8 segments.');
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            if (token) {
                const success = resetPassword(token, password);
                if (success) {
                    setIsSuccess(true);
                    setTimeout(() => router.push('/login'), 2000);
                } else {
                    setError('Unauthorized Transmission: Link expired or corrupted.');
                }
            }
            setIsLoading(false);
        }, 1500);
    };

    if (isSuccess) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 py-4 text-center"
            >
                <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                
                <div className="space-y-2">
                     <h2 className="text-2xl font-black text-white">KEY UPDATED</h2>
                     <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Global registry synchronized. Redirecting to terminal...</p>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <div className="bg-primary/10 p-4 rounded-[1.5rem] border border-primary/20 inline-block mb-6">
                    <Lock className="h-8 w-8 text-primary"/>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white mb-2 italic">KEY<span className="text-primary">OVERRIDE</span></h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-relaxed">Establish new terminal credentials.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-red-500 uppercase tracking-tight">{error}</p>
                </div>
            )}

            <form className="space-y-6" onSubmit={handleReset}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Security Key</Label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50" />
                            <Input
                                type="password"
                                placeholder="••••••••••••"
                                className="h-14 pl-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:border-primary/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Key Alignment</Label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50" />
                            <Input
                                type="password"
                                placeholder="••••••••••••"
                                className="h-14 pl-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:border-primary/50"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>
                
                <Button 
                    type="submit" 
                    disabled={isLoading || !token}
                    className="w-full bg-primary hover:bg-primary/90 text-black font-black text-lg h-16 rounded-[2rem] shadow-2xl shadow-primary/20 transition-all active:scale-95 group"
                >
                    {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <>
                            Re-Authorize Access
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#030a1c] text-white flex flex-col items-center justify-center p-4 overflow-hidden">
       {/* Background Elements */}
       <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,102,255,0.05),transparent_50%)]" />
       </div>

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-[#050f26] border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center space-y-4 py-20">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Validating Protocol...</p>
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
        <p className="mt-8 text-center text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] opacity-30 italic">Averon Secure Core v9.x</p>
      </motion.main>
    </div>
  );
}
