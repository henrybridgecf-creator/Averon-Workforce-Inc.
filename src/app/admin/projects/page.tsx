'use client';
import { 
    Briefcase,
    CheckCircle2,
    XCircle,
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
    ArrowUpDown,
    UploadCloud,
    AlertTriangle,
    Loader2,
    Calendar,
    PoundSterling,
    Plus,
    Sparkles,
    BrainCircuit
} from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { format, addDays, isPast, startOfDay, endOfDay, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProjectAIAnalysis } from "@/components/admin/ProjectAIAnalysis";
import { 
    projectsData, 
    updateProjectData, 
    addActivityLog, 
    findUserById, 
    usersData, 
    initializeUsers, 
    saveData,
    payAllApprovedProjects 
} from "@/lib/mock-data";
import { triggerEmailNotification, emailTemplates } from "@/lib/notifications";

const safeFormatDate = (date: any, formatStr: string, fallback = 'TBD') => {
    if (!date) return fallback;
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return fallback;
        return format(d, formatStr);
    } catch (e) {
        return fallback;
    }
};

export default function AdminProjectsPage() {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [deadlineFilter, setDeadlineFilter] = useState<string>("all");
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [editingProject, setEditingProject] = useState<any | null>(null);
    const [inlineEditingStatus, setInlineEditingStatus] = useState<string | null>(null);
    const [inlineEditingDeadline, setInlineEditingDeadline] = useState<string | null>(null);
    const [pendingValue, setPendingValue] = useState<any>(null);
    const [projectToDelete, setProjectToDelete] = useState<any | null>(null);
    const [decliningProject, setDecliningProject] = useState<any | null>(null);
    const [declineReason, setDeclineReason] = useState("");
    const [briefFiles, setBriefFiles] = useState<File[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [analyzingProjectId, setAnalyzingProjectId] = useState<string | null>(null);
    const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);

    // Sorting state
    const [sortBy, setSortBy] = useState<"title" | "status" | "deadline">("deadline");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Form state
    const [newProject, setNewProject] = useState({
        title: "",
        description: "",
        assignedTo: "",
        paymentAmount: "",
        deadline: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    });

    useEffect(() => {
        initializeUsers();
        setAllUsers(usersData.filter(u => u.email !== 'ryan.reynolds@averpay.io'));
    }, []);

    const filteredProjects = useMemo(() => {
        const now = new Date();
        const sorted = projectsData.filter(p => {
            if (!p) return false;
            const assignedUser = findUserById(p.assignedTo);
            const matchesSearch = (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                               (assignedUser?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                               (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || (p.status || "").toLowerCase() === statusFilter;
            
            // Deadline filtering
            let matchesDeadline = true;
            if (p.submissionDeadline) {
                const deadline = new Date(p.submissionDeadline);
                if (deadlineFilter === "overdue") {
                    matchesDeadline = isPast(endOfDay(deadline));
                } else if (deadlineFilter === "today") {
                    matchesDeadline = isWithinInterval(deadline, { start: startOfDay(now), end: endOfDay(now) });
                } else if (deadlineFilter === "week") {
                    matchesDeadline = isWithinInterval(deadline, { start: startOfWeek(now), end: endOfWeek(now) });
                } else if (deadlineFilter === "month") {
                    matchesDeadline = isWithinInterval(deadline, { start: startOfMonth(now), end: endOfMonth(now) });
                }
            } else if (deadlineFilter !== "all") {
                matchesDeadline = false;
            }

            return matchesSearch && matchesStatus && matchesDeadline;
        }).sort((a,b) => {
            let comparison = 0;
            if (sortBy === "title") {
                comparison = a.title.localeCompare(b.title);
            } else if (sortBy === "status") {
                comparison = a.status.localeCompare(b.status);
            } else if (sortBy === "deadline") {
                const dateA = a.submissionDeadline ? new Date(a.submissionDeadline).getTime() : 0;
                const dateB = b.submissionDeadline ? new Date(b.submissionDeadline).getTime() : 0;
                comparison = dateA - dateB;
            }
            return sortOrder === "asc" ? comparison : -comparison;
        });
        return sorted;
    }, [searchQuery, statusFilter, sortBy, sortOrder]);

    const handlePayAll = async () => {
        setIsUpdating("paying-all");
        try {
            await new Promise(r => setTimeout(r, 1200));
            const count = payAllApprovedProjects();
            if (count > 0) {
                toast({
                    title: "Funds Dispatched",
                    description: `Successfully processed payments for ${count} approved operations.`,
                });
            } else {
                toast({
                    title: "No Eligible Operations",
                    description: "Zero approved missions found in the active registry.",
                });
            }
        } catch (e) {
            toast({ variant: "destructive", title: "Batch Payment Failed", description: "Critical error during funds dispatch." });
        } finally {
            setIsUpdating(null);
        }
    };

    const handleDeclineSubmit = async () => {
        if (!decliningProject || !declineReason) return;
        
        setIsUpdating(decliningProject.id);
        try {
            await new Promise(r => setTimeout(r, 600));
            updateProjectData(decliningProject.id, { 
                status: 'rejected',
                declineReason: declineReason
            });
            
            const user = findUserById(decliningProject.assignedTo);
            
            // Send email notification for rejection
            if (user?.email) {
                triggerEmailNotification(
                    user.email,
                    `Operation Update: ${decliningProject.title}`,
                    emailTemplates.projectRejection(user.fullName, decliningProject.title, declineReason)
                );
            }

            addActivityLog({
                type: 'deletion',
                user: 'Admin',
                target: user?.fullName || 'User',
                description: `Operation "${decliningProject.title}" rejected: ${declineReason}`
            });

            toast({
                title: "Operation Rejected",
                description: "Target mission has been terminated and reason logged.",
            });
            setDecliningProject(null);
            setDeclineReason("");
        } catch (e) {
            toast({ variant: "destructive", title: "Action Failed", description: "Could not synchronize rejection state." });
        } finally {
            setIsUpdating(null);
        }
    };

    const handleDeadlineChange = async (projectId: string, newDate: string) => {
        setIsUpdating(projectId);
        try {
            await new Promise(r => setTimeout(r, 600));
            updateProjectData(projectId, { submissionDeadline: new Date(newDate) });
            
            const prod = projectsData.find(p => p.id === projectId);
            const user = findUserById(prod?.assignedTo || '');

            addActivityLog({
                type: 'project_update',
                user: 'Admin',
                target: prod?.title || 'Unknown Project',
                description: `Modified deadline for operation "${prod?.title}" to ${safeFormatDate(newDate, 'MMM dd, yyyy')}`
            });

            toast({
                title: "Temporal Registry Updated",
                description: `Deadline rescheduled to ${safeFormatDate(newDate, 'MMM dd')}.`,
            });
            setInlineEditingDeadline(null);
        } catch (e) {
            toast({ variant: "destructive", title: "Sync Failed", description: "Could not update temporal parameters." });
        } finally {
            setIsUpdating(null);
        }
    };

    const handleProjectStatusChange = async (projectId: string, newStatus: string, projectTitle: string) => {
        setIsUpdating(projectId);
        try {
            await new Promise(r => setTimeout(r, 600)); // Simulate sync
            updateProjectData(projectId, { status: newStatus });
            
            const prod = projectsData.find(p => p.id === projectId);
            const user = findUserById(prod?.assignedTo || '');
            
            // Send email notification for status change (specifically approval)
            if (user?.email && prod) {
                if (newStatus === 'approved') {
                    triggerEmailNotification(
                        user.email,
                        `Operation Approved: ${prod.title}`,
                        emailTemplates.projectApproval(user.fullName, prod.title, prod.paymentAmount)
                    );
                } else if (newStatus === 'requires-edits') {
                    triggerEmailNotification(
                        user.email,
                        `Feedback on Operation: ${prod.title}`,
                        emailTemplates.projectRejection(user.fullName, prod.title, "Strategic review indicates revisions are mandatory.")
                    );
                }
            }

            addActivityLog({
                type: newStatus === 'approved' ? 'payout' : 'submission',
                user: 'System',
                target: user?.fullName || 'User',
                description: `Operation "${projectTitle}" marked as ${newStatus}`
            });

            toast({
                title: "Protocol Update Success",
                description: `Operation status changed to ${newStatus.replace(/-/g, ' ').toUpperCase()}.`,
            });
        } catch (e) {
            toast({ variant: "destructive", title: "Sync Failed", description: "Could not update registry." });
        } finally {
            setIsUpdating(null);
        }
    };

    const handleCreateProject = async () => {
        if (!newProject.title || !newProject.assignedTo || !newProject.paymentAmount) {
            toast({ variant: "destructive", title: "Input Required", description: "Please complete all protocol parameters." });
            return;
        }

        // Validate deadline is not in the past
        if (isPast(startOfDay(new Date(newProject.deadline)))) {
            toast({ 
                variant: "destructive", 
                title: "Temporal Anomaly", 
                description: "Mission deadline cannot be established in the past. Verify local clock." 
            });
            return;
        }

        setIsUpdating("creating");
        try {
            await new Promise(r => setTimeout(r, 800));
            const briefAttachments = briefFiles.map(f => ({
                name: f.name,
                size: `${(f.size / 1024 / 1024).toFixed(2)}MB`,
                url: URL.createObjectURL(f)
            }));

            const newProj = {
                id: `proj-${Date.now()}`,
                title: newProject.title,
                description: newProject.description,
                assignedTo: newProject.assignedTo,
                status: 'pending',
                paymentAmount: parseFloat(newProject.paymentAmount),
                submissionDeadline: new Date(newProject.deadline),
                briefUrl: briefAttachments.length > 0 ? briefAttachments[0].url : '#',
                attachments: briefAttachments,
                submissionUrl: null,
                submittedAt: null,
                reviewNote: null
            };

            projectsData.unshift(newProj);
            saveData('projectsData', projectsData);

            const user = findUserById(newProject.assignedTo);
            addActivityLog({
                type: 'assignment',
                user: 'System',
                target: user?.fullName || 'User',
                description: `Assigned new operation: ${newProject.title}`
            });

            toast({
                title: "Operation Deployed",
                description: `Project has been assigned to ${user?.fullName}.`,
            });
            setIsAssigning(false);
            setBriefFiles([]);
            setNewProject({
                title: "",
                description: "",
                assignedTo: "",
                paymentAmount: "",
                deadline: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
            });
        } catch (e) {
            toast({ variant: "destructive", title: "Deployment Error", description: "Could not initialize operation." });
        } finally {
            setIsUpdating(null);
        }
    };

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;
        
        setIsUpdating(projectToDelete.id);
        try {
            await new Promise(r => setTimeout(r, 600));
            const index = projectsData.findIndex(p => p.id === projectToDelete.id);
            if (index > -1) {
                projectsData.splice(index, 1);
                saveData('projectsData', projectsData);
                
                addActivityLog({
                    type: 'deletion',
                    user: 'Admin',
                    target: 'Registry',
                    description: `Retired operational brief: ${projectToDelete.title}`
                });

                toast({
                    title: "Operation Retired",
                    description: "Operational brief has been purged from the active registry.",
                });
            }
        } catch (e) {
            toast({ variant: "destructive", title: "Purge Failed", description: "Could not modify registry records." });
        } finally {
            setIsUpdating(null);
            setProjectToDelete(null);
        }
    };

    const handleAIAnalysis = async (project: any) => {
        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            toast({
                variant: "destructive",
                title: "AI Terminal Offline",
                description: "Missing API authorization key. Verify environment variables.",
            });
            return;
        }

        setAnalyzingProjectId(project.id);
        try {
            const ai = new GoogleGenAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
            const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
            
            const prompt = `Act as a senior dispute resolution specialist for a project platform. 
            Analyze this dispute and provide a recommendation in JSON format.
            Project: ${project.title}
            Reason: ${project.declineReason}
            Freelancer says: ${project.userFeedback || project.reviewNote}

            JSON format: { "analysis": "...", "recommendation": "approve" | "reject" | "requires-edits", "confidence": 0-1 }`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json|```/g, '').trim();
            const analysis = JSON.parse(jsonStr);

            if (analysis.recommendation === 'request_edits') {
                analysis.recommendation = 'requires-edits';
            }

            setAiAnalysisResult({
                projectId: project.id,
                result: analysis
            });
        } catch (error) {
            console.error("AI Dispute Analysis failed:", error);
            toast({ variant: 'destructive', title: 'Neural Error', description: 'Failed to access the AI resolution matrix.' });
        } finally {
            setAnalyzingProjectId(null);
        }
    };

    const handleUpdateProject = async () => {
        if (!editingProject) return;

        setIsUpdating(editingProject.id);
        try {
            await new Promise(r => setTimeout(r, 800));
            
            const updated = updateProjectData(editingProject.id, {
                title: editingProject.title,
                description: editingProject.description,
                paymentAmount: parseFloat(editingProject.paymentAmount),
                submissionDeadline: new Date(editingProject.deadline),
                status: editingProject.status,
                briefUrl: editingProject.briefUrl,
                submissionUrl: editingProject.submissionUrl
            });

            if (updated) {
                addActivityLog({
                    type: 'profile_update',
                    user: 'Admin',
                    target: 'Registry',
                    description: `Modified operational brief parameters: ${editingProject.title}`
                });

                toast({
                    title: "Registry Synchronized",
                    description: "Operational parameters have been successfully updated.",
                });
                setEditingProject(null);
            }
        } catch (e) {
            toast({ variant: "destructive", title: "Update Failed", description: "Could not modify registry records." });
        } finally {
            setIsUpdating(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase();
        switch (s) {
            case 'approved':
                return (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1 flex items-center gap-2 rounded-full font-black text-[10px] uppercase tracking-tighter shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                        <CheckCircle2 className="h-3 w-3" />
                        Operation Concluded
                    </Badge>
                );
            case 'submitted':
                return (
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 flex items-center gap-2 rounded-full font-black text-[10px] uppercase tracking-tighter shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <Eye className="h-3 w-3 animate-pulse" />
                        Strategic Review Required
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 px-3 py-1 flex items-center gap-2 rounded-full font-black text-[10px] uppercase tracking-tighter shadow-[0_0_15px_rgba(234,179,8,0.2)] border-yellow-500/30">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <Clock className="h-3 w-3" />
                        </motion.div>
                        Field Synchronization Active
                    </Badge>
                );
            case 'requires-edits':
                return (
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20 px-3 py-1 flex items-center gap-2 rounded-full font-black text-[10px] uppercase tracking-tighter shadow-[0_0_15px_rgba(239,68,68,0.2)] border-red-500/30">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <AlertTriangle className="h-3 w-3" />
                        </motion.div>
                        Revisions Requested
                    </Badge>
                );
            case 'new':
                return (
                    <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/20 px-3 py-1 flex items-center gap-2 rounded-full font-black text-[10px] uppercase tracking-tighter border-dashed">
                        <Plus className="h-3 w-3" />
                        Awaiting Assignment
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 px-3 py-1 flex items-center gap-2 rounded-full font-black text-[10px] uppercase tracking-tighter shadow-[0_0_15px_rgba(113,113,122,0.1)]">
                        <XCircle className="h-3 w-3" />
                        Operation Terminated
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary" className="px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-tighter">
                        {status}
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-card/40 border border-white/[0.05] p-8 md:p-10 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10 flex flex-col gap-3">
                    <h1 className="text-5xl font-black text-white italic tracking-tighter leading-none">MISSION<span className="text-primary">REGISTRY</span></h1>
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <p className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground/80 whitespace-nowrap">Global Operational Oversight // Secure Mode</p>
                    </div>
                </div>
                
                <div className="relative z-10 flex flex-wrap items-center gap-4 lg:gap-6">
                    {/* Search Field */}
                    <div className="relative group flex-1 md:flex-none md:min-w-[320px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
                        <Input 
                            placeholder="SEARCH REGISTRY..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 w-full pl-12 bg-white/[0.03] border-white/[0.05] rounded-2xl text-white placeholder:text-muted-foreground/40 focus:border-primary/40 text-[10px] font-black uppercase tracking-widest transition-all duration-500 hover:bg-white/[0.05] shadow-inner" 
                        />
                    </div>

                    <div className="h-10 w-px bg-white/10 hidden md:block" />

                    {/* Filter Group */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-14 w-[190px] bg-white/[0.03] border-white/[0.05] rounded-2xl text-white focus:border-primary/40 transition-all duration-500 hover:bg-white/[0.05]">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-3.5 w-3.5 text-primary/70" />
                                    <SelectValue placeholder="Protocol Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-[#050b1a] border-white/[0.1] text-white rounded-2xl backdrop-blur-3xl">
                                <SelectItem value="all" className="uppercase font-black text-[10px] tracking-widest py-3 focus:bg-primary/10">All Protocols</SelectItem>
                                <SelectItem value="new" className="uppercase font-black text-[10px] tracking-widest py-3 focus:bg-primary/10">Awaiting Assignment</SelectItem>
                                <SelectItem value="pending" className="uppercase font-black text-[10px] tracking-widest py-3 focus:bg-primary/10">Field Synchronization</SelectItem>
                                <SelectItem value="submitted" className="uppercase font-black text-[10px] tracking-widest py-3 focus:bg-primary/10">Strategic Review</SelectItem>
                                <SelectItem value="approved" className="uppercase font-black text-[10px] tracking-widest py-3 text-green-400 focus:bg-green-400/10">Operation Concluded</SelectItem>
                                <SelectItem value="requires-edits" className="uppercase font-black text-[10px] tracking-widest py-3 text-yellow-400 focus:bg-yellow-400/10">Revisions Requested</SelectItem>
                                <SelectItem value="rejected" className="uppercase font-black text-[10px] tracking-widest py-3 text-red-400 focus:bg-red-400/10">Operation Terminated</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Deadline Filter */}
                        <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
                            <SelectTrigger className="h-14 w-[190px] bg-white/[0.03] border-white/[0.05] rounded-2xl text-white focus:border-primary/40 transition-all duration-500 hover:bg-white/[0.05]">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-primary/70" />
                                    <SelectValue placeholder="Temporal Sync" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-[#050b1a] border-white/[0.1] text-white rounded-2xl backdrop-blur-3xl">
                                <SelectItem value="all" className="uppercase font-black text-[10px] tracking-widest py-3 focus:bg-primary/10">Any Time</SelectItem>
                                <SelectItem value="overdue" className="uppercase font-black text-[10px] tracking-widest py-3 text-red-400 focus:bg-red-400/10">System Overdue</SelectItem>
                                <SelectItem value="today" className="uppercase font-black text-[10px] tracking-widest py-3 focus:bg-primary/10">Due Today</SelectItem>
                                <SelectItem value="week" className="uppercase font-black text-[10px] tracking-widest py-3 focus:bg-primary/10">This Cycle (Week)</SelectItem>
                                <SelectItem value="month" className="uppercase font-black text-[10px] tracking-widest py-3 focus:bg-primary/10">This Milestone (Month)</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Sort Group */}
                        <div className="flex bg-white/[0.03] border border-white/[0.05] rounded-2xl p-1.5 gap-1.5 shadow-inner">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => {
                                                if (sortBy === "title") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                                else { setSortBy("title"); setSortOrder("asc"); }
                                            }}
                                            className={cn(
                                                "h-11 w-11 rounded-xl transition-all duration-500",
                                                sortBy === 'title' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/30 hover:text-white hover:bg-white/10'
                                            )}
                                        >
                                            <Briefcase className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-black/90 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest p-2 backdrop-blur-xl">
                                        Sort by Operation Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => {
                                                if (sortBy === "status") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                                else { setSortBy("status"); setSortOrder("asc"); }
                                            }}
                                            className={cn(
                                                "h-11 w-11 rounded-xl transition-all duration-500",
                                                sortBy === 'status' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/30 hover:text-white hover:bg-white/10'
                                            )}
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-black/90 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest p-2 backdrop-blur-xl">
                                        Sort by Protocol Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => {
                                                if (sortBy === "deadline") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                                else { setSortBy("deadline"); setSortOrder("asc"); }
                                            }}
                                            className={cn(
                                                "h-11 w-11 rounded-xl transition-all duration-500",
                                                sortBy === 'deadline' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/30 hover:text-white hover:bg-white/10'
                                            )}
                                        >
                                            <Calendar className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-black/90 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest p-2 backdrop-blur-xl">
                                        Sort by Temporal Deadline {sortBy === 'deadline' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-white/10 hidden xl:block" />

                    {/* Operational Actions */}
                    <div className="flex items-center gap-3 flex-1 md:flex-none">
                        <Button 
                            onClick={handlePayAll}
                            disabled={isUpdating === "paying-all" || !projectsData.some(p => p.status === 'approved')}
                            className="h-14 flex-1 md:flex-none px-8 rounded-2xl bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-green-500/10 transition-all duration-500 active:scale-95 group/btn"
                        >
                            {isUpdating === "paying-all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PoundSterling className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />}
                            Batch Payout
                        </Button>

                        <Dialog open={isAssigning} onOpenChange={setIsAssigning}>
                            <DialogTrigger asChild>
                                <Button className="h-14 flex-1 md:flex-none px-10 rounded-2xl bg-primary hover:bg-primary/80 text-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-primary/10 transition-all duration-500 active:scale-95 group/btn">
                                    <Plus className="h-5 w-5 group-hover/btn:rotate-90 transition-transform" />
                                    Initial Node
                                </Button>
                            </DialogTrigger>
                        <DialogContent className="bg-card/95 backdrop-blur-3xl border border-white/[0.05] text-white rounded-[3.5rem] p-10 max-w-lg shadow-2xl selection:bg-primary/20">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black italic tracking-tighter">Initialize <span className="text-primary">Operation</span></DialogTitle>
                                <DialogDescription className="text-muted-foreground/60 text-xs font-bold leading-relaxed pt-2">
                                    ESTABLISH PROTOCOL PARAMETERS FOR SECURE NODE DEPLOYMENT AND CORE MISSION LOGISTICS.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-8 py-8 max-h-[65vh] overflow-y-auto pr-4 custom-scrollbar">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-1 block">Project Identity</Label>
                                    <Input 
                                        placeholder="e.g. SONY GLOBAL RESEARCH" 
                                        value={newProject.title}
                                        onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                                        className="bg-white/[0.05] border-white/[0.05] rounded-2xl h-14 focus:border-primary/40 focus:ring-opacity-20 transition-all text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-1 block">Operational Directive</Label>
                                    <textarea 
                                        placeholder="Outline high-level objectives and strategic goals..." 
                                        value={newProject.description}
                                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                                        className="w-full min-h-[120px] bg-white/[0.05] border border-white/[0.05] rounded-2xl p-4 text-xs font-bold focus:border-primary/40 outline-none transition-all placeholder:text-muted-foreground/30 leading-relaxed"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-1 block">Target Personnel</Label>
                                    <Select 
                                        onValueChange={(val) => setNewProject({...newProject, assignedTo: val})}
                                        value={newProject.assignedTo}
                                    >
                                        <SelectTrigger className="bg-white/[0.05] border-white/[0.05] rounded-2xl h-14 focus:border-primary/40 focus:ring-opacity-20 transition-all font-bold text-xs shadow-inner">
                                            <SelectValue placeholder="Select high-trust user..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#050b1a] border-white/[0.1] text-white rounded-2xl backdrop-blur-3xl p-2 border shadow-2xl">
                                            {allUsers.map((user) => (
                                                <SelectItem key={user.uid} value={user.uid} className="hover:bg-primary/5 transition-all cursor-pointer rounded-xl py-3 px-4 focus:bg-primary/10">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-10 w-10 border border-white/10">
                                                            <AvatarImage src={user.profilePhoto} />
                                                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">{getInitials(user.fullName)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col text-left">
                                                            <span className="text-xs font-black tracking-tight">{user.fullName}</span>
                                                            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{user.averpayId}</span>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-1 block">Liquidity Cap (£)</Label>
                                        <div className="relative">
                                            <PoundSterling className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                                            <Input 
                                                type="number" 
                                                placeholder="0.00" 
                                                value={newProject.paymentAmount}
                                                onChange={(e) => setNewProject({...newProject, paymentAmount: e.target.value})}
                                                className="bg-white/[0.05] border-white/[0.05] rounded-2xl h-14 pl-10 focus:border-primary/40 text-xs font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-1 block">Phase Deadline</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                                            <Input 
                                                type="date" 
                                                value={newProject.deadline}
                                                onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                                                className="bg-white/[0.05] border-white/[0.05] rounded-2xl h-14 pl-10 focus:border-primary/40 text-xs font-bold text-white [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-1 block">Project Briefs (PDF)</Label>
                                    <input 
                                        type="file" 
                                        id="brief-upload" 
                                        accept=".pdf"
                                        multiple
                                        className="hidden" 
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setBriefFiles(files);
                                        }}
                                    />
                                    <label 
                                        htmlFor="brief-upload"
                                        className="min-h-[120px] border-2 border-dashed border-white/[0.05] rounded-2xl flex flex-col items-center justify-center p-6 gap-3 hover:border-primary/30 transition-all cursor-pointer bg-white/[0.03] group/upload shadow-inner"
                                    >
                                        <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover/upload:scale-110 transition-transform">
                                            <Plus className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="text-center w-full">
                                            {briefFiles.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-2 w-full">
                                                    {briefFiles.map((file, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 group/file">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                                    <Download className="h-4 w-4" />
                                                                </div>
                                                                <p className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[200px]">
                                                                    {file.name}
                                                                </p>
                                                            </div>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setBriefFiles(prev => prev.filter((_, i) => i !== idx));
                                                                }}
                                                                className="h-8 w-8 rounded-lg hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover/file:opacity-100 transition-opacity"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <p className="text-[9px] text-primary/70 font-black mt-2 uppercase tracking-widest">({briefFiles.length}) PROTOCOL DISK FILES READY</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-muted-foreground group-hover/upload:text-white uppercase tracking-[0.2em] transition-colors">
                                                        Attach Project Briefs
                                                    </span>
                                                    <p className="text-[8px] text-muted-foreground/40 font-bold uppercase tracking-tighter">Support for multiple PDF assets</p>
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <DialogFooter className="pt-4 border-t border-white/[0.05] gap-4">
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setIsAssigning(false)}
                                    className="flex-1 h-16 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-muted-foreground"
                                >
                                    Abort
                                </Button>
                                <Button 
                                    onClick={handleCreateProject}
                                    disabled={isUpdating === "creating"}
                                    className="flex-[2] h-16 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                                >
                                    {isUpdating === "creating" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Deploy Project Node"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
                                <Card className="glass-card rounded-[3rem] overflow-hidden group/project hover:border-primary/30 transition-all duration-700 shadow-2xl relative">
                                    {/* Glass Highlight */}
                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                    
                                    <div className="p-10 flex flex-col lg:flex-row lg:items-center gap-10">
                                        {/* Status & Icon */}
                                        <div className="flex items-center gap-8 flex-1">
                                            <div className="h-20 w-20 rounded-[2rem] bg-white/[0.03] flex items-center justify-center border border-white/[0.05] group-hover/project:border-primary/50 group-hover/project:bg-primary/10 transition-all duration-700 shadow-inner group-hover/project:rotate-3">
                                                <Briefcase className="h-10 w-10 text-muted-foreground/50 group-hover/project:text-primary group-hover/project:scale-110 transition-all" />
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-4">
                                                        <h3 className="text-2xl font-black italic tracking-tighter text-white group-hover/project:text-primary transition-colors">{project.title}</h3>
                                                        <AnimatePresence mode="wait">
                                                            {inlineEditingStatus === project.id ? (
                                                                <motion.div
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    exit={{ opacity: 0, x: 10 }}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <Select 
                                                                        value={pendingValue || project.status} 
                                                                        onValueChange={(val) => setPendingValue(val)}
                                                                    >
                                                                        <SelectTrigger className="h-8 w-[180px] bg-white/10 border-white/10 text-[10px] uppercase font-black tracking-widest rounded-full">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="bg-[#071333] border-white/10 text-white">
                                                                            <SelectItem value="new">Awaiting Assignment</SelectItem>
                                                                            <SelectItem value="pending">Field Synchronization</SelectItem>
                                                                            <SelectItem value="submitted">Strategic Review</SelectItem>
                                                                            <SelectItem value="approved">Operation Concluded</SelectItem>
                                                                            <SelectItem value="requires-edits">Revisions Requested</SelectItem>
                                                                            <SelectItem value="rejected">Operation Terminated</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="icon" 
                                                                            onClick={() => {
                                                                                handleProjectStatusChange(project.id, pendingValue, project.title);
                                                                                setInlineEditingStatus(null);
                                                                                setPendingValue(null);
                                                                            }}
                                                                            className="h-8 w-8 rounded-full hover:bg-green-500/20 text-green-500"
                                                                        >
                                                                            <Check className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="icon" 
                                                                            onClick={() => {
                                                                                setInlineEditingStatus(null);
                                                                                setPendingValue(null);
                                                                            }}
                                                                            className="h-8 w-8 rounded-full hover:bg-red-500/20 text-red-500"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </motion.div>
                                                            ) : (
                                                                <motion.div
                                                                    key={project.status}
                                                                    initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
                                                                    animate={{ 
                                                                        opacity: 1, 
                                                                        scale: [1.2, 1],
                                                                        rotate: 0,
                                                                        boxShadow: project.status === 'approved' ? [
                                                                            "0 0 0px rgba(34, 197, 94, 0)",
                                                                            "0 0 20px rgba(34, 197, 94, 0.4)",
                                                                            "0 0 0px rgba(34, 197, 94, 0)"
                                                                        ] : "none"
                                                                    }}
                                                                    exit={{ opacity: 0, scale: 0.5, rotate: 5 }}
                                                                    transition={{ 
                                                                        duration: 0.3,
                                                                        type: "spring",
                                                                        stiffness: 400,
                                                                        damping: 15
                                                                    }}
                                                                    onClick={() => {
                                                                        setInlineEditingStatus(project.id);
                                                                        setPendingValue(project.status);
                                                                    }}
                                                                    className="cursor-pointer hover:scale-105 transition-transform"
                                                                >
                                                                    {getStatusBadge(project.status)}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                {project.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                                                )}
                                                {project.status === 'rejected' && project.declineReason && (
                                                    <div className="mt-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                                                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Reason for Rejection:</p>
                                                        <p className="text-[10px] text-white/70 italic">"{project.declineReason}"</p>
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-1">
                                                    <AnimatePresence mode="wait">
                                                        {inlineEditingDeadline === project.id ? (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
                                                                className="flex items-center gap-2 bg-white/5 p-1 px-2 rounded-xl border border-white/10"
                                                            >
                                                                <Input 
                                                                    type="date" 
                                                                    value={pendingValue || (project.submissionDeadline ? safeFormatDate(project.submissionDeadline, 'yyyy-MM-dd', '') : '')}
                                                                    onChange={(e) => setPendingValue(e.target.value)}
                                                                    className="h-8 bg-transparent border-none text-[10px] font-black uppercase tracking-widest w-[130px] p-0 focus-visible:ring-0 text-white [color-scheme:dark]"
                                                                />
                                                                <div className="flex items-center gap-1">
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        onClick={() => {
                                                                            handleDeadlineChange(project.id, pendingValue);
                                                                            setInlineEditingDeadline(null);
                                                                            setPendingValue(null);
                                                                        }}
                                                                        className="h-6 w-6 rounded-lg hover:bg-green-500/20 text-green-500"
                                                                    >
                                                                        <Check className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        onClick={() => {
                                                                            setInlineEditingDeadline(null);
                                                                            setPendingValue(null);
                                                                        }}
                                                                        className="h-6 w-6 rounded-lg hover:bg-red-500/20 text-red-500"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.span 
                                                                onClick={() => {
                                                                    setInlineEditingDeadline(project.id);
                                                                    setPendingValue(project.submissionDeadline ? safeFormatDate(project.submissionDeadline, 'yyyy-MM-dd', '') : '');
                                                                }}
                                                                className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors group/deadline"
                                                            >
                                                                <Calendar className="h-3 w-3 group-hover/deadline:text-primary transition-colors" /> 
                                                                Due {safeFormatDate(project.submissionDeadline, 'MMM dd')}
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                    <span className="h-1 w-1 rounded-full bg-white/10" />
                                                    <span className="text-primary/70 font-mono text-[10px] uppercase tracking-widest">Op-ID: {project.id?.slice(-6) || '---'}</span>
                                                </div>

                                                {/* AI Audit Access */}
                                                {(project.status === 'submitted' || project.status === 'requires-edits') && (
                                                    <div className="mt-6">
                                                        <ProjectAIAnalysis 
                                                            project={project}
                                                            onRecommendation={(rec) => handleProjectStatusChange(project.id, rec, project.title)}
                                                        />
                                                    </div>
                                                )}
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
                                                <p className="text-2xl font-black text-white">£{Number(project.paymentAmount || 0).toLocaleString()}</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button 
                                                                onClick={() => setEditingProject({
                                                                    ...project,
                                                                    deadline: project.submissionDeadline ? safeFormatDate(project.submissionDeadline, 'yyyy-MM-dd', '') : ''
                                                                })}
                                                                variant="outline" 
                                                                size="icon" 
                                                                className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white group/btn"
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-black border-white/10 text-white font-bold p-3 rounded-xl shadow-2xl">
                                                            View/Edit Brief
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

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

                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button 
                                                                onClick={() => setProjectToDelete(project)}
                                                                variant="outline" 
                                                                size="icon" 
                                                                className="h-12 w-12 rounded-2xl border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-400 group/btn"
                                                            >
                                                                <X className="h-5 w-5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-red-600 border-red-500 text-white font-bold p-3 rounded-xl shadow-2xl">
                                                            Retire Operation
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                {(project.status === 'submitted' || project.status === 'requires-edits') && (
                                                            <div className="flex flex-col gap-3 ml-4">
                                                                <div className="flex items-center gap-2">
                                                                    {project.attachments && project.attachments.length > 0 ? (
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {project.attachments.map((file: any, idx: number) => (
                                                                                <TooltipProvider key={idx}>
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger asChild>
                                                                                            <Button 
                                                                                                asChild
                                                                                                variant="outline"
                                                                                                className="h-10 px-4 rounded-xl border-primary/30 text-primary hover:bg-primary/10 transition-all flex items-center gap-2"
                                                                                            >
                                                                                                <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                                                                                                    <Download className="h-4 w-4" />
                                                                                                    <span className="text-[10px] font-bold truncate max-w-[80px]">{file.name}</span>
                                                                                                </a>
                                                                                            </Button>
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent className="bg-primary text-black font-bold p-2 text-[10px] rounded-lg">
                                                                                            Download {file.name} ({file.size})
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                </TooltipProvider>
                                                                            ))}
                                                                        </div>
                                                                    ) : project.submissionUrl ? (
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Button 
                                                                                        asChild
                                                                                        variant="outline"
                                                                                        className="h-12 w-12 rounded-2xl border-primary/30 text-primary hover:bg-primary/10 transition-all p-0"
                                                                                    >
                                                                                        <a href={project.submissionUrl} download target="_blank" rel="noopener noreferrer">
                                                                                            <Download className="h-5 w-5" />
                                                                                        </a>
                                                                                    </Button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent className="bg-primary text-black font-bold p-2 text-[10px] rounded-lg">
                                                                                    Download Submission
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    ) : (
                                                                        <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground uppercase tracking-widest font-bold">No Data Files Found</Badge>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    {project.status === 'submitted' && (
                                                                        <Button 
                                                                            onClick={() => handleProjectStatusChange(project.id, 'approved', project.title)}
                                                                            disabled={isUpdating === project.id}
                                                                            className="h-12 px-8 rounded-2xl bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-green-500/20 active:scale-95 transition-all flex items-center gap-2"
                                                                        >
                                                                            {isUpdating === project.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                                            Deploy Approval
                                                                        </Button>
                                                                    )}

                                                                    <Dialog open={decliningProject?.id === project.id} onOpenChange={(open) => !open && setDecliningProject(null)}>
                                                                        <DialogTrigger asChild>
                                                                            <Button 
                                                                                onClick={() => setDecliningProject(project)}
                                                                                variant="outline"
                                                                                className="h-12 px-6 rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold"
                                                                            >
                                                                               <X className="h-4 w-4 mr-2" /> Reject
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent className="bg-[#051129] border-white/[0.05] text-white rounded-[3rem] p-10 max-w-lg shadow-2xl backdrop-blur-3xl">
                                                                        <DialogHeader>
                                                                            <DialogTitle className="text-3xl font-black italic tracking-tighter text-red-500">Abort <span className="text-white">Submission</span></DialogTitle>
                                                                            <DialogDescription className="text-muted-foreground/60 text-xs font-bold leading-relaxed pt-2">
                                                                                PROVIDE MISSION RATIONALE FOR DE-PRIORITIZING THIS BRIEFING. FORMAL REJECTION PROTOCOL REQUIRED.
                                                                            </DialogDescription>
                                                                        </DialogHeader>
                                                                        <div className="space-y-6 py-8">
                                                                            <div className="space-y-3">
                                                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/70 mb-1 block">Rejection Rationale</Label>
                                                                                <textarea 
                                                                                    className="w-full min-h-[160px] bg-white/[0.03] border border-white/[0.1] rounded-2xl p-5 text-xs font-bold text-white focus:border-red-500/40 outline-none transition-all placeholder:text-muted-foreground/20 leading-relaxed shadow-inner"
                                                                                    placeholder="Outline technical deficiencies or operational mismatches..."
                                                                                    value={declineReason}
                                                                                    onChange={(e) => setDeclineReason(e.target.value)}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <DialogFooter className="gap-3">
                                                                            <Button variant="ghost" onClick={() => setDecliningProject(null)} className="flex-1 h-16 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-white/5">
                                                                                Cancel
                                                                            </Button>
                                                                            <Button 
                                                                                onClick={handleDeclineSubmit}
                                                                                disabled={isUpdating === (decliningProject?.id || "") || !declineReason.trim()}
                                                                                className="flex-[2] h-16 rounded-2xl bg-red-500 hover:bg-red-400 text-black font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-red-500/20 active:scale-95 transition-all"
                                                                            >
                                                                                {isUpdating === (decliningProject?.id || "") ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Rejection"}
                                                                            </Button>
                                                                        </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>

                                                        <Button 
                                                            variant="outline"
                                                            onClick={() => handleProjectStatusChange(project.id, 'requires-edits', project.title)}
                                                            className="h-12 w-12 rounded-2xl border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 transition-all p-0"
                                                        >
                                                            <Eye className="h-5 w-5 rotate-45" /> {/* Just a revision icon or use something else */}
                                                        </Button>
                                                    </div>
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

            {/* Project Editing Dialog */}
            <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
                <DialogContent className="bg-[#050f26] border-white/10 text-white rounded-[2.5rem] p-8 max-w-2xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic">Modify <span className="text-primary">Operation</span></DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Update mission parameters for Op-ID: {editingProject?.id?.slice(-6)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6 pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mission Title</Label>
                                    <Input 
                                        value={editingProject?.title || ""}
                                        onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                                        className="bg-white/5 border-white/5 rounded-xl h-12 focus:border-primary/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Brief Description</Label>
                                    <textarea 
                                        value={editingProject?.description || ""}
                                        onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                                        className="w-full min-h-[120px] bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-primary/50 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Budget (£)</Label>
                                        <Input 
                                            type="number" 
                                            value={editingProject?.paymentAmount || ""}
                                            onChange={(e) => setEditingProject({...editingProject, paymentAmount: e.target.value})}
                                            className="bg-white/5 border-white/5 rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deadline</Label>
                                        <Input 
                                            type="date" 
                                            value={editingProject?.deadline || ""}
                                            onChange={(e) => setEditingProject({...editingProject, deadline: e.target.value})}
                                            className="bg-white/5 border-white/5 rounded-xl h-12"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational Status</Label>
                                    <Select 
                                        value={editingProject?.status} 
                                        onValueChange={(val) => setEditingProject({...editingProject, status: val})}
                                    >
                                        <SelectTrigger className="h-12 bg-white/5 border-white/5 rounded-xl text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#071333] border-white/10 text-white">
                                            <SelectItem value="new">Awaiting Assignment</SelectItem>
                                            <SelectItem value="pending">Field Synchronization</SelectItem>
                                            <SelectItem value="submitted">Strategic Review</SelectItem>
                                            <SelectItem value="approved">Operation Concluded</SelectItem>
                                            <SelectItem value="requires-edits">Revisions Requested</SelectItem>
                                            <SelectItem value="rejected">Operation Terminated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Project Brief URL</Label>
                                    <Input 
                                        value={editingProject?.briefUrl || ""}
                                        onChange={(e) => setEditingProject({...editingProject, briefUrl: e.target.value})}
                                        placeholder="URL to project brief..."
                                        className="bg-white/5 border-white/5 rounded-xl h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Submission URL</Label>
                                    <Input 
                                        value={editingProject?.submissionUrl || ""}
                                        onChange={(e) => setEditingProject({...editingProject, submissionUrl: e.target.value})}
                                        placeholder="URL to user submission..."
                                        className="bg-white/5 border-white/5 rounded-xl h-12"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => setEditingProject(null)}
                            className="h-12 px-6 rounded-xl border-white/5 bg-transparent hover:bg-white/5"
                        >
                            Abort
                        </Button>
                        <Button 
                            onClick={handleUpdateProject}
                            disabled={isUpdating === editingProject?.id}
                            className="h-12 px-8 rounded-xl bg-primary text-black font-black flex-1"
                        >
                            {isUpdating === editingProject?.id ? <Loader2 className="h-5 w-5 animate-spin" /> : "Commit Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Project Retirement Confirmation Dialog */}
            <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
                <DialogContent className="bg-[#050f26] border-white/10 text-white rounded-[2.5rem] p-8 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic flex items-center gap-2">
                             <X className="h-6 w-6 text-red-500" />
                             Retire <span className="text-red-500">Operation</span>
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground pt-2">
                            You are purging operation <span className="text-white font-bold">"{projectToDelete?.title}"</span> from the registry. This action is permanent and will remove all associated submission data and brief manifests.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                            <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Critical Purge Protocol</p>
                            <p className="text-[11px] text-white/70">Associated personnel will be notified of the mission cancellation. All synchronization links will be destroyed.</p>
                        </div>
                    </div>
                    <DialogFooter className="flex gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => setProjectToDelete(null)}
                            className="flex-1 h-12 rounded-xl border-white/10 bg-white/5 text-white"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleDeleteProject}
                            className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black"
                        >
                            {isUpdating === projectToDelete?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Purge Registry"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* AI Analysis Dialog */}
            <Dialog open={!!aiAnalysisResult} onOpenChange={(open) => !open && setAiAnalysisResult(null)}>
                <DialogContent className="bg-[#050f26] border-white/10 text-white rounded-[2.5rem] p-8 max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic flex items-center gap-2">
                             <BrainCircuit className="h-6 w-6 text-primary" />
                             Neural <span className="text-primary">Analysis</span> Report
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground pt-2">
                            Auditing mission brief against current submission telemetry.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles className="h-12 w-12 text-primary" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Intelligence Summary</h4>
                            <p className="text-sm leading-relaxed text-white/90 italic">
                                "{aiAnalysisResult?.analysis}"
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">System Recommendation</p>
                                <p className={cn(
                                    "text-lg font-black uppercase tracking-tighter",
                                    aiAnalysisResult?.recommendation === 'approve' ? 'text-green-500' : 
                                    aiAnalysisResult?.recommendation === 'reject' ? 'text-red-500' : 'text-yellow-500'
                                )}>
                                    {aiAnalysisResult?.recommendation?.replace('_', ' ')}
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Confidence Rating</p>
                                <p className="text-lg font-black text-white italic">
                                    {(aiAnalysisResult?.confidence * 100).toFixed(0)}%
                                </p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            onClick={() => setAiAnalysisResult(null)}
                            className="h-12 w-full rounded-xl bg-primary text-black font-black"
                        >
                            Sync with Registry
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


