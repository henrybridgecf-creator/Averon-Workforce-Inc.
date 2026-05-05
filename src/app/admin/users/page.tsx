
'use client';
import { useState, useEffect } from 'react';
import { initializeUsers, usersData, activityLogs, broadcastNotification, addActivityLog, saveData } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, PoundSterling, Globe, UserSquare, Monitor, Clock, Activity, LogIn, Send, Gavel, Megaphone, Github, Loader2, Zap } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function AdminUsersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState({ title: '', text: '' });
    const [suspendingUser, setSuspendingUser] = useState<any | null>(null);
    const [pulseMode, setPulseMode] = useState(false);

    useEffect(() => {
        try {
            refreshData();
            // Listen for storage changes to sync across tabs
            const handleStorageChange = (e: StorageEvent) => {
                if (e.key === 'usersData') {
                    refreshData();
                }
            };
            window.addEventListener('storage', handleStorageChange);
            return () => window.removeEventListener('storage', handleStorageChange);
        } catch (e) {
            console.error("Failed to load registry data", e);
        }
    }, []);

    const refreshData = () => {
        initializeUsers(true);
        setAllUsers([...usersData.filter(u => u && u.email && u.email !== 'ryan.reynolds@averpay.io')]); 
        setLogs([...activityLogs]);
    };

    const handleToggleActiveLight = (userId: string, isOnline: boolean) => {
        const user = usersData.find(u => u.uid === userId);
        if (!user) return;

        const updatedUser = { 
            ...user, 
            isOnline,
            lastSeen: new Date().toISOString() 
        };
        
        const updatedUsers = usersData.map(u => 
            u.uid === userId ? updatedUser : u
        );
        
        saveData('usersData', updatedUsers);
        
        toast({
            title: isOnline ? "Personnel Online" : "Personnel Offline",
            description: `Active light for ${user.fullName} has been ${isOnline ? 'activated' : 'deactivated'}.`,
        });

        refreshData();
    };

    const handleBroadcast = async () => {
        if (!broadcastMessage.title || !broadcastMessage.text) return;
        setIsBroadcasting(true);
        await new Promise(r => setTimeout(r, 1200));
        
        broadcastNotification({
            type: 'announcement',
            title: broadcastMessage.title,
            description: broadcastMessage.text,
            link: '/dashboard'
        });

        addActivityLog({
            type: 'broadcast',
            user: 'Admin',
            target: 'All Personnel',
            description: `Sent platform-wide announcement: ${broadcastMessage.title}`
        });

        toast({
            title: "Broadcast Transmitted",
            description: "Signal distributed to all active personnel in the registry.",
        });
        
        setIsBroadcasting(false);
        setBroadcastMessage({ title: '', text: '' });
        refreshData();
    };

    const handleSyncGithub = async () => {
        setIsSyncing(true);
        await new Promise(r => setTimeout(r, 1500));
        
        initializeUsers();
        refreshData();

        toast({
            title: "Manifest Synchronized",
            description: "Mission personnel database has been refreshed and synchronized with the core manifest.",
        });
        
        setIsSyncing(false);
    };
    
    const handleApproveUser = async (userToApprove: any) => {
        const updatedUsers = usersData.map(u => 
            u.uid === userToApprove.uid ? { ...u, status: 'active' } : u
        );
        
        saveData('usersData', updatedUsers);
        
        addActivityLog({
            type: 'approval',
            user: 'Admin',
            target: userToApprove.fullName,
            description: `Admiral Approval granted for ${userToApprove.fullName}. Secure Credentials dispatched to ${userToApprove.email}.`
        });

        // Simulate Sending Congratulatory Email
        broadcastNotification({
            type: 'system',
            title: "Access Protocol Activated",
            description: `Congratulations ${userToApprove.fullName}, your AverPay account has been verified and activated. Welcome to the network.`,
            link: '/dashboard'
        });

        toast({
            title: "Personnel Activated",
            description: `Congratulatory protocol successfully transmitted to ${userToApprove.email}.`,
            className: "bg-[#050f26] border-primary/20 text-white rounded-2xl",
        });

        refreshData();
    };

    const handleSuspendUser = async () => {
        if (!suspendingUser) return;
        
        const updatedUsers = usersData.map(u => 
            u.uid === suspendingUser.uid ? { ...u, status: 'suspended' } : u
        );
        
        saveData('usersData', updatedUsers);
        
        addActivityLog({
            type: 'suspension',
            user: 'Admin',
            target: suspendingUser.fullName,
            description: `Suspended personnel access for ${suspendingUser.fullName} (ID: ${suspendingUser.averpayId})`
        });

        toast({
            title: "Access Revoked",
            description: `Personnel ${suspendingUser.fullName} has been suspended from the registry.`,
            variant: "destructive"
        });

        setSuspendingUser(null);
        refreshData();
    };

    const getStatusBadge = (status: string) => {
        if (!status) return <Badge variant="secondary" className="px-3 py-1 uppercase text-[10px]">Unknown</Badge>;
        
        switch (status.toLowerCase()) {
            case 'active':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 px-3 py-1">Active</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20 px-3 py-1">Pending</Badge>;
            case 'suspended':
                return <Badge variant="destructive" className="px-3 py-1">Suspended</Badge>;
            default:
                return <Badge variant="secondary" className="px-3 py-1">{status.toUpperCase()}</Badge>;
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
                    <Button 
                        onClick={handleSyncGithub}
                        disabled={isSyncing}
                        variant="outline" 
                        className="h-12 px-6 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 text-white font-bold flex items-center gap-2"
                    >
                        {isSyncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Activity className="h-5 w-5" />}
                        Update Manifest
                    </Button>

                    <Button 
                        onClick={() => setPulseMode(!pulseMode)}
                        variant="outline" 
                        className={`h-12 px-6 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 font-bold flex items-center gap-2 transition-all ${pulseMode ? 'text-primary border-primary/30 bg-primary/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'text-white'}`}
                    >
                        <Zap className={`h-5 w-5 ${pulseMode ? 'animate-pulse text-primary' : ''}`} />
                        Pulse Mode
                    </Button>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black flex items-center gap-2 shadow-lg shadow-primary/20">
                                <Megaphone className="h-5 w-5" />
                                Broadcast
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#050f26] border-white/10 text-white rounded-[2.5rem] p-8 max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic">Platform <span className="text-primary">Broadcast</span></DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    Distribute a secure announcement to all active personnel.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Announcement Header</Label>
                                    <Input 
                                        placeholder="e.g. SYSTEM MAINTENANCE" 
                                        value={broadcastMessage.title}
                                        onChange={(e) => setBroadcastMessage({...broadcastMessage, title: e.target.value})}
                                        className="bg-white/5 border-white/5 rounded-xl h-12 focus:border-primary/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Transmission Payload</Label>
                                    <Textarea 
                                        placeholder="Enter the transmission content..." 
                                        rows={4}
                                        value={broadcastMessage.text}
                                        onChange={(e) => setBroadcastMessage({...broadcastMessage, text: e.target.value})}
                                        className="bg-white/5 border-white/5 rounded-xl resize-none focus:border-primary/50"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button 
                                    onClick={handleBroadcast}
                                    disabled={isBroadcasting || !broadcastMessage.title || !broadcastMessage.text}
                                    className="h-12 w-full rounded-xl bg-primary text-black font-black"
                                >
                                    {isBroadcasting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Initiate Broadcast"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Network Live</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                    {user.status === 'pending' && (
                                        <DropdownMenuItem 
                                            onClick={() => handleApproveUser(user)} 
                                            className="text-primary hover:bg-primary/20 cursor-pointer font-bold"
                                        >
                                            Confirm Personnel
                                        </DropdownMenuItem>
                                    )}
                                    {user.status !== 'suspended' && (
                                        <DropdownMenuItem 
                                            onClick={() => setSuspendingUser(user)} 
                                            className="text-red-400 hover:bg-red-400/20 cursor-pointer font-bold"
                                        >
                                            Suspend User
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="relative mb-6">
                                <AnimatePresence>
                                    {pulseMode && user.isOnline && (
                                        <motion.div 
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1.2, opacity: [0.1, 0.3, 0.1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute -inset-4 bg-primary rounded-full blur-xl"
                                        />
                                    )}
                                </AnimatePresence>
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <Avatar className="h-28 w-28 border-4 border-[#050f26] relative">
                                    <AvatarImage src={user.profilePhoto} />
                                    <AvatarFallback className="bg-primary/20 text-primary text-2xl">{getInitials(user.fullName)}</AvatarFallback>
                                </Avatar>
                                <span className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-[#050f26] shadow-lg ${user.isOnline ? 'bg-green-500 shadow-green-500/50' : 'bg-zinc-600 shadow-none opacity-50'} ${pulseMode && user.isOnline ? 'animate-pulse scale-110' : ''}`}></span>
                            </div>
                            
                            <h3 className="font-black text-xl text-white mb-1">{user.fullName}</h3>
                            <p className="text-[11px] text-primary font-black uppercase tracking-[0.2em] mb-4">{user.role || 'Freelancer'}</p>
                            
                            <div className="flex items-center gap-3 mb-6 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                <Label htmlFor={`active-light-${user.uid}`} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-0.5">Active Status</Label>
                                <Switch 
                                    id={`active-light-${user.uid}`}
                                    checked={user.isOnline}
                                    onCheckedChange={(checked) => handleToggleActiveLight(user.uid, checked)}
                                    className="data-[state=checked]:bg-green-500"
                                />
                            </div>

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
                                    <span className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> Last Pulse</span>
                                    <span className="font-bold text-white">
                                        {(() => {
                                            if (!user.lastSeen) return 'ACT-LIVE';
                                            const d = new Date(user.lastSeen);
                                            return isNaN(d.getTime()) ? 'UNKNOWN' : formatDistanceToNow(d, { addSuffix: true });
                                        })()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="flex items-center gap-2 text-muted-foreground"><PoundSterling className="h-4 w-4" /> Liquid Balance</span>
                                    <span className="font-black text-xl text-white">£{Number(user.totalBalance || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-6 w-full flex justify-between items-center px-2">
                                {getStatusBadge(user.status)}
                                {user.status === 'pending' ? (
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleApproveUser(user)}
                                        className="bg-primary text-black px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                                    >
                                        APPROVE ACCESS
                                    </motion.button>
                                ) : (
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => router.push(`/admin/chat?userId=${user.uid}`)}
                                        className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-black hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
                                    >
                                        TERMINAL CHAT
                                    </motion.button>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Persistent Activity Log Section */}
            <Card className="bg-[#050f26] border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
                            <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black italic text-white uppercase tracking-tight">Personnel <span className="text-primary">Operations Log</span></CardTitle>
                            <p className="text-xs text-muted-foreground font-medium">Real-time authentication and interaction telemetry</p>
                        </div>
                    </div>
                    <Button 
                        variant="link" 
                        className="text-primary font-black uppercase text-xs tracking-widest p-0"
                        onClick={refreshData}
                    >
                        Force Refresh
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">User / Agent</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Action Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Event Payload</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence initial={false}>
                                    {logs.map((log) => (
                                        <motion.tr 
                                            key={log.id} 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-white/[0.03] transition-colors group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-[10px] font-black text-primary">
                                                        {log.user?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="text-sm font-black text-white">{log.user}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    {getLogIcon(log.type)}
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">{log.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs text-muted-foreground font-medium max-w-md">
                                                    {log.description || (
                                                        <>
                                                            {log.type === 'login' && `Secure authentication established from ${log.location}`}
                                                            {log.type === 'submission' && `New project manifest submitted: ${log.project}`}
                                                            {log.type === 'withdrawal' && `Liquidity request initiated: £${log.amount?.toLocaleString()}`}
                                                            {log.type === 'broadcast' && `Global transmission deployed to all terminals.`}
                                                            {log.type === 'verification' && `Identification documents uploaded to registry.`}
                                                            {log.type === 'profile_update' && `Personnel profile data synchronized.`}
                                                        </>
                                                    )}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-black text-white font-mono">
                                                        {(() => {
                                                            if (!log.timestamp) return 'ACT-LIVE';
                                                            const d = new Date(log.timestamp);
                                                            return isNaN(d.getTime()) ? 'UNKNOWN' : formatDistanceToNow(d, { addSuffix: true });
                                                        })()}
                                                    </span>
                                                    <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">
                                                        {(() => {
                                                            if (!log.timestamp) return '--:--:--';
                                                            const d = new Date(log.timestamp);
                                                            return isNaN(d.getTime()) ? '--:--:--' : d.toLocaleTimeString();
                                                        })()}
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground italic font-medium">
                                            No recent activity detected in the mission manifest.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                <div className="p-8 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Registry Audit Log</span>
                    <span className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        Live Monitoring Active
                    </span>
                </div>
            </Card>

            {/* User Suspension Confirmation Dialog */}
            <Dialog open={!!suspendingUser} onOpenChange={(open) => !open && setSuspendingUser(null)}>
                <DialogContent className="bg-[#050f26] border-white/10 text-white rounded-[2.5rem] p-8 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic flex items-center gap-2">
                             <Gavel className="h-6 w-6 text-red-500" />
                             Revoke <span className="text-red-500">Access</span>
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground pt-2">
                            You are about to suspend <span className="text-white font-bold">{suspendingUser?.fullName}</span>. This will immediately restrict their access to the platform and halt all active project disbursements.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                            <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Warning</p>
                            <p className="text-[11px] text-white/70">This action is logged in the permanent audit trail and requires secondary authorization for reversal.</p>
                        </div>
                    </div>
                    <DialogFooter className="flex gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => setSuspendingUser(null)}
                            className="flex-1 h-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10"
                        >
                            Abort
                        </Button>
                        <Button 
                            onClick={handleSuspendUser}
                            className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black"
                        >
                            Confirm Suspension
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
