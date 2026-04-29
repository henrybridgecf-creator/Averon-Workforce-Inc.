
'use client';
import React, { useState, useEffect } from 'react';
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
    ArrowDownRight
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
    Cell
} from 'recharts';
import { usersData, projectsData, activityLogs } from '@/lib/mock-data';
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { format } from 'date-fns';

const data = [
  { name: 'Mon', volume: 4500, missions: 12 },
  { name: 'Tue', volume: 5200, missions: 15 },
  { name: 'Wed', volume: 4800, missions: 10 },
  { name: 'Thu', volume: 6100, missions: 18 },
  { name: 'Fri', volume: 5900, missions: 20 },
  { name: 'Sat', volume: 7200, missions: 25 },
  { name: 'Sun', volume: 6800, missions: 22 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminPage() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const totalPersonnel = usersData.length;
    const activeMissions = projectsData.filter(p => ['pending', 'submitted', 'requires-edits'].includes(p.status)).length;
    const pendingCapital = projectsData.filter(p => p.status === 'approved')
                             .reduce((acc, curr) => acc + curr.paymentAmount, 0);
    
    // Simulate real-time logs
    const recentLogs = activityLogs.slice(0, 5);

    const stats = [
        { label: 'Personnel Registry', value: totalPersonnel, icon: Users, delta: '+12%', trend: 'up', color: 'text-blue-400' },
        { label: 'Active Operations', value: activeMissions, icon: Briefcase, delta: '+4', trend: 'up', color: 'text-primary' },
        { label: 'Capital Flux (24h)', value: `£${pendingCapital.toLocaleString()}`, icon: PoundSterling, delta: '-2.1%', trend: 'down', color: 'text-green-400' },
        { label: 'Network Latency', value: '42ms', icon: Activity, delta: 'Stable', trend: 'neutral', color: 'text-yellow-400' },
    ];

    if (!isLoaded) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
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
                
                <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Protocol Version</p>
                        <p className="text-sm font-bold text-white">v9.4.2-LST</p>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Monitor className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
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
                {/* Main Visualizer */}
                <Card className="lg:col-span-8 bg-[#050f26] border-white/5 rounded-[3rem] shadow-2xl overflow-hidden p-8 border-t-primary/20 border-t-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <CardTitle className="text-2xl font-black text-white">Registry Flux</CardTitle>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Capital Transmission Velocity</p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="border-white/5 bg-white/5 text-white/50">Last 7 Cycles</Badge>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
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
                                    stroke="rgba(255,255,255,0.3)" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(value) => `£${value}`}
                                    tick={{ fontWeight: 900 }}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#050f26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontWeight: 'bold' }}
                                    itemStyle={{ color: 'hsl(var(--primary))' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="volume" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorVolume)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Live Activity Column */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="bg-[#050f26] border-white/5 rounded-[2.5rem] shadow-xl p-8 h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Synchronized Logs
                            </h3>
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <div className="space-y-6">
                            {recentLogs.map((log, i) => (
                                <motion.div 
                                    key={log.id} 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-4 group"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-primary transition-colors">
                                        <Zap className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="space-y-1 overflow-hidden">
                                        <p className="text-xs font-bold text-white truncate">{log.user}</p>
                                        <p className="text-[10px] text-muted-foreground truncate leading-relaxed">
                                            {log.type === 'login' ? `Terminal Link: ${log.location}` : `Operation: ${log.project || log.target}`}
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/50">{format(new Date(log.timestamp), 'HH:mm:ss')}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/5">
                            <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl py-6">
                                Entire Registry Archives
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Bottom Grid: Health & Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="bg-[#050f26] border-white/5 rounded-[2.5rem] p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                            <ShieldCheck className="h-6 w-6 text-sky-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white leading-none mb-1">Identity Security</h4>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">2FA Active across cluster</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">Successful Check-ins</span>
                            <span className="text-white font-bold">100%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 w-[100%]" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-[#050f26] border-white/5 rounded-[2.5rem] p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                            <Globe className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white leading-none mb-1">Regional Nodes</h4>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">All 4 Datacenters Online</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {['UK', 'US', 'ZA', 'EU'].map(node => (
                             <Badge key={node} className="bg-white/5 text-white/50 border-white/10">{node}</Badge>
                        ))}
                        <span className="text-xs text-green-500 font-bold ml-auto">+0ms</span>
                    </div>
                </Card>

                <Card className="bg-red-500/5 border-red-500/10 rounded-[2.5rem] p-8 border border-dashed hover:bg-red-500/10 transition-colors">
                    <div className="flex items-center gap-4 mb-6 text-red-500">
                        <AlertCircle className="h-6 w-6" />
                        <div>
                            <h4 className="font-bold leading-none mb-1">Anomalies Detected</h4>
                            <p className="text-[10px] uppercase tracking-widest font-black opacity-70">Protocol Violations: 0</p>
                        </div>
                    </div>
                    <p className="text-xs text-red-500/60 leading-relaxed italic">"System integrity is currently at peak. No malicious synchronization attempts intercepted in this cycle."</p>
                </Card>
            </div>
        </div>
    );
}

import { cn } from '@/lib/utils';
