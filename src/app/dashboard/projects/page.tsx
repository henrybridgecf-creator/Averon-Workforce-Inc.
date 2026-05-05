'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Check,
  X,
  FilePlus,
  Filter,
  XIcon,
  ShieldCheck,
  ArrowUpRight,
  ChevronRight,
  Briefcase,
  AlertCircle,
  Search,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { projectsData, updateProjectData, addActivityLog, submitProject } from "@/lib/mock-data";
import { useSearchParams, useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";

const projectStatuses = ["new", "pending", "submitted", "approved", "requires-edits", "rejected"];

function ProjectsComponent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFromUrl = searchParams.get('status');

  const [areProjectsLoading, setAreProjectsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // State for the submission modal
  const [submittingProject, setSubmittingProject] = useState<any>(null);
  const [projectFiles, setProjectFiles] = useState<{file: File, id: string, progress: number, status: 'waiting' | 'uploading' | 'completed'}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState<string | null>(statusFromUrl);
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  // State for Decline Mission
  const [decliningProject, setDecliningProject] = useState<any>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [isDeclining, setIsDeclining] = useState(false);

  useEffect(() => {
    const storedUserRaw = localStorage.getItem('loggedInUser');
    if (storedUserRaw) {
        try {
            setUserProfile(JSON.parse(storedUserRaw));
        } catch (e) {
            console.error("Failed to parse loggedInUser in projects page", e);
        }
    }
  }, []);

  useEffect(() => {
    setStatusFilter(statusFromUrl);
    setAreProjectsLoading(true);
    setTimeout(() => {
        setAreProjectsLoading(false);
    }, 600);
  }, [statusFromUrl]);

  const filteredProjects = useMemo(() => {
    if (!userProfile) return [];
    let projects = projectsData.filter(p => p.assignedTo === userProfile.uid);

    // Initial segmentation based on URL
    if (statusFromUrl === 'new') {
        projects = projects.filter(p => p.status.toLowerCase() === 'new');
    } else if (statusFromUrl === null) {
        projects = projects.filter(p => p.status.toLowerCase() !== 'new');
    }

    // Search filter
    if (searchQuery) {
        projects = projects.filter(p => 
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
        projects = projects.filter(p => p.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Date filter
    if (dateRangeFilter?.from) {
      projects = projects.filter(p => {
        const deadline = new Date(p.submissionDeadline || "");
        if (isNaN(deadline.getTime())) return false;
        if (!dateRangeFilter.to) return deadline >= dateRangeFilter.from!;
        return deadline >= dateRangeFilter.from! && deadline <= dateRangeFilter.to!;
      });
    }

    return projects;
  }, [statusFilter, dateRangeFilter, statusFromUrl, searchQuery, userProfile]);
  
  const handleProjectAction = (projectId: string, newStatus: 'pending' | 'rejected', reason?: string) => {
    updateProjectData(projectId, { 
      status: newStatus,
      declineReason: reason || null
    });
    toast({
      title: newStatus === 'pending' ? 'Mission Accepted' : 'Mission Declined',
      description: `Target operation status synchronized as ${newStatus}.`,
    });
    setAreProjectsLoading(true);
    setTimeout(() => setAreProjectsLoading(false), 10);
  };

  const handleDeclineSubmit = () => {
    if (!decliningProject) return;
    setIsDeclining(true);
    handleProjectAction(decliningProject.id, 'rejected', declineReason);
    setDecliningProject(null);
    setDeclineReason("");
    setIsDeclining(false);
  };

  const getStatusBadge = (status: string) => {
     switch(status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Approved</Badge>;
      case "submitted":
         return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Review Sent</Badge>;
      case "pending":
         return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Active Operation</Badge>;
      case "new":
        return <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/20">New Brief</Badge>;
       case "rejected":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Declined</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleFileSubmit = async () => {
    if (projectFiles.length === 0 || !submittingProject) {
      toast({ variant: "destructive", title: "Buffer Empty", description: "Please select at least one file to submit." });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate progress for each file
    for (let i = 0; i < projectFiles.length; i++) {
        const fileId = projectFiles[i].id;
        
        // Update to uploading status
        setProjectFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'uploading' as const } : f));
        
        // Simulate progress intervals
        for (let p = 0; p <= 100; p += 20) {
            await new Promise(r => setTimeout(r, 200));
            setProjectFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: p } : f));
        }
        
        // Mark as completed
        setProjectFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'completed' as const } : f));
    }

    try {
      const filesForSubmit = projectFiles.map(f => ({
          name: f.file.name,
          size: `${(f.file.size / 1024 / 1024).toFixed(2)}MB`,
          url: URL.createObjectURL(f.file)
      }));

      submitProject(submittingProject.id, filesForSubmit);

      await new Promise(r => setTimeout(r, 500));

      toast({
        title: "Transmission Success",
        description: `Mission data with ${projectFiles.length} files for "${submittingProject.title}" has been encrypted and sent.`,
      });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Transmission Failed", description: "Critical error during file dispatch." });
    } finally {
        setIsSubmitting(false);
        setSubmittingProject(null);
        setProjectFiles([]);
    }
  };
  
  const clearFilters = () => {
      setStatusFilter(statusFromUrl || (statusFromUrl === null ? 'all' : null) );
      setDateRangeFilter(undefined);
      setSearchQuery("");
  }

  const activeFilterCount = [statusFilter !== 'all', !!dateRangeFilter, !!searchQuery].filter(Boolean).length;

  return (
    <DashboardLayout>
         <div className="flex-1 space-y-8 p-4 sm:p-8 pt-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Secure Workspace</span>
                   </div>
                    <h2 className="text-4xl font-black tracking-tight text-white">{statusFromUrl === 'new' ? 'New Briefs' : 'Operations Cluster'}</h2>
                    <p className="text-muted-foreground mt-1 max-w-lg">Manage your project ecosystem with real-time tracking and mission dispatch capabilities.</p>
                </div>
                
                <div className="flex items-center gap-3">
                     <div className="relative group flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Terminal search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12 pl-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-muted-foreground focus:border-primary/50" 
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-12 w-12 rounded-2xl border-white/5 bg-white/5 p-0 relative group">
                                <Filter className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-black text-[10px] font-black flex items-center justify-center border-4 border-[#030a1c]">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-[#0a1633] border-white/10 p-6 rounded-[2rem] shadow-2xl" align="end">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Filter Cluster</h4>
                                    <p className="text-xs text-muted-foreground">Isolate specific operation states.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocol Status</Label>
                                        <Select onValueChange={setStatusFilter} value={statusFilter || 'all'}>
                                            <SelectTrigger className="h-10 bg-white/5 border-white/5 rounded-xl text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0a1633] border-white/10 text-white">
                                                <SelectItem value="all">All States</SelectItem>
                                                {projectStatuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('-', ' ')}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                         <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Timeline Range</Label>
                                         <Calendar
                                            mode="range"
                                            selected={dateRangeFilter}
                                            onSelect={setDateRangeFilter}
                                            className="rounded-xl border border-white/5 bg-white/5 text-white"
                                        />
                                    </div>
                                    {activeFilterCount > 0 && (
                                        <Button variant="ghost" onClick={clearFilters} className="w-full text-xs text-primary hover:bg-primary/10 rounded-xl">
                                            Purge Filters
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid gap-6">
                {areProjectsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-[2.5rem] bg-white/5" />
                    ))
                ) : filteredProjects.length > 0 ? (
                    <div className="grid gap-6">
                        {filteredProjects.map((project: any) => (
                            <motion.div 
                                key={project.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group"
                            >
                                <Card className="bg-[#050f26] border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden hover:border-primary/20 transition-all duration-500">
                                    <div className="p-8 flex flex-col lg:flex-row lg:items-center gap-8">
                                        <div className="flex items-center gap-6 flex-1">
                                            <div className="h-16 w-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary group-hover:bg-primary/5 transition-all duration-500 relative">
                                                <Briefcase className="h-8 w-8 text-white/50 group-hover:text-primary transition-colors" />
                                                {project.status === 'new' && (
                                                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary animate-ping" />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{project.title}</h3>
                                                    {getStatusBadge(project.status)}
                                                </div>
                                                {project.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-xl mb-4">{project.description}</p>
                                                )}

                                                {/* Operational Timeline */}
                                                <div className="flex items-center gap-2 mb-4">
                                                    {[
                                                        { label: 'Assigned', active: true, done: true },
                                                        { label: 'Submission', active: ['pending', 'requires-edits'].includes(project.status), done: ['submitted', 'approved', 'paid'].includes(project.status) },
                                                        { label: 'Audit', active: project.status === 'submitted', done: ['approved', 'paid'].includes(project.status) },
                                                        { label: 'Payout', active: project.status === 'approved', done: project.status === 'paid' },
                                                    ].map((step, i, arr) => (
                                                        <React.Fragment key={step.label}>
                                                            <div className="flex items-center gap-2">
                                                                <div className={cn(
                                                                    "h-6 w-6 rounded-full flex items-center justify-center text-[8px] font-black border transition-all duration-500",
                                                                    step.done ? "bg-green-500 border-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]" : 
                                                                    step.active ? "bg-primary/20 border-primary text-primary animate-pulse" : 
                                                                    "bg-white/5 border-white/10 text-muted-foreground"
                                                                )}>
                                                                    {step.done ? <Check className="h-3 w-3" /> : i + 1}
                                                                </div>
                                                                <span className={cn(
                                                                    "text-[8px] uppercase tracking-widest font-black hidden sm:block",
                                                                    step.active || step.done ? "text-white" : "text-muted-foreground"
                                                                )}>{step.label}</span>
                                                            </div>
                                                            {i < arr.length - 1 && (
                                                                <div className={cn(
                                                                    "h-[1px] w-4 sm:w-8 transition-colors duration-500",
                                                                    step.done ? "bg-green-500" : "bg-white/10"
                                                                )} />
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="h-3 w-3" /> 
                                                        Target: {project.submissionDeadline ? (
                                                            (() => {
                                                                try {
                                                                    const d = new Date(project.submissionDeadline);
                                                                    return isNaN(d.getTime()) ? 'TBD' : format(d, 'MMM dd, yyyy');
                                                                } catch (e) {
                                                                    return 'TBD';
                                                                }
                                                            })()
                                                        ) : 'TBD'}
                                                    </span>
                                                    <span className="h-1 w-1 rounded-full bg-white/10 hidden sm:block" />
                                                    <span className="text-primary/70 font-mono text-[10px] uppercase tracking-widest">Hash: #{project.id.slice(-6)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between lg:justify-end gap-x-8 gap-y-4 border-t lg:border-t-0 border-white/5 pt-6 lg:pt-0">
                                            <div className="text-left lg:text-right">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Contract Valuation</p>
                                                <p className="text-3xl font-black text-white">£{Number(project.paymentAmount || 0).toLocaleString()}</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                {project.briefUrl && (
                                                    <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all group/btn">
                                                        <a href={project.briefUrl} download={project.title} target="_blank" rel="noopener noreferrer">
                                                            <Download className="h-5 w-5 group-hover/btn:-translate-y-1 transition-transform" />
                                                        </a>
                                                    </Button>
                                                )}

                                                {project.status === "new" ? (
                                                    <div className="flex gap-2">
                                                        <Dialog open={decliningProject?.id === project.id} onOpenChange={(iso) => !iso && setDecliningProject(null)}>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" onClick={() => setDecliningProject(project)} className="h-12 px-6 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 font-bold">
                                                                    Decline
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="bg-[#0a1633] border-white/10 p-8 rounded-[3rem] shadow-2xl">
                                                                <DialogHeader className="mb-6">
                                                                    <DialogTitle className="text-2xl font-black text-white">Decline Assignment</DialogTitle>
                                                                    <DialogDescription className="text-muted-foreground font-medium">Please provide a reason for rejecting the target operation: {project.title}</DialogDescription>
                                                                </DialogHeader>
                                                                <div className="space-y-4">
                                                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Rejection Rationale</Label>
                                                                    <textarea 
                                                                        className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-primary/50 outline-none transition-colors"
                                                                        placeholder="State reason for non-acceptance..."
                                                                        value={declineReason}
                                                                        onChange={(e) => setDeclineReason(e.target.value)}
                                                                    />
                                                                </div>
                                                                <DialogFooter className="mt-8 flex gap-3">
                                                                    <Button variant="ghost" className="rounded-xl text-white/50" onClick={() => setDecliningProject(null)}>Abort</Button>
                                                                    <Button onClick={handleDeclineSubmit} disabled={isDeclining || !declineReason} className="bg-red-500 hover:bg-red-600 text-white rounded-2xl h-12 flex-1 font-black">
                                                                        Confirm Rejection
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Button onClick={() => handleProjectAction(project.id, 'pending')} className="h-12 px-8 rounded-2xl bg-white text-black hover:bg-white/90 font-black">
                                                            <Zap className="mr-2 h-4 w-4 fill-current" />
                                                            Accept Mission
                                                        </Button>
                                                    </div>
                                                ) : project.status === 'pending' || project.status === 'requires-edits' ? (
                                                    <Dialog open={submittingProject?.id === project.id} onOpenChange={(iso) => !iso && setSubmittingProject(null)}>
                                                        <DialogTrigger asChild>
                                                            <Button onClick={() => setSubmittingProject(project)} className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-black shadow-lg shadow-primary/20">
                                                                Dispatch Sync <ChevronRight className="ml-2 h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="bg-[#0a1633] border-white/10 p-8 rounded-[3rem] shadow-2xl max-w-xl">
                                                            <DialogHeader className="mb-6">
                                                                <DialogTitle className="text-2xl font-black text-white">Mission Transmission</DialogTitle>
                                                                <DialogDescription className="text-muted-foreground font-medium">Upload completion files for operation: {submittingProject?.title}</DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-6">
                                                                <div 
                                                                    className="border-2 border-dashed border-white/10 rounded-[2rem] p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group/upload"
                                                                    onClick={() => document.getElementById('project-file')?.click()}
                                                                >
                                                                    <Input id="project-file" type="file" multiple className="hidden" 
                                                                      onChange={(e) => {
                                                                          const files = Array.from(e.target.files || []);
                                                                          setProjectFiles(prev => [...prev, ...files.map(f => ({ 
                                                                            file: f, 
                                                                            id: Math.random().toString(36).substr(2, 9),
                                                                            progress: 0,
                                                                            status: 'waiting' as const
                                                                          }))]);
                                                                      }} 
                                                                    />
                                                                    <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/upload:scale-110 transition-transform">
                                                                        <Upload className="h-6 w-6 text-primary" />
                                                                    </div>
                                                                    <p className="font-bold text-white">Add Target Files</p>
                                                                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">PDF, ZIP or DOCX</p>
                                                                </div>

                                                                {projectFiles.length > 0 && (
                                                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                                                                        {projectFiles.map((f) => (
                                                                            <div key={f.id} className="space-y-2 p-4 bg-white/5 border border-white/5 rounded-2xl">
                                                                                <div className="flex items-center justify-between">
                                                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                                                        <div className={cn(
                                                                                            "h-8 w-8 rounded-lg flex items-center justify-center border",
                                                                                            f.status === 'completed' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-white/5 border-white/10 text-muted-foreground"
                                                                                        )}>
                                                                                            {f.status === 'completed' ? <CheckCircle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                                                                        </div>
                                                                                        <div className="overflow-hidden">
                                                                                            <p className="text-xs text-white font-bold truncate">{f.file.name}</p>
                                                                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{(f.file.size / 1024).toFixed(0)}KB • {f.status}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    {!isSubmitting && (
                                                                                        <Button 
                                                                                            variant="ghost" 
                                                                                            size="icon" 
                                                                                            className="h-8 w-8 rounded-xl hover:bg-red-500/20 hover:text-red-400"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setProjectFiles(prev => prev.filter(item => item.id !== f.id));
                                                                                            }}
                                                                                        >
                                                                                            <X className="h-4 w-4" />
                                                                                        </Button>
                                                                                    )}
                                                                                </div>
                                                                                {(f.status === 'uploading' || f.status === 'completed') && (
                                                                                    <div className="space-y-1">
                                                                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                                                            <motion.div 
                                                                                                initial={{ width: 0 }}
                                                                                                animate={{ width: `${f.progress}%` }}
                                                                                                className={cn("h-full transition-all duration-300", f.status === 'completed' ? "bg-green-500" : "bg-primary")}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{f.progress}% Transmitted</span>
                                                                                            {f.status === 'uploading' && <span className="text-[8px] font-black uppercase text-primary animate-pulse tracking-widest">Encrypting...</span>}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <DialogFooter className="mt-8 flex gap-3">
                                                                <Button variant="ghost" className="rounded-xl text-white/50" onClick={() => setSubmittingProject(null)} disabled={isSubmitting}>Abort</Button>
                                                                <Button onClick={handleFileSubmit} disabled={isSubmitting || projectFiles.length === 0} className="bg-primary hover:bg-primary/90 rounded-2xl h-12 flex-1 font-black">
                                                                    {isSubmitting ? 'Transmitting...' : 'Execute Dispatch'}
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                ) : (
                                                    <Button variant="secondary" disabled className="h-12 px-6 rounded-2xl bg-white/5 text-white/50 border-white/10">
                                                        Operation Concluded
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center space-y-6">
                        <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                            <AlertCircle className="h-12 w-12 text-muted-foreground opacity-20" />
                        </div>
                        <div className="space-y-2">
                             <h3 className="text-2xl font-bold text-white">Registry Empty</h3>
                             <p className="text-muted-foreground max-w-sm mx-auto">No operations match your current terminal filters. Reset your cluster parameters.</p>
                        </div>
                         <Button onClick={clearFilters} variant="outline" className="rounded-xl border-white/10">Purge Filter Params</Button>
                    </div>
                )}
            </div>
         </div>
    </DashboardLayout>
  );
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={<DashboardLayout><div>Decrypting Workspace...</div></DashboardLayout>}>
            <ProjectsComponent />
        </Suspense>
    );
}
