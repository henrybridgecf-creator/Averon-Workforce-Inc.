'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
    Bell, 
    UserPlus, 
    ShieldAlert, 
    CheckCircle, 
    CreditCard, 
    Clock, 
    FileText, 
    MessageCircle,
    MoreHorizontal,
    Trash2,
    Eye
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const mockAdminNotifications = [
    {
        id: 'notif-1',
        title: 'New Personnel Login',
        description: 'Bontle Maele synchronized with the registry from a new browser (Edge on Windows).',
        timestamp: '2m ago',
        type: 'login',
        unread: true,
        user: { name: 'Bontle Maele', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop' }
    },
    {
        id: 'notif-2',
        title: 'Mission Brief Submitted',
        description: 'John Doe dispatched data for "Nike Global Product Review". Protocol awaiting approval.',
        timestamp: '1h ago',
        type: 'submission',
        unread: true,
        user: { name: 'John Doe', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }
    },
    {
        id: 'notif-3',
        title: 'Recruitment Intake',
        description: 'New personnel dossiers received from the application portal.',
        timestamp: '3h ago',
        type: 'application',
        unread: false,
    },
    {
        id: 'notif-4',
        title: 'Capital Flux',
        description: 'Financial withdrawal request initialized by Sarah Jenkins (CL-SJ29401).',
        timestamp: '5h ago',
        type: 'billing',
        unread: false,
        user: { name: 'Sarah Jenkins', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' }
    },
];

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState(mockAdminNotifications);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'login': return <UserPlus className="h-5 w-5 text-blue-400" />;
            case 'submission': return <FileText className="h-5 w-5 text-primary" />;
            case 'application': return <ShieldAlert className="h-5 w-5 text-yellow-400" />;
            case 'billing': return <CreditCard className="h-5 w-5 text-green-400" />;
            default: return <Bell className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Notification Cluster</span>
                   </div>
                    <h1 className="text-4xl font-black text-white">Registry Alerts</h1>
                    <p className="text-muted-foreground mt-1">Real-time platform activity and system synchronization logs.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button onClick={markAllRead} variant="outline" className="h-12 rounded-2xl border-white/5 bg-white/5 font-bold hover:bg-white/10">
                        Synchronize All Read
                    </Button>
                </div>
            </div>

            <Card className="bg-[#050f26] border-white/5 rounded-[3rem] shadow-2xl overflow-hidden border-t-primary/20 border-t-4">
                <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02] flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold text-white">Recent Vitalities</CardTitle>
                        <CardDescription className="text-muted-foreground">Monitoring active platform protocols.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                        <AnimatePresence mode="popLayout">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <motion.div 
                                        key={notification.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className={cn(
                                            "flex items-start gap-6 p-8 transition-all hover:bg-white/[0.02] group relative",
                                            notification.unread && "bg-primary/[0.03]"
                                        )}
                                    >
                                        {notification.unread && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
                                        )}
                                        
                                        <div className="relative">
                                            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            {notification.user && (
                                                <Avatar className="absolute -bottom-2 -right-2 h-7 w-7 border-4 border-[#050f26] shadow-xl">
                                                    <AvatarImage src={notification.user.image} />
                                                    <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{notification.title}</h4>
                                                {notification.unread && <Badge className="bg-primary text-black font-black text-[9px] uppercase tracking-widest h-5 px-2">High Priority</Badge>}
                                            </div>
                                            <p className="text-muted-foreground leading-relaxed font-medium">
                                                {notification.description}
                                            </p>
                                            <div className="flex items-center gap-3 pt-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-1.5">
                                                    <Clock className="h-3 w-3" />
                                                    {notification.timestamp}
                                                </span>
                                                <span className="h-1 w-1 rounded-full bg-white/10" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Protocol: {notification.id}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/10 bg-white/5 hover:bg-primary hover:text-black">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                onClick={() => deleteNotification(notification.id)}
                                                className="h-10 w-10 rounded-xl border-white/10 bg-white/5 hover:bg-red-500 hover:text-white"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-24 text-center space-y-6">
                                     <div className="h-24 w-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/5">
                                        <Bell className="h-12 w-12 text-muted-foreground opacity-20" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-white">Registry Silent</h3>
                                        <p className="text-muted-foreground max-w-sm mx-auto">All platform activities have been acknowledged and synchronized.</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

