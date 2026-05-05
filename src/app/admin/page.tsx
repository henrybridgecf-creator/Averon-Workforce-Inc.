
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
    Users, 
    Briefcase, 
    Zap, 
    TrendingUp, 
    ShieldCheck, 
    Globe, 
    Activity, 
    Monitor, 
    PoundSterling,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Eye
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    Legend
} from 'recharts';
import { usersData, projectsData, activityLogs, initializeUsers, findUserById } from '@/lib/mock-data';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import RealTimeStatus from '@/components/ui/real-time-status';

const financialData = [
  { name: 'Mon', volume: 4500, missions: 12 },
  { name: 'Tue', volume: 5200, missions: 15 },
  { name: 'Wed', volume: 4800, missions: 10 },
  { name: 'Thu', volume: 6100, missions: 18 },
  { name: 'Fri', volume: 5900, missions: 20 },
  { name: 'Sat', volume: 7200, missions: 25 },
  { name: 'Sun', volume: 6800, missions: 22 },
];

const growthData = [
  { name: 'Jan', users: 120 },
  { name: 'Feb', users: 210 },
  { name: 'Mar', users: 180 },
  { name: 'Apr', users: 290 },
  { name: 'May', users: 350 },
  { name: 'Jun', users: usersData.length + 300 }, // Scaled for effect
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminPage() {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        initializeUsers();
        setLogs(activityLogs);
        setIsLoaded(true);

        const handleUpdate = () => {
            setLogs([...activityLogs]);
        };

        window.addEventListener('storage', handleUpdate);
        window.addEventListener('averpayActivity', handleUpdate);
        return () => {
            window.removeEventListener('storage', handleUpdate);
            window.removeEventListener('averpayActivity', handleUpdate);
        };
    }, []);

    const recentLogs = logs.slice(0, 8);

    const totalPersonnel = usersData.length;
    const activeMissions = projectsData.filter(p => ['new', 'submitted', 'requires-edits'].includes(p.status)).length;
    const pendingCapital = projectsData.filter(p => p.status === 'approved')
                             .reduce((acc, curr) => acc + (curr.paymentAmount || 0), 0);
    
    // Calculate status distribution
    const statusCounts = projectsData.reduce((acc: any, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.keys(statusCounts).map(status => {
        const value = statusCounts[status];
        const total = projectsData.length || 1;
        const percentage = ((value / total) * 100).toFixed(1);
        return {
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value,
            percentage
        };
    });

    const stats = [
        { label: 'Personnel Registry', value: totalPersonnel, icon: Users, delta: '+12%', trend: 'up', color: 'text-blue-400' },
        { label: 'Active Operations', value: activeMissions, icon: Briefcase, delta: '+4', trend: 'up', color: 'text-primary' },
        { label: 'Capital Flux (24h)', value: `£${pendingCapital.toLocaleString()}`, icon: PoundSterling, delta: '-2.1%', trend: 'down', color: 'text-green-400' },
        { label: 'Network Latency', value: '42ms', icon: Activity, delta: 'Stable', trend: 'neutral', color: 'text-yellow-400' },
    ];

    if (!isLoaded) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Admin Command Center</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic">AverPay <span className="text-primary">Core Oversight</span></h1>
                    <p className="text-muted-foreground mt-1">Global workforce telemetry and capital flow monitoring.</p>
                </div>
                
                <RealTimeStatus role="Admin" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => stat.label === 'Personnel Registry' && router.push('/admin/users')}
                        className={stat.label === 'Personnel Registry' ? 'cursor-pointer' : ''}
                    >
                        <Card className="bg-[#050f26] border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden hover:border-primary/20 transition-all duration-500 group">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn("h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary transition-all", stat.color)}>
                                        <stat.icon className="h-7 w-7" />
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest",
                                        stat.trend === 'up' ? "text-green-500" : stat.trend === 'down' ? "text-red-400" : "text-muted-foreground"
                                    )}>
                                        {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
                                        {stat.trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
                                        {stat.delta}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
                                    <p className="text-3xl font-black text-white">{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Visualizer - Financial Flux */}
                <Card className="lg:col-span-8 bg-[#050f26] border-white/5 rounded-[3rem] shadow-2xl overflow-hidden p-8 border-t-primary/20 border-t-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <CardTitle className="text-2xl font-black text-white">Liquidity Flux</CardTitle>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Capital Transmission Velocity (Last 7 Cycles)</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="rgba(255,255,255,0.3)" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontWeight: 900 }}
                                />
                                <YAxis 
                                    yAxisId="left"
                                    stroke="rgba(255,255,255,0.3)" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(value) => `£${value}`}
                                    tick={{ fontWeight: 900 }}
                                />
                                <YAxis 
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="rgba(255,255,255,0.3)" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontWeight: 900 }}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0a1633', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontWeight: 'bold', color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar yAxisId="left" dataKey="volume" name="Capital Volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="right" dataKey="missions" name="Operation Count" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Status distribution PieChart */}
                <Card className="lg:col-span-4 bg-[#050f26] border-white/5 rounded-[3rem] shadow-2xl overflow-hidden p-8 border-t-yellow-500/20 border-t-4">
                     <div className="flex items-center justify-between mb-8">
                        <div>
                            <CardTitle className="text-2xl font-black text-white">Mission Efficiency</CardTitle>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Global Operation Status Distribution</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full flex flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                     contentStyle={{ backgroundColor: '#0a1633', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontWeight: 'bold', color: '#fff' }}
                                     formatter={(value: any, name: any, props: any) => [`${value} (${props.payload.percentage}%)`, name]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-4 mt-4 w-full px-4">
                            {pieData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{entry.name}: {entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Growth Visualizer */}
                <Card className="lg:col-span-4 bg-[#050f26] border-white/5 rounded-[3rem] shadow-2xl overflow-hidden p-8 border-t-green-500/20 border-t-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <CardTitle className="text-xl font-black text-white italic">Personnel <span className="text-green-400">Expansion</span></CardTitle>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">Registry Growth Curve</p>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip 
                                     contentStyle={{ backgroundColor: '#0a1633', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontWeight: 'bold', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-center flex-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Q1 Base</p>
                            <p className="text-xl font-black text-white">120</p>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="text-center flex-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current</p>
                            <p className="text-xl font-black text-green-400">{usersData.length}</p>
                        </div>
                    </div>
                </Card>

                {/* Live Activity Column */}
                <Card className="lg:col-span-8 bg-[#050f26] border-white/5 rounded-[3rem] shadow-2xl p-8 border-t-primary/20 border-t-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <CardTitle className="text-2xl font-black text-white italic">Operational <span className="text-primary">Telemetry</span></CardTitle>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Synchronized Mission Logs</p>
                        </div>
                        <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recentLogs.map((log, i) => {
                            const user = usersData.find(u => u.fullName === log.user);
                            return (
                                <motion.div 
                                    key={log.id} 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => user && router.push(`/admin/users/${user.uid}`)}
                                    className="flex gap-4 group p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer relative"
                                >
                                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-primary/10 transition-colors">
                                        {log.type === 'login' ? <Users className="h-5 w-5 text-blue-400" /> : <Zap className="h-5 w-5 text-primary" />}
                                    </div>
                                    <div className="space-y-1 overflow-hidden">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-bold text-white truncate">{log.user}</p>
                                            <Eye className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground truncate leading-relaxed">
                                            {log.type === 'login' ? `Terminal Link: ${log.location}` : 
                                             log.type === 'withdrawal' ? `Liquidity: £${log.amount?.toLocaleString()}` :
                                             `Operation: ${log.project || log.target}`}
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/50">
                                            {(() => {
                                                if (!log.timestamp) return 'LIVE';
                                                const d = new Date(log.timestamp);
                                                return isNaN(d.getTime()) ? 'LIVE' : format(d, 'HH:mm:ss');
                                            })()}
                                        </p>
                                    </div>
                                    {user && (
                                        <div className="absolute top-2 right-2 bg-primary/20 text-primary text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                            Manage Profile
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className="mt-8">
                        <Button onClick={() => router.push('/admin/users')} variant="ghost" className="w-full text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-2xl py-8 border border-dashed border-primary/20">
                            Access Personnel Database & Registry Archives
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Bottom Grid: Health & Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="bg-[#050f26] border-white/5 rounded-[3rem] p-8 hover:border-sky-500/30 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-14 w-14 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                            <ShieldCheck className="h-7 w-7 text-sky-500" />
                        </div>
                        <div>
                            <h4 className="font-black text-xl italic text-white leading-none mb-1">Identity <span className="text-sky-500">Security</span></h4>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Biometric cluster active</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground font-bold uppercase tracking-widest">Protocol Compliance</span>
                            <span className="text-sky-400 font-black">100%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5 }}
                                className="h-full bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" 
                            />
                        </div>
                    </div>
                </Card>

                <Card className="bg-[#050f26] border-white/5 rounded-[3rem] p-8 hover:border-yellow-500/30 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-14 w-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                            <Globe className="h-7 w-7 text-yellow-500" />
                        </div>
                        <div>
                            <h4 className="font-black text-xl italic text-white leading-none mb-1">Regional <span className="text-yellow-500">Nodes</span></h4>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Active Grid Status</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {['LONDONU', 'TOKYO-T', 'NYC-CENT', 'CAPE-T'].map(node => (
                             <div key={node} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between text-[10px] font-black text-white/50 uppercase tracking-tighter">
                                 {node}
                                 <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                             </div>
                        ))}
                    </div>
                </Card>

                <Card className="bg-red-500/5 border-red-500/20 rounded-[3rem] p-8 border border-dashed hover:bg-red-500/10 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-6 text-red-500">
                        <AlertCircle className="h-10 w-10" />
                        <div>
                            <h4 className="font-black text-xl italic leading-none mb-1">Anomalies</h4>
                            <p className="text-[10px] uppercase tracking-widest font-black opacity-70 italic font-medium">Critical Intercepts: 0</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-400 font-bold leading-relaxed">
                        SYSTEM INTEGRITY PEAK. NO MALICIOUS SYNC ATTEMPTS IN THIS CYCLE.
                    </div>
                    <Button variant="outline" className="w-full mt-6 border-red-500/20 hover:bg-red-500/20 text-red-500 rounded-xl font-bold uppercase text-[10px] tracking-widest italic">
                        View Intercept Records
                    </Button>
                </Card>
            </div>
        </div>
    );
}
