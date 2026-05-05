'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmailToken } from '@/lib/mock-data';
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your tactical credentials...');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Access denied. Tactical verification token is missing.');
      return;
    }

    // Simulate network delay for verification
    const timer = setTimeout(() => {
      const result = verifyEmailToken(token);
      if (result.success) {
        setStatus('success');
        setMessage('Neural link established. Account verified successfully.');
        setUserEmail(result.email || '');
      } else {
        setStatus('error');
        setMessage('Verification failed. The token may be expired or invalid.');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="relative min-h-screen w-full bg-[#030a1c] text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-[#050f26] p-10 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl backdrop-blur-xl text-center">
          <div className="mb-8 flex justify-center">
            {status === 'loading' && (
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center border border-green-500/20">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            )}
          </div>

          <h1 className="text-3xl font-black italic tracking-tighter text-white mb-2 uppercase">
            AVER<span className="text-primary underline decoration-4 underline-offset-4">PAY</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-8">Security Subsystem</p>

          <h2 className="text-2xl font-black text-white mb-4">
            {status === 'loading' ? 'Verification in Progress' : 
             status === 'success' ? 'Verification Complete' : 'Verification Error'}
          </h2>
          
          <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
            {message}
          </p>

          {status === 'success' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs uppercase font-black text-white/40 tracking-widest mb-1">Identity Confirmed</p>
                <p className="text-lg font-bold text-white">{userEmail}</p>
              </div>
              <Button 
                onClick={() => router.push('/login')} 
                className="w-full h-16 rounded-2xl bg-primary text-black font-black uppercase text-xs tracking-widest hover:bg-primary/90 flex items-center justify-center gap-3"
              >
                Enter Terminal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <Button 
                onClick={() => router.push('/signup')} 
                variant="outline"
                className="w-full h-16 rounded-2xl border-white/10 hover:bg-white/5 text-white font-black uppercase text-xs tracking-widest"
              >
                Try Re-registering
              </Button>
              <Link href="/login" className="block text-xs font-black text-primary hover:underline uppercase tracking-widest">
                Return to Login
              </Link>
            </div>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
               <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 animate-pulse">Syncing with mainnet...</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/20">
            <ShieldCheck className="w-3 h-3" />
            <span>End-to-End Encrypted Verification Protocol</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030a1c] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
