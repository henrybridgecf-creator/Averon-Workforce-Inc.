'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
    Settings, 
    Shield, 
    Bell, 
    Users, 
    Database, 
    Server, 
    Zap, 
    Lock, 
    Globe, 
    Palette, 
    Activity,
    Save,
    RefreshCw
} from "lucide-react";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: "Registry Updated",
                description: "Global system parameters have been synchronized successfully.",
            });
        }, 800);
    };

    const sections = [
        {
            title: "Security & Governance",
            icon: Shield,
            items: [
                { id: "e2e", label: "Global E2E Encryption", desc: "Mandate encryption on all message clusters.", default: true },
                { id: "auth", label: "Multi-Factor Authentication", desc: "Require identity verification for all personnel.", default: true },
                { id: "p-mask", label: "PII Masking", desc: "Hide personal identifiers from staff-level accounts.", default: false },
            ]
        },
        {
            title: "Platform Dynamics",
            icon: Zap,
            items: [
                { id: "withdrawals", label: "Automatic Withdrawals", desc: "Process payments instantly upon approval.", default: false },
                { id: "recruit", label: "Open Recruitment", desc: "Allow new applicants without invitation keys.", default: true },
                { id: "ai", label: "Automated Oversight", desc: "Use AI to scan submissions for plagiarism.", default: true },
            ]
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white">Central Config</h1>
                    <p className="text-muted-foreground mt-1">Global workforce parameters and platform core settings.</p>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                    {isSaving ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                    Synchronize Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    {sections.map((section, idx) => (
                        <Card key={idx} className="bg-[#050f26] border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden">
                            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <section.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-white">{section.title}</CardTitle>
                                        <CardDescription className="text-muted-foreground">Adjust system sensitivity and behavior.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                {section.items.map((item, i) => (
                                    <div key={item.id} className="flex items-center justify-between group">
                                        <div className="space-y-1">
                                            <Label htmlFor={item.id} className="text-base font-bold text-white cursor-pointer group-hover:text-primary transition-colors">{item.label}</Label>
                                            <p className="text-xs text-muted-foreground max-w-sm">{item.desc}</p>
                                        </div>
                                        <Switch id={item.id} defaultChecked={item.default} className="data-[state=checked]:bg-primary" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}

                    <Card className="bg-[#050f26] border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                <Database className="h-6 w-6 text-white/50" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Registry Maintenance</h3>
                                <p className="text-muted-foreground text-sm">Purge caches and optimize global data clusters.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                             <Button variant="outline" className="border-white/10 rounded-xl font-bold h-12 px-6">Empty Cache Cluster</Button>
                             <Button variant="outline" className="border-white/10 rounded-xl font-bold h-12 px-6">Regenerate Auth Keys</Button>
                             <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl font-bold h-12 px-6">Purge Transient Data</Button>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card className="bg-[#050f26] border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden p-8 border-t-primary/20 border-t-4">
                         <div className="flex items-center gap-3 mb-6">
                            <Server className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-bold text-white">System Vitality</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                                    <span className="text-muted-foreground">Registry Load</span>
                                    <span className="text-primary">24%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "24%" }} className="h-full bg-primary" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                                    <span className="text-muted-foreground">Encryption Buffer</span>
                                    <span className="text-primary">89%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "89%" }} className="h-full bg-primary" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-muted-foreground">Global Version</span>
                                <span className="text-white">v9.2.4-STABLE</span>
                            </div>
                             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-muted-foreground">Instance Origin</span>
                                <span className="text-white">UK-WEST-01</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#050f26] border-white/5 rounded-[2.5rem] shadow-xl p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Lock className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-bold text-white">Admin Credentials</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Personnel Email</Label>
                                <Input disabled value="ryan.reynolds@averpay.io" className="h-12 bg-white/5 border-white/5 rounded-xl text-white opacity-50" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Password</Label>
                                <Input type="password" value="********" className="h-12 bg-white/5 border-white/5 rounded-xl text-white" />
                            </div>
                            <Button className="w-full h-12 rounded-xl bg-white text-black font-bold">Update Key</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

