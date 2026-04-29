'use client';
import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { usersData, initializeUsers, saveData, addNotification, findUserById } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User as UserIcon, Monitor, Globe, Clock, ShieldCheck, Mail, Phone } from 'lucide-react';
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
    const [activeChatUserId, setActiveChatUserId] = useState<string | null>(targetUserId);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isSending, setIsSending] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    useEffect(() => {
        initializeUsers();
        setAllUsers(usersData.filter(u => u.uid !== ADMIN_UID));
        const adminData = findUserById(ADMIN_UID);
        setAdminProfile(adminData);
    }, []);
    
    useEffect(() => {
        if(targetUserId){
          setActiveChatUserId(targetUserId);
        }
    }, [targetUserId]);

    const activeUser = allUsers.find(u => u.uid === activeChatUserId);
    const chatId = useMemo(() => {
        if (!activeChatUserId || !adminProfile) return null;
        return [activeChatUserId, adminProfile.uid].sort().join('_');
    }, [activeChatUserId, adminProfile]);

    useEffect(() => {
        if (chatId) {
            setIsLoadingMessages(true);
            const loadMessages = () => {
                const storedMessages = JSON.parse(localStorage.getItem('mockMessages') || '{}');
                setMessages(storedMessages[chatId] || []);
            };

            loadMessages();
            setIsLoadingMessages(false);

            const intervalId = setInterval(loadMessages, 2000);
            return () => clearInterval(intervalId);
        }
    }, [chatId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatId || !activeChatUserId || !adminProfile) return;

        setIsSending(true);

        const messageData = {
            id: `msg-${Date.now()}`,
            text: newMessage,
            senderId: adminProfile.uid,
            timestamp: new Date().toISOString(),
            senderName: adminProfile.fullName,
            senderImage: adminProfile.profilePhoto,
        };
        
        const allMessages = JSON.parse(localStorage.getItem('mockMessages') || '{}');
        const currentMessages = allMessages[chatId] || [];
        const updatedMessages = [...currentMessages, messageData];
        allMessages[chatId] = updatedMessages;
        saveData('mockMessages', allMessages); 

        setMessages(updatedMessages);
        
        addNotification(activeChatUserId, {
            type: 'new-message',
            title: 'New message from Admin Support',
            description: `"${newMessage.slice(0, 50)}${newMessage.length > 50 ? '...' : ''}"`,
            link: '/dashboard/chat'
        });

        setNewMessage('');
        setIsSending(false);
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
                </div>
                <ScrollArea className="h-[calc(100vh-10rem)]">
                    <div className="p-3 space-y-2">
                        {allUsers.map(user => {
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
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#050f26] shadow-[0_0_8px_#22c55e]"></span>
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
                           <div className="flex items-center gap-4">
                               <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]"></div>
                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Live Session</span>
                               </div>
                           </div>
                        </div>
                        <ScrollArea className="flex-1 bg-[#030a1c]">
                             {isLoadingMessages ? <ChatSkeletons /> : (
                                <div className="space-y-6 p-6">
                                    {messages && messages.map(msg => {
                                        const isAdminMessage = msg.senderId === ADMIN_UID;
                                        const timestamp = new Date(msg.timestamp);
                                        return (
                                            <div key={msg.id} className={cn("flex items-end gap-3", isAdminMessage ? "justify-end" : "justify-start")}>
                                                {!isAdminMessage && activeUser && (
                                                    <Avatar className="h-8 w-8 shrink-0">
                                                        <AvatarImage src={activeUser.profilePhoto} />
                                                        <AvatarFallback>{getInitials(activeUser.fullName)}</AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className={cn(
                                                    "max-w-xs md:max-w-md rounded-2xl p-4 shadow-sm",
                                                    isAdminMessage 
                                                        ? "bg-primary text-white rounded-br-none" 
                                                        : "bg-white/10 text-white rounded-bl-none border border-white/5"
                                                )}>
                                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                                    {timestamp && (
                                                        <p className={cn("text-[10px] mt-2 font-bold uppercase tracking-wider", isAdminMessage ? "text-white/50" : "text-muted-foreground")}>
                                                            {formatDistanceToNow(timestamp, { addSuffix: true })}
                                                        </p>
                                                    )}
                                                </div>
                                                {isAdminMessage && adminProfile && (
                                                    <Avatar className="h-8 w-8 shrink-0">
                                                        <AvatarImage src={adminProfile.profilePhoto} />
                                                        <AvatarFallback>AD</AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>
                                        );
                                    })}
                                     <div ref={messagesEndRef} />
                                </div>
                             )}
                        </ScrollArea>
                        <div className="p-6 border-t border-white/5 bg-[#050f26]">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                <Input
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
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
            <div className="border-l border-white/5 bg-[#050f26] p-6 hidden lg:block overflow-y-auto">
                {activeUser ? (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Live Session Metadata</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <Monitor className="h-4 w-4 text-primary" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Device & Browser</p>
                                        <p className="text-sm font-semibold text-white truncate max-w-[180px]">{activeUser.browserInfo || 'Detecting...'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <Globe className="h-4 w-4 text-green-500" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Real-Time Location</p>
                                        <p className="text-sm font-semibold text-white">{activeUser.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Last Activity</p>
                                        <p className="text-sm font-semibold text-white">
                                            {activeUser.lastSeen ? formatDistanceToNow(new Date(activeUser.lastSeen), { addSuffix: true }) : 'Online Now'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Account Integrity</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-white/5 text-white">
                                    <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> Status</span>
                                    <Badge variant="secondary" className="text-[10px] uppercase bg-green-500/20 text-green-500">{activeUser.status}</Badge>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5 text-white">
                                    <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-2"><Mail className="h-3 w-3" /> Email</span>
                                    <span className="text-xs truncate max-w-[120px]">{activeUser.email}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5 text-white">
                                    <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-2"><Phone className="h-3 w-3" /> WhatsApp</span>
                                    <span className="text-xs">{activeUser.phone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/10 text-primary font-bold rounded-xl h-12">
                                Manage User Profile
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <Monitor className="h-10 w-10 text-white/5 mb-4" />
                        <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">No User Active</p>
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
