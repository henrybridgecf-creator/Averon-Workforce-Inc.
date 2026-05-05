'use client';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Activity, Zap, AlertCircle, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateUserData } from '@/lib/mock-data';

interface RealTimeStatusProps {
    role?: 'Admin' | 'Freelancer' | 'Client';
    userId?: string;
}

export default function RealTimeStatus({ role, userId }: RealTimeStatusProps) {
    const { toast } = useToast();
    const [time, setTime] = useState(new Date());
    const [location, setLocation] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        
        // Background location ping
        if (typeof window !== 'undefined' && navigator.geolocation) {
           navigator.geolocation.getCurrentPosition((pos) => {
               const loc = `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`;
               setLocation(loc);
               if (userId) {
                   updateUserData(userId, { location: `LAT:${pos.coords.latitude.toFixed(4)} LON:${pos.coords.longitude.toFixed(4)}` });
               }
           });
        }

        return () => clearInterval(timer);
    }, [userId]);

    useEffect(() => {
        const handleNewActivity = (activity: any) => {
            if (role === 'Admin') {
                toast({
                    title: "Incoming Telemetry",
                    description: `${activity.user}: ${activity.type.toUpperCase()}`,
                    className: "bg-[#050f26] border-primary/20 text-white rounded-2xl",
                });
            }
        };

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'activityLogs' && e.newValue) {
                const logs = JSON.parse(e.newValue);
                const latestLog = logs[0];
                handleNewActivity(latestLog);
            }
        };

        const handleCustomEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            handleNewActivity(customEvent.detail);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('averpayActivity', handleCustomEvent);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('averpayActivity', handleCustomEvent);
        };
    }, [role, toast]);

    return (
        <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 text-primary/70">
                    <Zap className="h-3 w-3 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">Registry Clock</span>
                </div>
                <div className="text-2xl font-black text-white tabular-nums tracking-tighter leading-none mt-1 drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]">
                    {format(time, 'HH:mm:ss')}
                </div>
                <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mt-1.5">
                    {format(time, 'EEE // MMM dd // yyyy')}
                </div>
            </div>
            
            <div className="h-12 w-px bg-white/5 hidden sm:block" />
            
            <div className="hidden sm:flex items-center gap-6 bg-white/[0.02] border border-white/5 pl-6 pr-8 py-3 rounded-[1.5rem] backdrop-blur-xl shadow-inner">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">Network Node</span>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-ping absolute" />
                        <div className="h-2 w-2 rounded-full bg-green-500 relative" />
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">OPTIMAL</span>
                    </div>
                </div>
                {location && (
                    <>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">Geo-Relay</span>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-primary/70" />
                                <span className="text-[10px] font-black text-white/90 uppercase tracking-tight font-mono">{location}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
