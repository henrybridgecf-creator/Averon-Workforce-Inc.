'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { signupUser, initializeUsers, addActivityLog, addNotification, requestEmailVerification } from "@/lib/mock-data";
import { triggerEmailNotification, emailTemplates } from "@/lib/notifications";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Sparkles, UserPlus, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToFee, setAgreedToFee] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    initializeUsers();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreedToFee) {
        setError("You must acknowledge the administrative processing fee.");
        return;
    }
    setError('');
    setIsLoading(true);

    try {
        const emailLower = email.trim().toLowerCase();
        const newUser = {
            uid: `user-${Date.now()}`,
            fullName: fullName.trim(),
            email: emailLower,
            password: password,
            personalEmail: emailLower,
            phone: phone.trim(),
            country: country,
            capabilityStatement: reason,
            profilePhoto: `https://avatar.vercel.sh/${emailLower}.png`,
            averpayId: `AP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            role: "Freelancer",
            location: country || "Remote",
            rank: 99,
            totalBalance: 0,
            pendingBalance: 0,
            status: 'pending',
            isEmailVerified: false,
            deviceAuthenticated: true,
            browserInfo: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown Agent',
            lastSeen: new Date().toISOString(),
            bankDetails: {
              bankName: "",
              accountHolder: "",
              accountNumber: "",
            },
            notificationPreferences: {
                projectUpdates: true,
                platformAnnouncements: true,
                darkMode: true
            }
        };

        const signupResponse = signupUser(newUser);
        
        if (!signupResponse.success) {
            setError("This email registry is already active in our network.");
            setIsLoading(false);
            return;
        }

        // Generate Verification Token and Trigger Email via Internal API
        // This is now an async call that calls our Brevo API route
        await requestEmailVerification(newUser.email);

        // Log activity
        addActivityLog({
            type: 'signup',
            user: newUser.fullName,
            description: 'New personnel initialized in global registry. Email verification transmitted via Brevo Service.',
            timestamp: new Date().toISOString()
        });

        setIsSuccess(true);
        setIsLoading(false);
    } catch (err) {
        console.error("Signup error:", err);
        setError("Network sync failure. Please retry initialization.");
        setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
        <div className="relative min-h-screen w-full bg-[#030a1c] text-white flex flex-col items-center justify-center p-4 py-12 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
            </div>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md text-center"
            >
                <div className="bg-[#050f26] p-12 rounded-[3.5rem] border border-white/5 shadow-2xl backdrop-blur-xl">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-3xl mb-8 border border-green-500/20">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                        >
                            <Sparkles className="w-10 h-10 text-green-500" />
                        </motion.div>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">Transmission Sent</h2>
                    <p className="text-muted-foreground font-medium mb-8">
                        A secure activation link has been transmitted to <span className="text-white font-bold">{email}</span>. Please verify your credentials to initialize your dossier.
                    </p>
                    <div className="space-y-4">
                        <Button 
                            onClick={() => router.push('/login')} 
                            className="w-full h-16 rounded-2xl bg-primary text-black font-black uppercase text-xs tracking-widest hover:bg-primary/90"
                        >
                            Return to Login
                        </Button>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Check your spam folder if link is not detected.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#030a1c] text-white flex flex-col items-center justify-center p-4 py-12 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      
      <div className="relative z-10 w-full max-w-3xl">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <div className="bg-[#050f26] p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-3xl mb-6 border border-primary/20">
                        <UserPlus className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white mb-2">
                        AVER<span className="text-primary underline decoration-4 underline-offset-4">PAY</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Strategic Asset Deployment</p>
                    <h2 className="text-3xl font-black text-white mt-8 mb-2">Recruitment Intake</h2>
                    <p className="text-muted-foreground font-medium">Initialize your membership dossier to join the Averon Workforce.</p>
                </div>
                
                <form className="space-y-8" onSubmit={handleSignup}>
                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <Alert className="bg-red-500/10 border-red-500/20 text-red-500 rounded-2xl">
                                <Terminal className="h-4 w-4" />
                                <AlertTitle className="font-bold">Protocol Conflict</AlertTitle>
                                <AlertDescription className="text-xs">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Full Legal Name</Label>
                            <Input 
                                placeholder="J. Doe" 
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white focus:border-primary/50 transition-all"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Registry Email</Label>
                            <Input 
                                type="email"
                                placeholder="name@protocol.io" 
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white focus:border-primary/50 transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Comms Liaison (WhatsApp)</Label>
                            <Input 
                                placeholder="+44 700 000 000" 
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white focus:border-primary/50 transition-all"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Geo-Origin</Label>
                            <div className="relative flex items-center">
                                <Globe className="absolute left-6 h-4 w-4 text-primary/40" />
                                <Input 
                                    placeholder="Country of Residency" 
                                    className="h-14 pl-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white focus:border-primary/50 transition-all"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Access Encryption (Password)</Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white focus:border-primary/50 transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Confirm Encryption</Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white focus:border-primary/50 transition-all"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Professional Capability Statement</Label>
                        <Textarea 
                            placeholder="Detail your operational expertise..." 
                            className="bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:border-primary/50 min-h-[120px] p-6"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="flex items-start gap-4 rounded-[2rem] border border-primary/20 bg-primary/10 p-8 shadow-inner group transition-all">
                        <Checkbox 
                            id="terms" 
                            checked={agreedToFee} 
                            onCheckedChange={(checked) => setAgreedToFee(checked as boolean)} 
                            className="mt-1 h-5 w-5 border-white/20 transition-all" 
                        />
                        <div className="grid gap-2 leading-tight">
                            <Label htmlFor="terms" className="text-base font-black text-white flex items-center gap-2 cursor-pointer">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Acknowledge PROTOCOL CREATION FEE
                            </Label>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                I verify that I understand a mandatory, non-refundable <span className="text-white font-bold">RECRUITMENT PROCESSING FEE</span> is required to initialize security clearance and unlock the operational dashboard. 
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full h-20 rounded-[2.5rem] bg-primary hover:bg-primary/90 text-black font-black text-xl shadow-xl shadow-primary/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                    <span>Syncing Neural Link...</span>
                                </>
                            ) : (
                                <>
                                    <span>Initialize Account</span>
                                    <ArrowRight className="h-6 w-6" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
                
                <div className="text-center mt-10">
                    <p className="text-sm font-medium text-white/60">
                        Already have access?{' '}
                        <Link href="/login" className="font-black text-primary hover:text-primary/80 transition-colors underline decoration-2 underline-offset-4">
                            Return to Terminal
                        </Link>
                    </p>
                </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/20">
                <Link href="/terms-of-service" className="hover:text-white transition-colors">Strategic Terms</Link>
                <div className="h-1 w-1 rounded-full bg-white/10"></div>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Protocol</Link>
                <div className="h-1 w-1 rounded-full bg-white/10"></div>
                <button className="hover:text-white transition-colors">Support Line</button>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
