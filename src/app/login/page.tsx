'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Wallet, AlertTriangle, ShieldCheck, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  saveData, 
  initializeUsers, 
  findUserById as findUserInDb, 
  findUserByEmail,
  updateUserData, 
  addActivityLog, 
  addNotification,
  requestEmailVerification
} from "@/lib/mock-data";
import { motion, AnimatePresence } from "motion/react";

const ADMIN_EMAIL = 'ryan.reynolds@averpay.io';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    initializeUsers();
  }, []);

  const getBrowserInfo = () => {
    if (typeof window === 'undefined') return "Unknown";
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";

    if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";
    else if (ua.indexOf("Edge") > -1) browser = "Edge";

    if (ua.indexOf("Win") > -1) os = "Windows";
    else if (ua.indexOf("Mac") > -1) os = "macOS";
    else if (ua.indexOf("Linux") > -1) os = "Linux";
    else if (ua.indexOf("Android") > -1) os = "Android";
    else if (ua.indexOf("like Mac") > -1) os = "iOS";

    return `${browser} on ${os}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const emailTrimmed = email.trim();
    const authUser = findUserByEmail(emailTrimmed);

    setTimeout(() => {
        if (authUser && authUser.password === password) {
            const persistentUser = findUserInDb(authUser.uid);
            const status = persistentUser?.status || authUser.status;

            if (status === 'pending') {
                setError('Protocol Restriction: Your identification is currently in the Admiral Approval queue. Access denied.');
                setIsLoading(false);
                router.push('/pending-approval');
                return;
            }

            if (!authUser.isEmailVerified && !(persistentUser?.isEmailVerified)) {
                // Emergency Protocol: Allow the known Admin to bypass or auto-verify 
                // in case storage is corrupted during dev.
                if (authUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                    updateUserData(authUser.uid, { isEmailVerified: true });
                    // Continue login below
                } else {
                    setError('Security Protocol: Email activation pending. Please verify your tactical link before terminal access.');
                    setIsLoading(false);
                    return;
                }
            }

            if (status === 'suspended') {
                setError('Protocol Violation: Your access to the AverPay Network has been terminated.');
                setIsLoading(false);
                return;
            }

            const userToLogin = { 
                ...authUser,
                ...(persistentUser || {}), 
                browserInfo: getBrowserInfo(),
                lastSeen: new Date().toISOString(),
            };

            saveData('loggedInUser', userToLogin);
            updateUserData(userToLogin.uid, {
                browserInfo: userToLogin.browserInfo,
                lastSeen: userToLogin.lastSeen
            });

            // Integrated Geo-Telemetry Sync
            if (userToLogin.uid === 'mock-user-03') {
                // Special provision for Bontle Prudence
                addNotification('mock-user-02', { // Admin UID
                    type: 'system',
                    title: 'Strategic User Online',
                    description: `${userToLogin.fullName} has established a secure link from ${userToLogin.location || 'Botswana'}. Withdrawal phase active.`,
                    link: '/admin/users/mock-user-03'
                });
            }

            if (typeof window !== 'undefined' && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const lat = position.coords.latitude.toFixed(4);
                    const lon = position.coords.longitude.toFixed(4);
                    const geoLoc = `LAT:${lat} LON:${lon}`;
                    
                    updateUserData(userToLogin.uid, { location: geoLoc });
                    addActivityLog({
                        type: 'login',
                        user: userToLogin.fullName,
                        location: geoLoc,
                        description: `Secure terminal link established at coordinates ${geoLoc}`,
                        timestamp: new Date().toISOString()
                    });
                }, () => {
                    addActivityLog({
                        type: 'login',
                        user: userToLogin.fullName,
                        location: userToLogin.location || 'Unknown Terminal',
                        timestamp: new Date().toISOString()
                    });
                });
            } else {
                addActivityLog({
                    type: 'login',
                    user: userToLogin.fullName,
                    location: userToLogin.location || 'Unknown Terminal',
                    timestamp: new Date().toISOString()
                });
            }
            
            setIsSuccess(true);
            setTimeout(() => {
                if (userToLogin.email.toLowerCase() === ADMIN_EMAIL) {
                    router.push('/admin/users');
                } else {
                    router.push('/dashboard');
                }
            }, 1200);
        } else {
            setError('ACCESS DENIED: Credentials mismatch in the global registry.');
            setIsLoading(false);
        }
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-4 overflow-hidden selection:bg-primary/20 selection:text-primary">
       {/* Background Elements */}
       <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
       </div>

      <motion.main 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[480px]"
      >
        <div className="bg-card/40 backdrop-blur-3xl border border-white/[0.05] p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <AnimatePresence>
                {isLoading && !isSuccess && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#050f26]/80 backdrop-blur-md z-20 flex flex-col items-center justify-center space-y-4"
                    >
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Synchronizing Protocol...</p>
                    </motion.div>
                )}
                {isSuccess && (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-[#050f26] z-30 flex flex-col items-center justify-center space-y-6"
                    >
                        <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                            <ShieldCheck className="h-10 w-10 text-black" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black text-white">ACCESS GRANTED</p>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Decrypting Dashboard...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="text-center mb-10">
                <div className="inline-flex flex-col items-center gap-2 mb-8">
                    <div className="bg-primary/10 p-4 rounded-[1.5rem] border border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]">
                        <Wallet className="h-8 w-8 text-primary"/>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white italic">
                            AVER<span className="text-primary">PAY</span>
                        </h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">by Averon Workforce</p>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-white">Terminal Authorization</h2>
            </div>
            
            {error && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Alert className="mb-8 bg-red-500/10 border-red-500/20 text-red-500 rounded-2xl p-4">
                        <AlertTriangle className="h-5 w-5" />
                        <div className="ml-3">
                            <AlertTitle className="text-xs font-black uppercase tracking-widest">Protocol Rejected</AlertTitle>
                            <AlertDescription className="text-xs font-medium mt-1">
                                {error}
                                {error.includes('Email activation pending') && (
                                    <button 
                                        type="button"
                                        disabled={isLoading}
                                        onClick={async () => {
                                            try {
                                                setIsLoading(true);
                                                await requestEmailVerification(email.trim());
                                                setError('Verification link re-transmitted. Check your tactical inbox.');
                                            } catch (err: any) {
                                                console.error("Re-transmission error:", err);
                                                setError(`Transmission Failed: ${err.message || 'Registry sync error'}`);
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }}
                                        className="block mt-2 text-primary hover:underline font-black uppercase tracking-widest text-[9px] disabled:opacity-50"
                                    >
                                        {isLoading ? 'Transmitting...' : 'Transmit New Link'}
                                    </button>
                                )}
                            </AlertDescription>
                        </div>
                    </Alert>
                </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">AVERPAY ID</Label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50" />
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
                
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Security Key</Label>
                    <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50" />
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••••••"
                            className="h-14 pl-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:border-primary/50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center space-x-3">
                        <Checkbox 
                            id="show-password" 
                            checked={showPassword}
                            onCheckedChange={(checked) => setShowPassword(checked as boolean)}
                            className="border-white/20 data-[state=checked]:bg-primary"
                        />
                        <Label htmlFor="show-password" className="text-xs font-bold text-muted-foreground cursor-pointer uppercase tracking-widest">Visible Key</Label>
                    </div>
                    <Link href="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary/50 hover:text-primary transition-colors">
                        Restoration?
                    </Link>
                </div>
                
                <div className="pt-4">
                    <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-black font-black text-lg h-16 rounded-[2rem] shadow-2xl shadow-primary/20 transition-all active:scale-95 group"
                    >
                        Initialize Link
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </form>
            <div className="text-center mt-10 space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    External Personnel?{' '}
                    <Link href="/apply" className="text-primary hover:underline">
                        Apply for Deployment
                    </Link>
                </p>
                <div className="h-px w-10 bg-white/5 mx-auto" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    New Strategic Asset?{' '}
                    <Link href="/signup" className="text-primary hover:underline">
                        Initialize Account
                    </Link>
                </p>
            </div>
        </div>
        <p className="mt-8 text-center text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Averon Secure Core v9.x</p>
      </motion.main>
    </div>
  );
}
