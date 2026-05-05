
'use client';
import React, { useState, useEffect, use, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { updateUserData, addProject, addNotification, initializeUsers, findUserById, addActivityLog } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { getInitials } from '@/lib/utils';
import { ArrowLeft, Bell, FileUp, Loader2, PoundSterling, Save, ShieldCheck, Mail, MapPin, ExternalLink, CheckCircle2, XCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { triggerEmailNotification, emailTemplates } from "@/lib/notifications";
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminUserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <AdminUserProfileContent userId={userId} />
        </Suspense>
    );
}

function AdminUserProfileContent({ userId }: { userId: string }) {
    const router = useRouter();
    const { toast } = useToast();
    
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('');
    const [totalBalance, setTotalBalance] = useState('');
    const [status, setStatus] = useState('');
    const [phone, setPhone] = useState('');
    const [personalEmail, setPersonalEmail] = useState('');
    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        accountNumber: '',
        accountHolder: ''
    });
    const [sendNotification, setSendNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [projectFile, setProjectFile] = useState<File | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    useEffect(() => {
        initializeUsers();
        const userData = findUserById(userId as string);
        if (userData) {
            setUserProfile(userData);
            setFullName(userData.fullName || '');
            setRole(userData.role || 'Freelancer');
            setTotalBalance((userData.totalBalance || 0).toString());
            setStatus(userData.status || 'pending');
            setPhone(userData.phone || '');
            setPersonalEmail(userData.personalEmail || '');
            setBankDetails({
                bankName: userData.bankDetails?.bankName || '',
                accountNumber: userData.bankDetails?.accountNumber || '',
                accountHolder: userData.bankDetails?.accountHolder || ''
            });
        }
        setIsLoading(false);
    }, [userId]);
    
    const handleSaveChanges = () => {
        // If status is suspended, show confirmation first
        if (status === 'suspended' && userProfile?.status !== 'suspended' && !showConfirmDialog) {
            setShowConfirmDialog(true);
            return;
        }

        setIsSaving(true);
        setShowConfirmDialog(false);
        
        const updatedData = {
            fullName,
            role,
            totalBalance: isNaN(parseFloat(totalBalance)) ? 0 : parseFloat(totalBalance),
            status,
            phone,
            personalEmail,
            bankDetails
        };

        const result = updateUserData(userId as string, updatedData);

        if (result) {
            setUserProfile({ ...userProfile, ...result }); 
            
            addActivityLog({
                type: 'profile_update',
                user: 'Admin',
                target: fullName,
                description: `Updated profile details for ${fullName}`
            });

            if (sendNotification) {
                 addNotification(userId as string, {
                    type: 'platform-announcement',
                    title: 'Account Update',
                    description: notificationMessage || `Your profile has been synchronized by the administration.`,
                 });
            }
            
            toast({
                title: "Protocol Success",
                description: `Records for ${fullName} have been encrypted and saved.`,
            });
            
            setSendNotification(false);
            setNotificationMessage('');
        } else {
             toast({
                variant: 'destructive',
                title: "Update Failed",
                description: "System error: could not write to user repository.",
            });
        }
        setIsSaving(false);
    };

    const handleApproveKYC = (type: 'id' | 'address') => {
        toast({
            title: "Verification Approved",
            description: `${type === 'id' ? 'Identity ID' : 'Proof of Address'} has been verified for ${userProfile.fullName}.`,
        });
        
        addNotification(userId as string, {
            type: 'security',
            title: 'Verification Success',
            description: `Your ${type === 'id' ? 'ID' : 'Address'} document has been approved.`
        });
    };

    const handleAssignProject = async () => {
        if (!projectFile) {
            toast({ variant: 'destructive', title: 'Buffer Empty', description: 'Please select a project brief file for upload.' });
            return;
        }

        setIsAssigning(true);
        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;

                const newProject = {
                    id: `proj-${Date.now()}`,
                    title: projectFile.name.replace(/\.(pdf|zip|docx?)$/i, '').replace(/_/g, ' '),
                    assignedTo: userId,
                    status: 'new',
                    paymentAmount: 0, 
                    submissionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
                    briefUrl: dataUrl,
                    submissionUrl: null,
                    submittedAt: null,
                    reviewNote: null,
                };

                addProject(newProject);
                addNotification(userId as string, {
                    type: 'new-project',
                    title: 'Strategic Mission Assigned',
                    description: `New operation "${newProject.title}" is now available in your terminal.`,
                    link: '/dashboard/projects?status=new'
                });

                // Trigger Assignment Email
                if (userProfile.email) {
                    triggerEmailNotification(
                        userProfile.email,
                        "Strategic Mission Assigned",
                        `<div style="font-family: sans-serif; padding: 20px;">
                            <h1 style="color: #2563eb;">New Mission Assigned</h1>
                            <p>Hello ${userProfile.fullName},</p>
                            <p>A new strategic operation <strong>"${newProject.title}"</strong> has been assigned to your terminal.</p>
                            <p>Please log in to your dashboard to review the brief and start the mission.</p>
                            <a href="https://averon-workforce.io/dashboard/projects" style="background: #2563eb; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 20px;">View Project</a>
                         </div>`
                    );
                }

                addActivityLog({
                    type: 'submission',
                    user: 'Admin',
                    target: userProfile.fullName,
                    project: newProject.title
                });

                toast({
                    title: 'Mission Dispatched',
                    description: `Successfully assigned "${newProject.title}" to ${userProfile.fullName}.`
                });
                setProjectFile(null);
                const fileInput = document.getElementById('project-file') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            };
            reader.readAsDataURL(projectFile);

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Dispatch Failed",
                description: "Critical error during file upload protocol.",
            });
        } finally {
            setIsAssigning(false);
        }
    };
    
    if (isLoading) return <LoadingSpinner />;
    if (!userProfile) return <div className="p-8 text-center text-white font-bold">User Not Found in Registry.</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-white/10 hover:bg-white/5 bg-transparent">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black text-white">Profile Oversight</h1>
                    <p className="text-muted-foreground text-sm">Managing records for <span className="text-primary font-mono">{userProfile.averpayId}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Profile & KYC */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-[#050f26] border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <CardHeader className="items-center text-center pb-2 pt-10">
                            <div className="relative mb-6">
                                <div className="absolute -inset-2 bg-primary rounded-full blur opacity-20" />
                                <Avatar className="h-32 w-32 border-4 border-[#050f26] relative">
                                    <AvatarImage src={userProfile.profilePhoto} />
                                    <AvatarFallback className="bg-primary/20 text-primary text-3xl">{getInitials(userProfile.fullName)}</AvatarFallback>
                                </Avatar>
                            </div>
                            <CardTitle className="text-2xl font-black text-white">{userProfile.fullName}</CardTitle>
                            <Badge variant="outline" className="mt-2 border-primary/20 bg-primary/5 text-primary tracking-widest uppercase text-[10px]">{userProfile.role}</Badge>
                        </CardHeader>
                        <CardContent className="px-8 pb-10">
                             <div className="space-y-4 mt-6">
                                <div className="flex justify-between items-center py-3 border-b border-white/5">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Global ID</span>
                                    <span className="font-mono text-sm text-white">{userProfile.averpayId}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-white/5">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</span>
                                    <Badge className={userProfile.status === 'active' ? 'bg-green-500/10 text-green-500' : userProfile.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}>
                                        {(userProfile.status || 'UNKNOWN').toUpperCase()}
                                    </Badge>
                                </div>
                                {userProfile.status === 'pending' && (
                                    <div className="py-4 border-b border-white/5">
                                        <Button 
                                            onClick={() => {
                                                setStatus('active');
                                                // Trigger the handleSaveChanges or a specific approval logic
                                                setTimeout(() => {
                                                    const result = updateUserData(userId, { status: 'active' });
                                                    if (result) {
                                                        setUserProfile(prev => ({ ...prev, status: 'active' }));
                                                        addActivityLog({
                                                            type: 'approval',
                                                            user: 'Admin',
                                                            target: fullName,
                                                            description: 'Admiral Approval granted via profile oversight terminal.'
                                                        });
                                                        
                                                        // Trigger Approval Email
                                                        if (userProfile.personalEmail || userProfile.email) {
                                                            triggerEmailNotification(
                                                                userProfile.personalEmail || userProfile.email,
                                                                "Averon Workforce - Clearance Granted",
                                                                emailTemplates.accountApproved(fullName)
                                                            );
                                                        }
                                                        
                                                        toast({ title: 'Personnel Approved', description: `${fullName} is now active in the registry.` });
                                                    }
                                                }, 100);
                                            }}
                                            className="w-full bg-primary text-black font-black rounded-xl h-12 shadow-lg shadow-primary/20"
                                        >
                                            APPROVE IMMEDIATELY
                                        </Button>
                                    </div>
                                )}
                                <div className="flex justify-between items-center py-3 border-b border-white/5">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Light</span>
                                    <Switch 
                                        checked={userProfile.isOnline}
                                        onCheckedChange={(checked) => {
                                            const updated = updateUserData(userId, { isOnline: checked });
                                            if (updated) setUserProfile(updated);
                                            toast({
                                                title: checked ? "Active Light On" : "Active Light Off",
                                                description: `${userProfile.fullName}'s presence is now ${checked ? 'visible' : 'hidden'} to the network.`,
                                            });
                                        }}
                                        className="data-[state=checked]:bg-green-500"
                                    />
                                </div>
                                <div className="flex flex-col gap-1 py-3 border-b border-white/5">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Corporate Terminal</span>
                                    <span className="text-sm text-white flex items-center gap-2"><Mail className="h-3 w-3 text-primary" /> {userProfile.email}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Liquid Assets</span>
                                    <div className="text-right">
                                        <span className="font-black text-xl text-white block">£{Number(userProfile.totalBalance || 0).toLocaleString()}</span>
                                        {userProfile.maintenanceFeeDue > 0 && (
                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">
                                                Maintenance Fee: £{Number(userProfile.maintenanceFeeDue || 0).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#050f26] border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                KYC Registry
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 px-8 pb-8">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Government Identity</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/70 italic">{userProfile.verificationIdUrl || 'id_document_v1.pdf'}</span>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-400" onClick={() => handleApproveKYC('id')}><CheckCircle2 className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400"><XCircle className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Proof of Residency</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/70 italic">{userProfile.proofOfAddressUrl || 'utility_bill_sync.pdf'}</span>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-400" onClick={() => handleApproveKYC('address')}><CheckCircle2 className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400"><XCircle className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Mission Control & Settings */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="bg-[#050f26] border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5 px-8 py-6">
                            <CardTitle className="text-xl font-bold text-white">Record Modification</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Legal Full Name</Label>
                                    <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Operational Role</Label>
                                    <Input value={role} onChange={e => setRole(e.target.value)} className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                                    <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Personal Recovery Email</Label>
                                    <Input value={personalEmail} onChange={e => setPersonalEmail(e.target.value)} className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Wallet Liquidity (£)</Label>
                                    <div className="relative">
                                        <PoundSterling className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                        <Input type="number" value={totalBalance} onChange={e => setTotalBalance(e.target.value)} className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary text-white" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Account Protocol</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0a1633] border-white/10 text-white">
                                            <SelectItem value="active">Active Protocol</SelectItem>
                                            <SelectItem value="pending">Verification Pending</SelectItem>
                                            <SelectItem value="suspended">Locked / Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <CardDescription className="pt-4 !mb-4 !mt-8 text-white font-bold uppercase tracking-widest text-xs">Bank Repository Synchronization</CardDescription>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Bank Name</Label>
                                    <Input 
                                        value={bankDetails.bankName} 
                                        onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})} 
                                        className="h-12 bg-white/5 border-white/10 rounded-xl text-white" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Account Number</Label>
                                    <Input 
                                        value={bankDetails.accountNumber} 
                                        onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})} 
                                        className="h-12 bg-white/5 border-white/10 rounded-xl text-white" 
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Account Holder Name</Label>
                                    <Input 
                                        value={bankDetails.accountHolder} 
                                        onChange={e => setBankDetails({...bankDetails, accountHolder: e.target.value})} 
                                        className="h-12 bg-white/5 border-white/10 rounded-xl text-white" 
                                    />
                                </div>
                            </div>
                            
                            <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="font-bold text-white">Operational Notification</p>
                                        <p className="text-xs text-muted-foreground">Alert the user via secure terminal of these changes.</p>
                                    </div>
                                    <Switch checked={sendNotification} onCheckedChange={setSendNotification} className="data-[state=checked]:bg-primary" />
                                </div>
                                <AnimatePresence>
                                    {sendNotification && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2 overflow-hidden"
                                        >
                                            <Textarea 
                                                placeholder="Enter secure message for the user's newsfeed..."
                                                value={notificationMessage}
                                                onChange={(e) => setNotificationMessage(e.target.value)}
                                                className="bg-white/5 border-white/10 rounded-2xl min-h-[100px] text-white"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                        <CardFooter className="px-8 pb-8 flex justify-end">
                            <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-8 font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95">
                                {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Save className="mr-2 h-5 w-5" />}
                                Sync Dashboard
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Suspension Confirmation Dialog */}
                    <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                        <DialogContent className="bg-[#050f26] border-white/10 text-white rounded-[2.5rem] p-8 max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic flex items-center gap-2">
                                     < ShieldCheck className="h-6 w-6 text-red-500" />
                                     Confirm <span className="text-red-500">Lockdown</span>
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground pt-2">
                                    You are changing this protocol to <span className="text-white font-bold uppercase tracking-widest">Suspended</span>. This will immediately revoke all access rights and freeze liquidity for this agent.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-6">
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Administrative Note</p>
                                    <p className="text-[11px] text-white/70">Personnel will be notified of their status change through the global terminal unless "Operational Notification" is disabled.</p>
                                </div>
                            </div>
                            <DialogFooter className="flex gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowConfirmDialog(false)}
                                    className="flex-1 h-12 rounded-xl border-white/10 bg-white/5 text-white"
                                >
                                    Abort
                                </Button>
                                <Button 
                                    onClick={() => handleSaveChanges()}
                                    className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black"
                                >
                                    Confirm & Sync
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Card className="bg-[#050f26] border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5 px-8 pt-8 pb-6 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold text-white">Mission Dispatch</CardTitle>
                                <CardDescription>Deploy new operation files directly to user.</CardDescription>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <FileUp className="h-5 w-5 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div 
                                className="border-2 border-dashed border-white/10 rounded-3xl p-10 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                                onClick={() => document.getElementById('project-file')?.click()}
                            >
                                <Input 
                                    id="project-file" 
                                    type="file" 
                                    className="hidden" 
                                    onChange={(e) => setProjectFile(e.target.files ? e.target.files[0] : null)} 
                                />
                                <div className="bg-white/5 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <FileUp className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <p className="text-white font-bold text-lg">{projectFile ? projectFile.name : 'Drop Brief File Here'}</p>
                                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-bold">PDF, ZIP, or DOCX up to 10MB</p>
                            </div>
                        </CardContent>
                        <CardFooter className="px-8 pb-8">
                            <Button className="w-full bg-white text-black hover:bg-white/90 rounded-2xl h-14 font-black text-lg" onClick={handleAssignProject} disabled={isAssigning || !projectFile}>
                                {isAssigning ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Send className="mr-2 h-5 w-5"/>}
                                Dispatch Operation
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
