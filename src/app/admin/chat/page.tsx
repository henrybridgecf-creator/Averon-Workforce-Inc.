'use client';
import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { usersData, initializeUsers, saveData, addNotification, findUserById } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User as UserIcon, Monitor, Globe, Clock, ShieldCheck, Mail, Phone, Search, Check, CheckCheck, Lock, CheckCircle2, Zap } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const ADMIN_UID = 'mock-user-02';

function AdminChatComponent() {
    const searchParams = useSearchParams();
    const targetUserId = searchParams.get('userId');
    const [adminProfile, setAdminProfile] = useState<any>(null);

    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [chatSearchQuery, setChatSearchQuery] = useState('');
    const [activeChatUserId, setActiveChatUserId] = useState<string | null>(targetUserId);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isSending, setIsSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        initializeUsers(true);
        setAllUsers(usersData.filter(u => u && u.uid && u.uid !== ADMIN_UID));
        const adminData = findUserById(ADMIN_UID);
        setAdminProfile(adminData);
    }, []);
    
    useEffect(() => {
        if(targetUserId){
          setActiveChatUserId(targetUserId);
        }
    }, [targetUserId]);

    const filteredUsers = useMemo(() => {
        return allUsers.filter(u => 
            (u?.fullName || '').toLowerCase().includes(chatSearchQuery.toLowerCase()) || 
            (u?.averpayId || '').toLowerCase().includes(chatSearchQuery.toLowerCase())
        );
    }, [allUsers, chatSearchQuery]);

    const activeUser = allUsers.find(u => u.uid === activeChatUserId);
    const chatId = useMemo(() => {
        if (!activeChatUserId || !adminProfile) return null;
        return [activeChatUserId, adminProfile.uid].sort().join('_');
    }, [activeChatUserId, adminProfile]);

    // Handle typing state
    const handleTyping = () => {
        if (!chatId) return;
        try {
            const typingData = JSON.parse(localStorage.getItem('typingStates') || '{}');
            typingData[chatId] = { ...typingData[chatId], [ADMIN_UID]: true };
            localStorage.setItem('typingStates', JSON.stringify(typingData));

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                try {
                    const currentTyping = JSON.parse(localStorage.getItem('typingStates') || '{}');
                    if (currentTyping[chatId]) {
                        currentTyping[chatId] = { ...currentTyping[chatId], [ADMIN_UID]: false };
                        localStorage.setItem('typingStates', JSON.stringify(currentTyping));
                    }
                } catch (e) {
                    console.error("Failed to update typing state", e);
                }
            }, 3000);
        } catch (e) {
            console.error("Failed to access typing states", e);
        }
    };

    useEffect(() => {
        if (chatId) {
            setIsLoadingMessages(true);
            const loadData = () => {
                try {
                    // Messages
                    const storedMessages = JSON.parse(localStorage.getItem('mockMessages') || '{}');
                    const chatMessages = storedMessages[chatId] || [];
                    
                    // Mark incoming as read
                    let hasChanges = false;
                    const updatedChatMessages = chatMessages.map((m: any) => {
                        if (m.senderId !== ADMIN_UID && m.status !== 'read') {
                            hasChanges = true;
                            return { ...m, status: 'read' };
                        }
                        return m;
                    });
                    
                    if (hasChanges) {
                        storedMessages[chatId] = updatedChatMessages;
                        saveData('mockMessages', storedMessages);
                    }
                    
                    setMessages(updatedChatMessages);

                    // Typing state
                    const typingData = JSON.parse(localStorage.getItem('typingStates') || '{}');
                    const chatTyping = typingData[chatId] || {};
                    setIsUserTyping(chatTyping[activeChatUserId!] === true);
                } catch (e) {
                    console.error("Chat data sync error", e);
                }
            };

            loadData();
            setIsLoadingMessages(false);

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
    }, [chatId, activeChatUserId]);

    const filteredMessages = useMemo(() => {
        if (!searchTerm.trim()) return messages;
        return messages.filter(m => m.text.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [messages, searchTerm]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatId || !activeChatUserId || !adminProfile) return;

        setIsSending(true);

        try {
            const allMessages = JSON.parse(localStorage.getItem('mockMessages') || '{}');
            const currentMessages = allMessages[chatId] || [];
            
            const messageData = {
                id: `msg-${Date.now()}`,
                text: newMessage,
                senderId: adminProfile.uid,
                timestamp: new Date().toISOString(),
                senderName: adminProfile.fullName,
                senderImage: adminProfile.profilePhoto,
                status: 'sent',
            };
            
            const updatedMessages = [...currentMessages, messageData];
            allMessages[chatId] = updatedMessages;
            saveData('mockMessages', allMessages); 

            // Clear typing status on send
            try {
                const typingData = JSON.parse(localStorage.getItem('typingStates') || '{}');
                typingData[chatId] = { ...typingData[chatId], [ADMIN_UID]: false };
                localStorage.setItem('typingStates', JSON.stringify(typingData));
            } catch (e) { /* ignore typing state error on send */ }

            setMessages(updatedMessages);
            
            addNotification(activeChatUserId, {
                type: 'new-message',
                title: 'New message from Admin Support',
                description: `"${newMessage.slice(0, 50)}${newMessage.length > 50 ? '...' : ''}"`,
                link: '/dashboard/chat'
            });

            setNewMessage('');
        } catch (e) {
            console.error("Failed to send message", e);
            toast({ variant: 'destructive', title: 'Transmission Error', description: 'Failed to synchronize message to terminal.' });
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const ChatSkeletons = () => (
        <div className="space-y-6 p-6">
            <div className="flex items-end gap-3 justify-start">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-16 w-48 rounded-2xl" />
            </div>
            <div className="flex items-end gap-3 justify-end">
                <Skeleton className="h-20 w-64 rounded-2xl" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </div>
    );

    if (!adminProfile) {
        return <div className="h-screen flex items-center justify-center bg-[#030a1c] text-white">Loading admin profile...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr_300px] h-[calc(100vh-4rem)] bg-[#030a1c]">
            {/* Conversations List */}
            <div className="border-r border-white/5 bg-[#050f26]">
                <div className="p-6 border-b border-white/5 bg-background/5">
                    <h2 className="text-xl font-bold flex items-center justify-between text-white">
                        Live Inbox 
                        <Badge variant="secondary" className="bg-primary/20 text-primary">{allUsers.length}</Badge>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Multi-channel support active</p>
                    <div className="mt-4 relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Filter nodes..." 
                            value={chatSearchQuery}
                            onChange={(e) => setChatSearchQuery(e.target.value)}
                            className="h-10 pl-9 bg-white/5 border-white/5 rounded-xl text-xs text-white focus:border-primary/50" 
                        />
                    </div>
                </div>
                <ScrollArea className="h-[calc(100vh-10rem)]">
                    <div className="p-3 space-y-2">
                        {filteredUsers.map(user => {
                            const isActive = user.uid === activeChatUserId;
                            return (
                                <button
                                    key={user.uid}
                                    onClick={() => setActiveChatUserId(user.uid)}
                                    className={cn(
                                        "w-full text-left flex items-center gap-4 p-4 rounded-xl transition-all duration-200 border border-transparent",
                                        isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <div className="relative">
                                        <Avatar className="h-12 w-12 border border-white/10">
                                            <AvatarImage src={user.profilePhoto} />
                                            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                                        </Avatar>
                                        <span className={cn(
                                            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#050f26]",
                                            user.isOnline ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-zinc-500"
                                        )}></span>
                                    </div>
                                    <div className="flex-1 truncate">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-bold text-sm truncate text-white">{user.fullName}</p>
                                        </div>
                                        <p className={cn("text-[10px] truncate uppercase tracking-widest", isActive ? "text-white/70" : "text-muted-foreground")}>
                                            {user.browserInfo || 'No Session Data'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-col bg-background/5">
                {activeChatUserId && activeUser ? (
                    <>
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#050f26]">
                           <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-white/10">
                                    <AvatarImage src={activeUser.profilePhoto} />
                                    <AvatarFallback>{getInitials(activeUser.fullName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-lg font-bold text-white">{activeUser.fullName}</h2>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{activeUser.role || 'Freelancer'}</p>
                                </div>
                           </div>
                           <div className="flex items-center gap-4 flex-1 max-w-xs mx-4">
                                <div className="relative w-full group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input 
                                        placeholder="Search messages..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-9 pl-9 bg-white/5 border-white/5 rounded-xl text-[10px] text-white focus:border-primary/50" 
                                    />
                                </div>
                           </div>
                           <div className="flex items-center gap-4">
                               <div className={cn(
                                   "flex items-center gap-1.5 px-3 py-1 rounded-full border",
                                   activeUser.isOnline ? "bg-green-500/10 border-green-500/20" : "bg-zinc-500/10 border-zinc-500/20"
                               )}>
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        activeUser.isOnline ? "bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]" : "bg-zinc-500"
                                    )}></div>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest",
                                        activeUser.isOnline ? "text-green-500" : "text-zinc-500"
                                    )}>{activeUser.isOnline ? "Live Session" : "Offline"}</span>
                               </div>
                           </div>
                        </div>
                        <ScrollArea className="flex-1 bg-[#030a1c]">
                             {isLoadingMessages ? <ChatSkeletons /> : (
                                <div className="space-y-6 p-6">
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {filteredMessages && filteredMessages.map((msg, idx) => {
                                            const isAdminMessage = msg.senderId === ADMIN_UID;
                                            const timestamp = new Date(msg.timestamp);
                                            const showAbsoluteTime = true; // Could be a setting
                                            
                                            return (
                                                <motion.div 
                                                    key={msg.id}
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    transition={{ duration: 0.2, delay: idx % 5 * 0.05 }}
                                                    layout
                                                    className={cn("flex flex-col gap-1.5", isAdminMessage ? "items-end" : "items-start")}
                                                >
                                                    <div className={cn("flex items-end gap-3 max-w-[85%] md:max-w-[70%]", isAdminMessage ? "flex-row-reverse" : "flex-row")}>
                                                        <Avatar className="h-9 w-9 shrink-0 border border-white/10 shadow-md ring-2 ring-white/5">
                                                            <AvatarImage src={isAdminMessage ? adminProfile.profilePhoto : activeUser.profilePhoto} />
                                                            <AvatarFallback className={cn("text-xs font-black", isAdminMessage ? "bg-primary text-white" : "bg-zinc-800 text-white")}>
                                                                {getInitials(isAdminMessage ? adminProfile.fullName : activeUser.fullName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className={cn(
                                                                "relative px-5 py-3.5 rounded-2xl text-[14px] shadow-lg transition-all border",
                                                                isAdminMessage 
                                                                    ? "bg-gradient-to-br from-primary to-blue-600 text-white rounded-tr-none border-white/10" 
                                                                    : "bg-[#0a1631] text-white/90 rounded-tl-none border-white/5"
                                                            )}>
                                                                <p className="leading-[1.6] tracking-tight whitespace-pre-wrap break-words font-medium">
                                                                    {msg.text}
                                                                </p>
                                                            </div>
                                                            
                                                            <div className={cn("flex items-center gap-2 px-2", isAdminMessage ? "justify-end" : "justify-start")}>
                                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                                                    {showAbsoluteTime && (
                                                                        <span className="text-white/20">
                                                                            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    )}
                                                                    <span className="h-1 w-1 rounded-full bg-white/10" />
                                                                    {formatDistanceToNow(timestamp, { addSuffix: true })}
                                                                </span>
                                                                {isAdminMessage && (
                                                                    <div className="flex items-center gap-0.5 ml-1">
                                                                        {msg.status === 'read' ? (
                                                                            <CheckCheck className="h-3 w-3 text-blue-400" />
                                                                        ) : (
                                                                            <Check className="h-3 w-3 text-white/20" />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                    <AnimatePresence mode="popLayout">
                                        {isUserTyping && activeUser && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex items-end gap-3"
                                            >
                                                <Avatar className="h-9 w-9 shrink-0 border border-white/10 shadow-md ring-2 ring-white/5">
                                                    <AvatarImage src={activeUser.profilePhoto} />
                                                    <AvatarFallback className="bg-zinc-800 text-white text-[10px] font-black">
                                                        {getInitials(activeUser.fullName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="bg-[#0a1631] px-5 py-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-3 shadow-xl">
                                                        <div className="flex items-center gap-1.5">
                                                            <motion.span 
                                                                animate={{ opacity: [0.3, 1, 0.3] }} 
                                                                transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} 
                                                                className="w-1.5 h-1.5 bg-primary rounded-full" 
                                                            />
                                                            <motion.span 
                                                                animate={{ opacity: [0.3, 1, 0.3] }} 
                                                                transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} 
                                                                className="w-1.5 h-1.5 bg-primary/60 rounded-full" 
                                                            />
                                                            <motion.span 
                                                                animate={{ opacity: [0.3, 1, 0.3] }} 
                                                                transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} 
                                                                className="w-1.5 h-1.5 bg-primary/30 rounded-full" 
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em]">
                                                            {activeUser.fullName?.split(' ')[0] || 'User'} is composing...
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                     <div ref={messagesEndRef} />
                                </div>
                             )}
                        </ScrollArea>
                        <div className="p-6 border-t border-white/5 bg-[#050f26]">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                <Input
                                    value={newMessage}
                                    onChange={e => {
                                        setNewMessage(e.target.value);
                                        handleTyping();
                                    }}
                                    placeholder="Type a message to the user..."
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white focus:border-primary/50"
                                />
                                <Button type="submit" className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 shrink-0" disabled={isSending || !newMessage.trim()}>
                                    <Send className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-12">
                        <div className="bg-primary/5 p-8 rounded-full mb-6">
                            <UserIcon className="h-16 w-16 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Omni-Channel Inbox</h3>
                        <p className="text-sm max-w-sm mx-auto">Select a user from the left to view their live session data, location, and message history.</p>
                    </div>
                )}
            </div>

            {/* Session Metadata Sidebar */}
            <div className="border-l border-white/5 bg-[#050f26] hidden lg:flex flex-col h-full overflow-hidden">
                {activeUser ? (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Terminal Node</p>
                            <h3 className="text-xl font-bold text-white italic tracking-tighter">SESSION<span className="text-primary">INTEL</span></h3>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-6 space-y-8">
                                {/* Live Session Metadata */}
                                <div>
                                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Monitor className="h-3 w-3" /> Live Metadata
                                    </h4>
                                    <div className="grid gap-3">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1 opacity-50">Browser Environment</p>
                                            <p className="text-xs font-bold text-white truncate">{activeUser.browserInfo || 'Averon Secure Browser v4.2'}</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-green-500/20 transition-all">
                                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1 opacity-50">Network Relay (IP)</p>
                                            <p className="text-xs font-bold text-white font-mono">192.168.1.{Math.floor(Math.random() * 255)} // <span className="text-green-500">ENCRYPTED</span></p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/20 transition-all">
                                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1 opacity-50">Relay Node</p>
                                            <p className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                                                <Globe className="h-3 w-3 text-blue-500" />
                                                {activeUser.location || 'Unknown Coordinates'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Integrity Checks */}
                                <div>
                                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <ShieldCheck className="h-3 w-3" /> Integrity Diagnostics
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Verification</span>
                                            {activeUser.isEmailVerified ? (
                                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">VERIFIED</Badge>
                                            ) : (
                                                <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">PENDING</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Device Auth</span>
                                            {activeUser.deviceAuthenticated ? (
                                                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[10px]">
                                                    <ShieldCheck className="h-3 w-3" /> SECURE
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-[10px]">
                                                    <Lock className="h-3 w-3" /> UNSAFE
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Identity (KYC)</span>
                                            <div className="flex items-center gap-1.5 text-green-400 font-bold text-[10px]">
                                                <CheckCircle2 className="h-3 w-3" /> CLEARED
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fin. Compliance</span>
                                            <div className="flex items-center gap-1.5 text-primary font-bold text-[10px]">
                                                <Zap className="h-3 w-3" /> IMF_SYNCED
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Snapshot */}
                                <div>
                                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Registry Asset Value</h4>
                                    <div className="p-5 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[2rem] text-center shadow-xl shadow-primary/5">
                                        <p className="text-[9px] font-black text-primary/70 uppercase tracking-[0.3em] mb-1">TOTAL LIQUIDITY</p>
                                        <p className="text-3xl font-black text-white italic tracking-tighter">£{activeUser.totalBalance?.toLocaleString() || '0'}</p>
                                    </div>
                                </div>

                                <div className="pt-4 pb-8">
                                    <Button className="w-full bg-white/5 border border-white/10 hover:border-primary/40 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl h-14 group">
                                        Update Node Privileges
                                    </Button>
                                    <p className="text-[8px] text-muted-foreground uppercase tracking-widest text-center mt-3 opacity-30">Security Clearance Level // 4</p>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                            <Monitor className="h-8 w-8 text-white/10" />
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">NO ACTIVE SELECTION</p>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-widest mt-2 opacity-30">Awaiting user link protocol...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminChatPage() {
    return (
        <Suspense fallback={<div className="h-screen bg-[#030a1c] flex items-center justify-center text-white">Loading support inbox...</div>}>
            <AdminChatComponent />
        </Suspense>
    )
}
