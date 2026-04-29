'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { projectsData, updateProjectData, addActivityLog, findUserById } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { 
    Briefcase,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    MessageCircle,
    Search,
    User,
    Check,
    X,
    Filter,
    ArrowUpRight,
    Loader2,
    Calendar,
    PoundSterling,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminProjectsPage() {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const filteredProjects = useMemo(() => {
        return projectsData.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               (findUserById(p.assignedTo)?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || p.status.toLowerCase() === statusFilter;
            return matchesSearch && matchesStatus;
        }).sort((a,b) => new Date(b.submissionDeadline).getTime() - new Date(a.submissionDeadline).getTime());
    }, [searchQuery, statusFilter]);

    const handleProjectStatusChange = async (projectId: string, newStatus: string, projectTitle: string) => {
        setIsUpdating(projectId);
        try {
            await new Promise(r => setTimeout(r, 600)); // Simulate sync
            updateProjectData(projectId, { status: newStatus });
            
            addActivityLog({
                type: newStatus === 'approved' ? 'payout' : 'submission',
                user: 'System',
                target: findUserById(projectsData.find(p => p.id === projectId)?.assignedTo || '')?.fullName || 'User',
                description: `Operation "${projectTitle}" marked as ${newStatus}`
            });

            toast({
                title: "Protocol Update Success",
                description: `Operation status changed to ${newStatus.toUpperCase()}.`,
            });
        } catch (e) {
            toast({ variant: "destructive", title: "Sync Failed", description: "Could not update registry." });
        } finally {
            setIsUpdating(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Approved</Badge>;
            case 'submitted':
                return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Review Required</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">In Progress</Badge>;
            case 'new':
                return <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/20">Unassigned</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white">Operation Registry</h1>
                    <p className="text-muted-foreground mt-1">Strategic oversight of all mission briefs and completions.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Search missions or personnel..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12 w-full md:w-80 pl-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-muted-foreground focus:border-primary/50" 
                        />
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        {['all', 'submitted', 'pending', 'approved'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    statusFilter === status 
                                    ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' 
                                    : 'text-muted-foreground hover:text-white'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project) => {
                        const assignedUser = findUserById(project.assignedTo);
                        return (
                            <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="group"
                            >
                                <Card className="bg-[#050f26] border-white/5 rounded-[2.5rem] overflow-hidden hover:border-primary/20 transition-all duration-500 shadow-2xl">
                                    <div className="p-8 flex flex-col lg:flex-row lg:items-center gap-8">
                                        {/* Status & Icon */}
                                        <div className="flex items-center gap-6 flex-1">
                                            <div className="h-16 w-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary group-hover:bg-primary/5 transition-all duration-500">
                                                <Briefcase className="h-8 w-8 text-white/50 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{project.title}</h3>
                                                    {getStatusBadge(project.status)}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Due {format(new Date(project.submissionDeadline), 'MMM dd')}</span>
                                                    <span className="h-1 w-1 rounded-full bg-white/10" />
                                                    <span className="text-primary/70 font-mono text-[10px] uppercase tracking-widest">Op-ID: {project.id.slice(-6)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Assigned Personnel */}
                                        <div className="flex items-center gap-4 border-l border-white/5 pl-8 hidden xl:flex overflow-hidden max-w-[240px]">
                                            <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                                                <AvatarImage src={assignedUser?.profilePhoto} />
                                                <AvatarFallback className="bg-primary/20 text-primary">{getInitials(assignedUser?.fullName || 'U')}</AvatarFallback>
                                            </Avatar>
                                            <div className="truncate">
                                                <p className="text-xs font-bold text-white truncate">{assignedUser?.fullName}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{assignedUser?.role}</p>
                                            </div>
                                        </div>

                                        {/* Financials & Actions */}
                                        <div className="flex items-center justify-between lg:justify-end gap-12 border-t lg:border-t-0 border-white/5 pt-6 lg:pt-0">
                                            <div className="text-left lg:text-right">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Mission Value</p>
                                                <p className="text-2xl font-black text-white">£{project.paymentAmount.toLocaleString()}</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white group/btn">
                                                                <Link href={`/admin/users/${project.assignedTo}`}>
                                                                    <User className="h-5 w-5" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-black border-white/10 text-white font-bold p-3 rounded-xl shadow-2xl">
                                                            Personnel File
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white group/btn">
                                                                <Link href={`/admin/chat?userId=${project.assignedTo}`}>
                                                                    <MessageCircle className="h-5 w-5" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-black border-white/10 text-white font-bold p-3 rounded-xl shadow-2xl">
                                                            Secure Message
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                {project.status === 'submitted' && (
                                                    <div className="flex items-center gap-2 ml-4">
                                                        <Button 
                                                            onClick={() => handleProjectStatusChange(project.id, 'approved', project.title)}
                                                            disabled={isUpdating === project.id}
                                                            className="h-12 px-6 rounded-2xl bg-green-500 hover:bg-green-600 text-black font-black flex items-center gap-2"
                                                        >
                                                            {isUpdating === project.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                            Approve
                                                        </Button>
                                                        <Button 
                                                            variant="outline"
                                                            onClick={() => handleProjectStatusChange(project.id, 'requires-edits', project.title)}
                                                            className="h-12 w-12 rounded-2xl border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all p-0"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                )}

                                                {project.status === 'approved' && (
                                                    <Badge className="h-12 px-6 flex items-center justify-center gap-2 rounded-2xl bg-white/5 text-white/50 font-black border border-white/10">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Concluded
                                                    </Badge>
                                                )}
                                                
                                                {project.status === 'pending' && (
                                                     <Badge className="h-12 px-6 flex items-center justify-center gap-2 rounded-2xl bg-primary/10 text-primary font-black border border-primary/20">
                                                        <Clock className="h-4 w-4 animate-spin-slow" />
                                                        Synchronizing
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

