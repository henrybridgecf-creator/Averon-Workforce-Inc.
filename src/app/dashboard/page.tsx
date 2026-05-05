'use client';
import { Card } from "@/components/ui/card";
import { 
    LayoutDashboard, 
    Briefcase, 
    Wallet, 
    ArrowUpRight, 
    ArrowDownRight, 
    Clock, 
    CheckCircle2, 
    TrendingUp,
    Zap,
    ShieldCheck,
    LucideIcon,
    ChevronRight,
    BarChart3,
    Activity,
    Lock,
    MapPin,
    Upload,
    Eye,
    Search,
    Users,
    PoundSterling
} from "lucide-react";
import RealTimeStatus from "@/components/ui/real-time-status";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useMemo } from "react";
import { initializeUsers, usersData, projectsData, updateUserData, saveData, addActivityLog } from "@/lib/mock-data";
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    AreaChart, 
    Area 
} from 'recharts';
import { getInitials, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
    trend?: {
        value: string;
        isUp: boolean;
    };
    delay?: number;
}

const StatCard = ({ title, value, description, icon: Icon, trend, delay = 0 }: StatCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -5 }}
        className="h-full"
    >
        <Card className="p-8 h-full bg-card/40 border-white/[0.05] hover:border-primary/40 transition-all group relative overflow-hidden rounded-[2.5rem] shadow-2xl backdrop-blur-3xl">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-700">
                <Icon className="h-28 w-28 text-white scale-110" />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-14 w-14 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-500">
                        <Icon className="h-6 w-6 text-white group-hover:text-primary transition-colors duration-500" />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${trend.isUp ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {trend.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {trend.value}
                        </div>
                    )}
                </div>
                
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/40 mb-2">{title}</p>
                    <h3 className="text-4xl font-black text-white tracking-tighter group-hover:text-primary transition-colors duration-500">{value}</h3>
                </div>
                
                <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">{description}</p>
            </div>
        </Card>
    </motion.div>
);

const chartData = [
    { name: 'Jan', earnings: 4500 },
    { name: 'Feb', earnings: 5200 },
    { name: 'Mar', earnings: 7800 },
    { name: 'Apr', earnings: 6100 },
    { name: 'May', earnings: 9400 },
    { name: 'Jun', earnings: 8200 },
];

