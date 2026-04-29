
'use client';
import { useState, useEffect } from 'react';
import { initializeUsers, usersData, activityLogs } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, PoundSterling, Globe, UserSquare, Monitor, Clock, Activity, LogIn, Send, Gavel } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';

export default function AdminUsersPage() {
    const router = useRouter();
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        initializeUsers();
        setAllUsers([...usersData.filter(u => u.email !== 'ryan.reynolds@averpay.io')]); 
        setLogs(activityLogs);
    }, []);
    
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 px-3 py-1">Active</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20 px-3 py-1">Pending</Badge>;
            case 'suspended':
                return <Badge variant="destructive" className="px-3 py-1">Suspended</Badge>;
            default:
                return <Badge variant="secondary" className="px-3 py-1">{status}</Badge>;
        }
    };

    const getLogIcon = (type: string) => {
        switch (type) {
            case 'login': return <LogIn className="h-4 w-4 text-blue-400" />;
            case 'submission': return <Send className="h-4 w-4 text-green-400" />;
            case 'withdrawal': return <PoundSterling className="h-4 w-4 text-yellow-400" />;
            default: return <Activity className="h-4 w-4 text-primary" />;
        }
    };


    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">Command Center 🛰️</h1>
                    <p className="text-muted-foreground">Real-time user monitoring, global telemetry, and profile oversight.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Network Live</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Activity Feed */}
                <Card className="lg:col-span-1 bg-[#050f26] border-white/5 shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/5">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                            <Activity className="h-5 w-5 text-primary" />
                            Live Feed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto scrollbar-hide">
                            {logs.map((log) => (
                                <div key={log.id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 p-2 bg-white/5 rounded-lg border border-white/10">
                                            {getLogIcon(log.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{log.user}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {log.type === 'login' && `Logged in from ${log.location}`}
                                                {log.type === 'submission' && `Submitted ${log.project}`}
                                                {log.type === 'withdrawal' && `Requested £${log.amount}`}
                                            </p>
                                            <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mt-1">
                                                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Users Grid */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {allUsers.map((user, idx) => (
                        <motion.div
                            key={user.uid}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="group p-6 flex flex-col items-center relative hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border border-white/5 bg-[#050f26] rounded-3xl overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors">
                                        <MoreVertical className="h-5 w-5" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[#0a1633] border-white/10 text-white">
                                        <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.uid}`)} className="hover:bg-primary/20 cursor-pointer">
                                            Manage Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push(`/admin/chat?userId=${user.uid}`)} className="hover:bg-primary/20 cursor-pointer">
                                            Send Live Message
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-400 hover:bg-red-400/20 cursor-pointer">Suspend User</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <div className="relative mb-6">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                    <Avatar className="h-28 w-28 border-4 border-[#050f26] relative">
                                        <AvatarImage src={user.profilePhoto} />
                                        <AvatarFallback className="bg-primary/20 text-primary text-2xl">{getInitials(user.fullName)}</AvatarFallback>
                                    </Avatar>
                                    <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-green-500 border-4 border-[#050f26] shadow-[0_0_10px_#22c55e]"></span>
                                </div>
                                
                                <h3 className="font-black text-xl text-white mb-1">{user.fullName}</h3>
                                <p className="text-[11px] text-primary font-black uppercase tracking-[0.2em] mb-6">{user.role || 'Freelancer'}</p>
                                
                                <div className="w-full space-y-4 bg-white/5 p-6 rounded-[2rem] text-xs border border-white/5">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-muted-foreground"><UserSquare className="h-4 w-4" /> AverPay ID</span>
                                        <span className="font-bold text-white font-mono bg-white/5 px-2 py-1 rounded">{user.averpayId}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-muted-foreground"><Globe className="h-4 w-4" /> Location</span>
                                        <span className="font-bold text-white">{user.location}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-muted-foreground"><Monitor className="h-4 w-4" /> Terminal</span>
                                        <span className="truncate text-white/80" title={user.browserInfo}>{user.browserInfo?.split(' on ')[0] || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <span className="flex items-center gap-2 text-muted-foreground"><PoundSterling className="h-4 w-4" /> Liquid Balance</span>
                                        <span className="font-black text-xl text-white">£{(user.totalBalance || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="mt-6 w-full flex justify-between items-center px-2">
                                    {getStatusBadge(user.status)}
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => router.push(`/admin/chat?userId=${user.uid}`)}
                                        className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-black hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
                                    >
                                        TERMINAL CHAT
                                    </motion.button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
