'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  PoundSterling,
  Briefcase,
  Users,
  MapPin,
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  Wifi,
  Mail,
  MessageCircle,
  TrendingUp,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import React, { useEffect, useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from "recharts"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { projectsData, initializeUsers, activityLogs } from "@/lib/mock-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "motion/react";


export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showMaintenanceAlert, setShowMaintenanceAlert] = useState(true);

  useEffect(() => {
    initializeUsers(); 
    const storedUserRaw = localStorage.getItem('loggedInUser');
    if (storedUserRaw) {
        try {
            const storedUser = JSON.parse(storedUserRaw);
            setUserProfile(storedUser);
            
            if (storedUser.uid === 'mock-user-03') {
                 toast({
                    title: "Priority: Maintenance Synchronization Required",
                    description: "Your profile was excluded from the recent platform maintenance cycle. A manual update and synchronization fee of €450.00 is required. Please contact support.",
                    duration: 15000,
                });
            }
        } catch (e) {
            router.push('/login');
        }
    } else {
        router.push('/login');
    }
    setIsLoading(false);
  }, [router, toast]);

  const earningsData = useMemo(() => {
    const monthlyEarnings: { [key: string]: number } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    monthNames.forEach(month => {
        monthlyEarnings[month] = 0;
    });
    
    if (!userProfile) {
        return Object.keys(monthlyEarnings).map(month => ({ name: month, total: 0 }));
    }

    const userProjects = projectsData.filter(p => p.assignedTo === userProfile.uid);

    userProjects.forEach(project => {
        if (project.status === 'approved' && project.submittedAt) {
            const submittedDate = new Date(project.submittedAt);
            if (isNaN(submittedDate.getTime())) return; 

            let isInRange = true;
            if (dateRange?.from) {
                if (!dateRange.to) {
                    isInRange = submittedDate >= dateRange.from;
                } else {
                    isInRange = submittedDate >= dateRange.from && submittedDate <= dateRange.to;
                }
            }

            if (isInRange) {
                const month = monthNames[submittedDate.getMonth()];
                if (month) {
                    monthlyEarnings[month] += project.paymentAmount;
                }
            }
        }
    });

    return Object.keys(monthlyEarnings).map((month, idx) => ({
        name: month,
        total: monthlyEarnings[month],
        active: idx === new Date().getMonth()
    }));
  }, [dateRange, userProfile]);

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">Approved</Badge>;
      case "submitted":
         return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">Submitted</Badge>;
      case "pending":
         return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20">Pending</Badge>;
      case "new":
        return <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20 hover:bg-sky-500/20">New</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  if (isLoading || !userProfile) {
      return (
          <DashboardLayout>
              <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <Skeleton className="h-12 w-1/2 rounded-xl" />
                    <Skeleton className="h-24 w-full sm:w-64 rounded-xl" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-32 rounded-3xl" />
                    <Skeleton className="h-32 rounded-3xl" />
                    <Skeleton className="h-32 rounded-3xl" />
                </div>
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                    <Skeleton className="col-span-1 lg:col-span-4 h-96 rounded-3xl" />
                    <Skeleton className="col-span-1 lg:col-span-3 h-96 rounded-3xl" />
                </div>
              </div>
          </DashboardLayout>
      )
  }


  return (
    <DashboardLayout>
         <div className="flex-1 space-y-8 p-4 sm:p-8 pt-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
            <AnimatePresence>
                {showMaintenanceAlert && userProfile.uid === 'mock-user-03' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative"
                    >
                        <Alert className="bg-destructive/10 border-destructive/20 text-destructive-foreground p-8 shadow-2xl rounded-[2rem] overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent opacity-50" />
                            <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
                                <div className="bg-destructive p-4 rounded-2xl animate-pulse shadow-lg shadow-destructive/20">
                                    <Wifi className="h-8 w-8 text-destructive-foreground" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-1">
                                        <AlertTitle className="text-2xl font-black text-white flex items-center gap-2">
                                            System Sync Required
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-destructive/50 text-destructive bg-destructive/5">Immediate Action</Badge>
                                        </AlertTitle>
                                        <AlertDescription className="text-lg text-white/70 leading-relaxed max-w-3xl">
                                            Telemetry records indicate profile <span className="font-mono bg-white/10 px-2 rounded text-white">{userProfile.averpayId}</span> was excluded from global maintenance cycle 4.0. 
                                            <span className="block mt-3 text-white font-medium">
                                                A synchronization fee of <span className="bg-white text-black px-2 py-0.5 rounded-md font-bold">€450.00</span> must be cleared to resume automatic payroll updates and data encryption protocols.
                                            </span>
                                        </AlertDescription>
                                    </div>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <Button asChild className="bg-white text-black hover:bg-white/90 font-bold px-8 py-6 rounded-2xl shadow-xl shadow-black/20">
                                            <a href="mailto:averon.hrdesk@outlook.com">
                                                <Mail className="mr-2 h-5 w-5" />
                                                Resolve with Support
                                            </a>
                                        </Button>
                                        <Button variant="ghost" onClick={() => setShowMaintenanceAlert(false)} className="text-white/50 hover:text-white h-12 px-6">Dismiss Notice</Button>
                                    </div>
                                </div>
                            </div>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-white mb-2">Hello, {userProfile?.fullName?.split(' ')[0] || 'User'} 👋</h2>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        AverPay Secure Hub v4.0.2 Active
                    </p>
                </div>
                 <div className="flex items-center space-x-6 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl group hover:border-primary/30 transition-all">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-primary rounded-full blur opacity-20 group-hover:opacity-40 transition" />
                        <Avatar className="h-16 w-16 border-2 border-white/10 relative">
                            <AvatarImage src={userProfile?.profilePhoto} />
                            <AvatarFallback className="bg-primary/20 text-primary">{getInitials(userProfile?.fullName || 'U')}</AvatarFallback>
                        </Avatar>
                    </div>
                    <div>
                        <p className="font-black text-xl text-white">{userProfile?.fullName}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/20 bg-primary/5">{userProfile?.averpayId}</Badge>
                            <Badge variant="outline" className="text-[10px] flex items-center gap-1 border-white/10 bg-white/5">
                                <MapPin className="h-3 w-3" />
                                {userProfile.location || 'Global'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-[#0c1a3a] to-[#050f26] border-white/5 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <PoundSterling className="h-24 w-24 text-white" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Liquid Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-white">£{(userProfile?.totalBalance || 0).toLocaleString()}</div>
                  <div className="flex items-center gap-2 mt-4">
                    <Link href="/dashboard/projects?status=pending" className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-xs text-muted-foreground hover:text-white transition-colors">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        +£{(userProfile?.pendingBalance || 0).toLocaleString()} Processing
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#050f26] border-white/5 rounded-3xl shadow-2xl relative group">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Network Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-white leading-none">Supervisor Hub</div>
                        <p className="text-xs text-muted-foreground mt-1">Status: <span className="text-green-500 font-bold">Encrypted & Online</span></p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full justify-between rounded-xl border-white/10 hover:bg-white/5 hover:text-white">
                    <Link href="/dashboard/chat">
                        Open Secure Terminal
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#050f26] border-white/5 rounded-3xl shadow-2xl relative">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Workload Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="flex items-baseline gap-2">
                        <div className="text-4xl font-black text-white">{projectsData?.filter(p => p.assignedTo === userProfile.uid).length || 0}</div>
                        <span className="text-xs text-muted-foreground font-bold">Total Operations</span>
                   </div>
                   <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                        <div className="text-xs font-bold text-muted-foreground">Network Rank:</div>
                        <Badge className="bg-primary/10 text-primary border-primary/20">Tier #{userProfile?.rank || '0'}</Badge>
                   </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-8 grid-cols-1 lg:grid-cols-7">
                <Card className="col-span-1 lg:col-span-4 bg-[#050f26] border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
                  <CardHeader className="border-b border-white/5 px-8 pt-8 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold text-white">Active Operations 🗄️</CardTitle>
                        <CardDescription>Real-time status of your assigned projects.</CardDescription>
                    </div>
                    <Button variant="ghost" asChild className="text-primary hover:bg-primary/10 rounded-xl">
                        <Link href="/dashboard/projects">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 pt-6 space-y-6">
                    {projectsData && projectsData.filter(p => p.assignedTo === userProfile.uid).length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {projectsData.filter(p => p.assignedTo === userProfile.uid).map((project: any) => (
                                <div key={project.id} className="py-4 first:pt-0 last:pb-0 flex items-center group cursor-pointer">
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                                        <Briefcase className="h-5 w-5 text-white/50 group-hover:text-primary" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="font-bold text-white group-hover:text-primary transition-colors">{project.title}</p>
                                        <p className="text-xs text-muted-foreground">Submission ID: AP-X{project.id.slice(-5)}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1.5">
                                        <p className="font-black text-white">£{project.paymentAmount.toLocaleString()}</p>
                                        {getStatusBadge(project.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center space-y-4">
                            <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                                <Activity className="h-8 w-8" />
                            </div>
                            <p className="text-muted-foreground font-medium">No projects found in your local buffer.</p>
                        </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-3 bg-[#050f26] border-white/5 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
                  <CardHeader className="px-8 pt-8 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold text-white">Earnings Analytics</CardTitle>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className="h-10 rounded-xl border-white/10 bg-white/5 text-xs text-white hover:bg-white/10"
                            >
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {dateRange?.from ? format(dateRange.from, "MMM dd") : "Period"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={1}
                            />
                        </PopoverContent>
                    </Popover>
                  </CardHeader>
                  <CardContent className="flex-1 px-4 pb-8">
                     <ChartContainer config={{}} className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={earningsData}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#4b5563"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#4b5563"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `£${value}`}
                                />
                                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                    {earningsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.active ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.05)'} />
                                    ))}
                                </Bar>
                                <RechartsTooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-[#0a1633] border border-white/10 p-3 rounded-xl shadow-2xl">
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{payload[0].payload.name}</p>
                                                    <p className="text-lg font-black text-white">£{Number(payload[0].value).toLocaleString()}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                    <div className="mt-8 grid grid-cols-2 gap-4 px-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Peak Month</p>
                            <p className="text-lg font-black text-white">{earningsData.sort((a,b) => b.total - a.total)[0]?.name || 'N/A'}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Fiscal Year</p>
                            <p className="text-lg font-black text-white">2026</p>
                        </div>
                    </div>
                  </CardContent>
                </Card>
            </div>
         </div>
    </DashboardLayout>
  );
}