export default function DashboardPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        active: 0
    });

    useEffect(() => {
        initializeUsers();
        const refreshProfile = () => {
            const storedUserRaw = localStorage.getItem('loggedInUser');
            if (storedUserRaw) {
                try {
                    const storedUser = JSON.parse(storedUserRaw);
                    setUser(storedUser);

                    // Calculate actual stats from projectsData
                    const userProjects = projectsData.filter((p: any) => p.assignedTo === storedUser.uid);
                    setStats({
                        total: userProjects.length,
                        pending: userProjects.filter((p: any) => p.status === 'new' || p.status === 'requires-edits').length,
                        completed: userProjects.filter((p: any) => p.status === 'approved' || p.status === 'paid').length,
                        active: userProjects.filter((p: any) => p.status === 'submitted').length
                    });
                } catch (e) {
                    console.error("Failed to parse loggedInUser", e);
                }
            }
        };

        refreshProfile();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'loggedInUser' || e.key === 'usersData') {
                refreshProfile();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const updatedUser = updateUserData(user.uid, { profilePhoto: dataUrl });
            setUser(updatedUser);
            saveData('loggedInUser', updatedUser);

            addActivityLog({
                type: 'profile_update',
                user: user.fullName,
                target: 'Registry',
                description: `Updated profile identification photo.`
            });

            toast({
                title: 'Photo Synchronized',
                description: `Registry updated with your latest visual identification.`,
            });
        };
        reader.readAsDataURL(file);
    };

    if (!user) return null;

    const completionRate = Math.round((stats.completed / (stats.total || 1)) * 100);

    const isClient = user?.role === 'Client';
    const isFreelancer = user?.role === 'Freelancer';

    const freelancerStats = [
        { title: "Available Liquid", value: `£${(user.totalBalance || 0).toLocaleString()}`, description: "Verified funds ready for dispatch", icon: Wallet, trend: { value: "+12.5%", isUp: true }, delay: 0.1 },
        { title: "Ops Success", value: `${completionRate}%`, description: "Mission completion accuracy", icon: CheckCircle2, trend: { value: "High", isUp: true }, delay: 0.2 },
        { title: "Pending Review", value: stats.active.toString(), description: "Missions in auditing pipeline", icon: Clock, delay: 0.3 },
        { title: "Open Briefs", value: stats.pending.toString(), description: "Unclaimed operational targets", icon: Briefcase, delay: 0.4 },
    ];

    const clientStats = [
        { title: "Total Budget", value: `£${(projectsData.filter((p: any) => p.assignedTo === user.uid).reduce((acc: number, p: any) => acc + (p.paymentAmount || 0), 0)).toLocaleString()}`, description: "Active capital allocated", icon: PoundSterling, trend: { value: "+5.2%", isUp: true }, delay: 0.1 },
        { title: "Active Missions", value: projectsData.filter((p: any) => p.assignedTo === user.uid).length.toString(), description: "Ongoing strategic operations", icon: Activity, trend: { value: "On Track", isUp: true }, delay: 0.2 },
        { title: "Awaiting Review", value: projectsData.filter((p: any) => p.status === 'submitted' && p.assignedTo === user.uid).length.toString(), description: "Targets requiring clearance", icon: Search, delay: 0.3 },
        { title: "Personnel", value: "12", description: "High-trust agents deployed", icon: Users, delay: 0.4 },
    ];

    const currentStats = isClient ? clientStats : freelancerStats;

    return (
        <DashboardLayout>
            <div className="space-y-10 max-w-[1200px] mx-auto py-6 px-4 sm:px-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 w-fit"
                        >
                            <Zap className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Online: {user.role} Authorization</span>
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-6xl font-black text-white tracking-tighter"
                        >
                            {isClient ? 'Strategic' : 'Operational'} <span className="text-primary italic">Intelligence</span>
                        </motion.h1>
                        
                        {user.maintenanceFeeDue > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 group"
                            >
                                <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                                    <Lock className="h-5 w-5 text-red-500 group-hover:animate-bounce" />
                                </div>
                                <div>
                                    <p className="text-red-500 font-black uppercase tracking-widest text-[10px]">Registry Alert: Maintenance Fee Required</p>
                                    <p className="text-sm text-white/70 font-medium">Clear your maintenance fee of <span className="text-white font-bold">£{Number(user.maintenanceFeeDue || 0).toLocaleString()}</span> to ensure uninterrupted terminal access.</p>
                                </div>
                                <Button size="sm" className="ml-auto bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl h-9">
                                    Clear Fee
                                </Button>
                            </motion.div>
                        )}

                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-muted-foreground font-medium max-w-xl"
                        >
                            {isClient 
                                ? `Welcome, Director ${user.fullName}. Your oversight portal is initialized. Review mission pools and budget allocation.`
                                : `Welcome back, agent ${user.fullName}. Your secondary encryption terminal is active. All dispatches synchronized.`}
                        </motion.p>
                    </div>

                    <div className="flex flex-col items-end gap-6">
                        <RealTimeStatus role={user.role === 'Client' ? 'Client' : 'Freelancer'} userId={user.uid} />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center space-x-6 p-6 bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl group hover:border-primary/30 transition-all duration-500"
                        >
                        <div className="relative">
                            <Avatar className="h-16 w-16 border-2 border-white/5 ring-1 ring-white/10 relative overflow-hidden group/avatar cursor-pointer rounded-2xl transition-all">
                                <AvatarImage src={user.profilePhoto} className="object-cover" />
                                <AvatarFallback className="bg-primary/20 text-primary font-black uppercase">{getInitials(user.fullName)}</AvatarFallback>
                                <Label htmlFor="quick-photo-upload" className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                                    <Upload className="h-5 w-5 text-primary" />
                                    <span className="text-[9px] font-black uppercase text-primary mt-1">Sync</span>
                                </Label>
                                <span className={cn(
                                    "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background z-10",
                                    user.isOnline ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" : "bg-zinc-600"
                                )}></span>
                            </Avatar>
                            <Input id="quick-photo-upload" type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                        </div>
                        <div>
                            <p className="font-black text-2xl text-white tracking-tighter">{user.fullName}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className="text-[10px] uppercase font-black border-white/5 bg-white/5 text-muted-foreground/60 h-6 px-3 rounded-full">
                                    Id: {user.averpayId}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] flex items-center gap-1.5 border-white/5 bg-white/5 text-muted-foreground/60 h-6 px-3 rounded-full">
                                    <MapPin className="h-3 w-3" />
                                    {user.location || 'Global'}
                                </Badge>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {currentStats.map((stat, i) => (
                        <StatCard 
                            key={i}
                            title={stat.title} 
                            value={stat.value}
                            description={stat.description}
                            icon={stat.icon as any}
                            trend={stat.trend}
                            delay={stat.delay}
                        />
                    ))}
                </div>

                {/* Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-2"
                    >
                        <Card className="p-10 bg-card border-white/[0.04] rounded-[3rem] shadow-2xl relative overflow-hidden border-t-primary/20 border-t-4 transition-all duration-700">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
                                <div>
                                    <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">{isClient ? 'Budget Utilization' : 'Capital Projection'}</h3>
                                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground/40">{isClient ? 'Monthly expenditure logs' : 'Historical earnings intelligence'} (6 months)</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] rounded-2xl border border-white/5">
                                        <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.1em]">{isClient ? 'Spend' : 'Revenue'}</span>
                                    </div>
                                    <Button variant="outline" size="sm" className="bg-white/5 border-white/10 rounded-xl h-10 text-[10px] font-black uppercase px-5 hover:bg-white/10 transition-all">
                                        Download
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 800 }}
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 800 }}
                                            tickFormatter={(value) => `£${value/1000}k`}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#0a1633', 
                                                borderColor: 'rgba(255,255,255,0.1)', 
                                                borderRadius: '1rem',
                                                fontSize: '12px',
                                                color: '#fff'
                                            }}
                                            itemStyle={{ color: '#3b82f6' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="earnings" 
                                            stroke="#3b82f6" 
                                            strokeWidth={4}
                                            fillOpacity={1} 
                                            fill="url(#colorEarnings)" 
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Operational Timeline */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card className="p-10 bg-card border-white/[0.04] rounded-[3rem] shadow-2xl h-full border-t-primary/20 border-t-4">
                            <h3 className="text-2xl font-black text-white mb-8 tracking-tighter">{isClient ? 'Strategic Lifecycle' : 'Operational Timeline'}</h3>
                            <div className="space-y-10 relative">
                                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/5" />
                                
                                {[
                                    { status: isClient ? 'Op-Brief Issued' : 'Brief Assigned', icon: Briefcase, color: 'text-primary', active: true },
                                    { status: isClient ? 'Personnel Working' : 'In Development', icon: Activity, color: 'text-blue-400', active: true },
                                    { status: isClient ? 'Draft Clearance' : 'Strategic Review', icon: Eye, color: 'text-yellow-400', active: stats.active > 0 },
                                    { status: isClient ? 'Capital Handover' : 'Funds Dispatch', icon: CheckCircle2, color: 'text-green-500', active: stats.completed > 0 },
                                ].map((step, idx) => (
                                    <div key={idx} className={`flex items-start gap-6 relative z-10 transition-all duration-500 ${step.active ? 'opacity-100' : 'opacity-20 translate-x-2'}`}>
                                        <div className={`h-10 w-10 rounded-[1rem] flex items-center justify-center border shadow-xl ${step.active ? 'bg-primary/10 border-primary/40 shadow-primary/5' : 'bg-white/5 border-white/5'}`}>
                                            <step.icon className={`h-4 w-4 ${step.active ? step.color : 'text-muted-foreground'}`} />
                                        </div>
                                        <div className="space-y-1.5 pt-1">
                                            <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${step.active ? 'text-white' : 'text-muted-foreground'}`}>{step.status}</p>
                                            <p className="text-[10px] text-muted-foreground/60 font-bold">
                                                {step.active ? 'Protocol currently in this phase.' : 'Awaiting mission progress...'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-14 p-8 rounded-[2rem] bg-primary/[0.02] border border-primary/10 shadow-inner">
                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-3">{isClient ? 'Strategic Milestone' : 'Next Milestone'}</p>
                                <p className="text-sm text-white/90 font-black italic tracking-tight">{isClient ? 'Review final quarterly budget efficiency.' : 'Verify final build outputs before auditing deadline-alpha.'}</p>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Info Footer */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="p-8 bg-primary/5 border border-primary/10 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 shadow-inner shadow-primary/10"
                >
                    <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center shrink-0 border border-primary/20">
                        {isClient ? <BarChart3 className="h-10 w-10 text-primary" /> : <TrendingUp className="h-10 w-10 text-primary" />}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <p className="text-xl text-white font-black italic">{isClient ? 'Director Insights: Resource Optimality' : 'Strategic Tip: Increase your Submission Velocity'}</p>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                            {isClient 
                                ? 'Directors who maintain a 90% deployment rate see a 22% increase in operational ROI. Review current pending briefs for bottleneck detection.'
                                : 'Agents who submit mission data 48 hours before the protocol deadline experience a 15% reduction in auditing latency. Maximize your liquid asset turnover by optimizing your operational timeline.'}
                        </p>
                    </div>
                    <Button asChild className="bg-primary text-black font-black uppercase tracking-widest rounded-2xl px-10 h-14 hover:bg-primary/90 shadow-lg shadow-primary/20 w-fit">
                        <Link href="/dashboard/projects">{isClient ? 'Manage Operations' : 'Claim New Mission'}</Link>
                    </Button>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
