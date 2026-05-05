'use client';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Headset, Megaphone, Send, User, ChevronRight, ShieldCheck, Zap, Lock, Info, Search, Clock, Check } from "lucide-react";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { cn, getInitials } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { initializeUsers, saveData, addNotification } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from "@/hooks/use-toast";

type Section = 'supervisor' | 'payroll' | 'announcements';

const ADMIN_UID = 'mock-user-02';

export default function ChatPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [activeSection, setActiveSection] = useState<Section>('supervisor');
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isAdminTyping, setIsAdminTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        initializeUsers();
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const chatId = user ? [user.uid, ADMIN_UID].sort().join('_') : null;

    // Handle typing state
    const handleTyping = () => {
        if (!chatId || !user) return;
        const typingData = JSON.parse(localStorage.getItem('typingStates') || '{}');
        typingData[chatId] = { ...typingData[chatId], [user.uid]: true };
        localStorage.setItem('typingStates', JSON.stringify(typingData));

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            const currentTyping = JSON.parse(localStorage.getItem('typingStates') || '{}');
            currentTyping[chatId] = { ...currentTyping[chatId], [user.uid]: false };
            localStorage.setItem('typingStates', JSON.stringify(currentTyping));
        }, 3000);
    };

    useEffect(() => {
        if (chatId && activeSection === 'supervisor') {
            const loadData = () => {
                // Messages
                const allMessages = JSON.parse(localStorage.getItem('mockMessages') || '{}');
                const chatMessages = allMessages[chatId] || [];
                
                setMessages(chatMessages);

                // Admin Typing state
                const typingData = JSON.parse(localStorage.getItem('typingStates') || '{}');
                const chatTyping = typingData[chatId] || {};
                setIsAdminTyping(chatTyping[ADMIN_UID] === true);
            };
            loadData();
            
            // Sync across tabs
            const handleStorageChange = (e: StorageEvent) => {
                if (e.key === 'mockMessages' || e.key === 'typingStates') {
                    loadData();
                }
            };
            window.addEventListener('storage', handleStorageChange);
            
            const intervalId = setInterval(loadData, 2000);
            return () => {
                window.removeEventListener('storage', handleStorageChange);
                clearInterval(intervalId);
            };
        }
    }, [chatId, activeSection, user?.uid]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isAdminTyping]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatId || !user) return;

        setIsSending(true);
        // Simulate network delay
        setTimeout(() => {
            const messageData = {
                id: `msg-${Date.now()}`,
                text: newMessage,
                senderId: user.uid,
                timestamp: new Date().toISOString(),
                senderName: user.fullName,
                senderImage: user.profilePhoto,
                status: 'sent'
            };

            const allMessages = JSON.parse(localStorage.getItem('mockMessages') || '{}');
            const currentMessages = allMessages[chatId] || [];
            const updatedMessages = [...currentMessages, messageData];
            allMessages[chatId] = updatedMessages;
            saveData('mockMessages', allMessages);

            // Clear typing status on send
            const typingData = JSON.parse(localStorage.getItem('typingStates') || '{}');
            typingData[chatId] = { ...typingData[chatId], [user.uid]: false };
            localStorage.setItem('typingStates', JSON.stringify(typingData));

            setMessages(updatedMessages);
            setNewMessage('');
            setIsSending(false);
            
            addNotification(ADMIN_UID, {
                type: 'new-message',
                title: `Secure transmission from ${user.fullName}`,
                description: `"${newMessage.slice(0, 50)}..."`,
                link: `/admin/chat?userId=${user.uid}`
            });
        }, 300);
    };

    const filteredMessages = searchTerm.trim() 
        ? messages.filter(m => m.text.toLowerCase().includes(searchTerm.toLowerCase()))
        : messages;

    const handleMarkAsRead = (msgId: string) => {
        if (!chatId) return;
        const allMessages = JSON.parse(localStorage.getItem('mockMessages') || '{}');
        const chatMessages = allMessages[chatId] || [];
        const updatedMessages = chatMessages.map((m: any) => 
            m.id === msgId ? { ...m, status: 'read' } : m
        );
        allMessages[chatId] = updatedMessages;
        saveData('mockMessages', allMessages);
        setMessages(updatedMessages);
        
        toast({
            title: "Transmission Acknowledged",
            description: "Message logged as read in session protocol.",
            className: "bg-[#050f26] border-primary/20 text-white"
        });
    };

    const sidebarItems = [
        { id: 'supervisor' as const, label: 'Operational Hub', desc: 'Direct link to Manager', icon: User },
        { id: 'payroll' as const, label: 'Capital Desk', desc: 'Withdrawal & Tax support', icon: Headset },
        { id: 'announcements' as const, label: 'Platform Broadcast', desc: 'Global synchronization alerts', icon: Megaphone },
    ];

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full bg-[#030a1c] min-h-[calc(100vh-4rem)] p-4 sm:p-8">
                <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Navigation Dashboard */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="p-2 space-y-2">
                             <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4 mb-4">Secure Channels</h2>
                             <div className="space-y-3">
                                {sidebarItems.map((item) => (
                                    <motion.button
                                        key={item.id}
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setActiveSection(item.id)}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-300 relative border overflow-hidden",
                                            activeSection === item.id 
                                                ? "bg-primary border-primary shadow-[0_20px_50px_rgba(var(--primary-rgb),0.2)]" 
                                                : "bg-[#050f26] border-white/5 text-muted-foreground hover:border-primary/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                                            activeSection === item.id ? "bg-white/20 text-white" : "bg-white/5 text-primary"
                                        )}>
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className={cn("font-bold text-base leading-none mb-1", activeSection === item.id ? "text-white" : "text-white/80")}>{item.label}</p>
                                            <p className={cn("text-[10px] font-medium uppercase tracking-wider", activeSection === item.id ? "text-white/60" : "text-muted-foreground")}>{item.desc}</p>
                                        </div>
                                        <ChevronRight className={cn("h-4 w-4", activeSection === item.id ? "text-white/40" : "text-white/10")} />
                                    </motion.button>
                                ))}
                             </div>
                        </div>

                        <Card className="bg-[#050f26] border-white/5 rounded-[2.5rem] p-8 shadow-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                    <ShieldCheck className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white leading-none mb-1">Encrypted Line</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">End-to-End Active</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed italic">"All communications within this hub are subject to platform surveillance for quality assurance and fraud prevention."</p>
                        </Card>
                    </div>

                    {/* Chat Environment */}
                    <div className="lg:col-span-8">
                         <Card className="bg-[#050f26] border-white/5 rounded-[3rem] shadow-2xl flex flex-col h-[700px] overflow-hidden relative border-t-primary/20 border-t-4">
                             <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                 <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                         {activeSection === 'supervisor' && <User className="h-7 w-7 text-primary" />}
                                         {activeSection === 'payroll' && <Headset className="h-7 w-7 text-primary" />}
                                         {activeSection === 'announcements' && <Megaphone className="h-7 w-7 text-primary" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white capitalize">{activeSection.replace('-', ' ')} Hub</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Protocol Active</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                        <Input 
                                            placeholder="Search messages..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-9 w-48 pl-9 bg-white/5 border-white/10 rounded-full text-xs"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-primary/50 text-[10px] font-bold uppercase tracking-widest">
                                        <Lock className="h-3 w-3" />
                                        Secure Session
                                    </div>
                                </div>
                             </div>

                             {/* Messages Area */}
                             <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                                 {activeSection === 'announcements' ? (
                                    <div className="space-y-6">
                                        <div className="flex gap-5">
                                            <Avatar className="h-10 w-10 border border-white/10 ring-4 ring-primary/5">
                                                <AvatarImage src="/za.svg" />
                                                <AvatarFallback>AV</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-3 flex-1">
                                                <div className="bg-white/5 p-6 rounded-[2.5rem] rounded-tl-none border border-white/5 shadow-inner">
                                                     <p className="text-white/90 leading-relaxed font-medium">
                                                        📣 Welcome to the new AverPay Operational Portal v4.0. We've enhanced the security protocols and updated the user interface for better mission synchronization.
                                                     </p>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground px-2 font-black uppercase tracking-widest">Broadcast Control • 2 hours ago</p>
                                            </div>
                                        </div>
                                    </div>
                                 ) : activeSection === 'supervisor' ? (
                                    filteredMessages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                                            <div className="h-24 w-24 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                                <Zap className="h-10 w-10 text-primary" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black text-white">{searchTerm ? "No Intelligences Found" : "Registry Synchronized"}</h3>
                                                <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
                                                    {searchTerm ? "Adjust your search parameters to find the encrypted transmission." : "Your message history is encrypted. Send a transmission to initialize the live data link with your supervisor."}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {filteredMessages.map((msg) => {
                                                const isMe = msg.senderId === user?.uid;
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        key={msg.id} 
                                                        className={cn("flex gap-4", isMe ? "justify-end" : "justify-start")}
                                                    >
                                                        {!isMe && (
                                                            <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                                                                <AvatarImage src={msg.senderImage} />
                                                                <AvatarFallback className="bg-primary/20 text-primary">AD</AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                        <div className={cn("space-y-2 max-w-[80%]", isMe && "text-right")}>
                                                            <div className={cn(
                                                                "p-5 rounded-[2.5rem] shadow-2xl text-base leading-relaxed relative group",
                                                                isMe 
                                                                    ? "bg-white text-black font-semibold rounded-tr-none" 
                                                                    : "bg-white/5 text-white/90 rounded-tl-none border border-white/10"
                                                            )}>
                                                                {msg.text}
                                                                {!isMe && msg.status !== 'read' && (
                                                                    <Button 
                                                                        onClick={() => handleMarkAsRead(msg.id)}
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        className="absolute -right-12 top-0 h-10 w-10 p-0 rounded-full bg-primary/10 border border-primary/20 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-black"
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <div className={cn("flex items-center gap-2 px-3", isMe ? "justify-end" : "justify-start")}>
                                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.1em]">
                                                                    {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                                                                </p>
                                                                {isMe && (
                                                                    <div className="flex items-center">
                                                                         <Check className="h-3 w-3 text-primary" />
                                                                         {msg.status === 'read' && <Check className="h-3 w-3 text-primary -ml-1.5" />}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {isMe && (
                                                            <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                                                                <AvatarImage src={user?.profilePhoto} />
                                                                <AvatarFallback className="bg-primary/20 text-primary">{getInitials(user?.fullName)}</AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                            {isAdminTyping && (
                                                <div className="flex gap-4 justify-start">
                                                    <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                                                        <AvatarFallback className="bg-primary/20 text-primary">AD</AvatarFallback>
                                                    </Avatar>
                                                    <div className="bg-white/5 p-4 rounded-[1.5rem] rounded-tl-none border border-white/10 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )
                                ) : (
                                     <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                                        <div className="h-32 w-32 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]">
                                            <Headset className="h-16 w-16 text-primary" />
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-3xl font-black text-white">Capital Resource Desk</h3>
                                            <p className="text-muted-foreground max-w-sm mx-auto text-lg leading-relaxed">
                                                Live ticketing system for payroll, taxes, and capital allocation protocols.
                                            </p>
                                        </div>
                                        <Button 
                                            size="lg" 
                                            className="rounded-[2rem] h-16 px-12 font-black text-lg bg-primary hover:bg-primary/90 text-black shadow-2xl shadow-primary/20 transition-all active:scale-95" 
                                            onClick={() => window.open('https://mail.google.com/mail/?view=cm&fs=1&to=averpay-p@hotmail.com', '_blank')}
                                        >
                                            Open Secure Comms
                                        </Button>
                                    </div>
                                 )}
                                 <div ref={messagesEndRef} />
                             </div>

                             {/* Input Area */}
                             {activeSection === 'supervisor' && (
                                <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                                    <form onSubmit={handleSendMessage} className="flex gap-4">
                                        <Input
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value);
                                                handleTyping();
                                            }}
                                            placeholder="Transmit message to mission control..."
                                            className="h-16 bg-white/5 border-white/5 rounded-[2rem] px-8 text-white text-lg placeholder:text-muted-foreground focus:border-primary/50"
                                        />
                                        <Button type="submit" className="h-16 w-16 rounded-[2rem] bg-primary hover:bg-primary/90 text-black shadow-2xl shadow-primary/20 shrink-0 active:scale-95 transition-all" disabled={isSending || !newMessage.trim()}>
                                            <Send className="h-6 w-6" />
                                        </Button>
                                    </form>
                                    <div className="mt-4 flex items-center justify-center gap-2">
                                        <Info className="h-3 w-3 text-muted-foreground" />
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Standard synchronization frequency: 2000ms</p>
                                    </div>
                                </div>
                             )}
                         </Card>
                    </div>
                </div>
                
                <div className="mt-12 mb-8 flex flex-col items-center gap-4 py-8 border-t border-white/5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">AverPay Global Synchronization Terminal v4.2</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
