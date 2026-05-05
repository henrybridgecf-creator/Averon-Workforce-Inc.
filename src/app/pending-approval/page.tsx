'use client';
import { motion } from 'motion/react';
import { ShieldAlert, Clock, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PendingApprovalPage() {
    return (
        <div className="relative min-h-screen w-full bg-[#030a1c] text-white flex flex-col items-center justify-center overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
            </div>

            <div className="relative z-10 max-w-lg w-full p-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#050f26] border border-white/5 rounded-[3rem] p-12 text-center shadow-2xl shadow-black/50 backdrop-blur-xl"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-3xl mb-8 border border-primary/20">
                        <ShieldAlert className="w-12 h-12 text-primary animate-pulse" />
                    </div>

                    <h1 className="text-4xl font-black italic tracking-tighter text-white mb-4">
                        PROTOCOL <span className="text-primary italic">PENDING</span>
                    </h1>
                    
                    <div className="space-y-6 text-white/60 font-medium leading-relaxed mb-10">
                        <p>
                            Your credentials have been successfully initialized in the <span className="text-white font-bold">AverPay Global Registry</span>.
                        </p>
                        <p className="text-sm bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                            "Security is the bedrock of strategic asset deployment. All new personnel must undergo Admiral Verification before dashboard access is granted."
                        </p>
                        <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                            <Clock className="w-3 h-3" />
                            <span>Estimated Review Time: 2-4 Cycles</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Authentication Protocol</p>
                        <ul className="text-left space-y-4 text-sm mt-4">
                            <li className="flex gap-4 items-start">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                    <span className="text-[10px] font-black text-primary">01</span>
                                </div>
                                <p><span className="text-white font-bold">Email Activation:</span> A verification link has been transmitted. You must activate this link to synchronize your credentials.</p>
                            </li>
                            <li className="flex gap-4 items-start">
                                <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                    <span className="text-[10px] font-black text-white/40">02</span>
                                </div>
                                <p><span className="text-white font-bold">Admin Clearance:</span> Your details have been transmitted to the Administrator for terminal validation.</p>
                            </li>
                            <li className="flex gap-4 items-start">
                                <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                    <span className="text-[10px] font-black text-white/40">03</span>
                                </div>
                                <p><span className="text-white font-bold">Registry Sync:</span> Once both clearances are confirmed, your terminal status will update to active.</p>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-12 flex flex-col gap-4">
                        <Button asChild className="h-16 rounded-2xl bg-white text-black font-black text-lg hover:bg-white/90 active:scale-95 transition-all">
                            <Link href="/">
                                Return to Command Center
                            </Link>
                        </Button>
                        <Button variant="ghost" className="h-14 rounded-2xl text-muted-foreground font-bold hover:text-white transition-colors">
                            <Mail className="w-4 h-4 mr-2" />
                            Contact Support Bureau
                        </Button>
                    </div>
                </motion.div>

                <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-white/20">
                    AverPay Integrated Security Framework v9.4.5
                </p>
            </div>
        </div>
    );
}
