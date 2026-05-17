'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Send,
  Users,
  ArrowLeft,
  Search,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { db, realtimeDb } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, onValue, set } from 'firebase/database';
import { Message } from '@/types';

export default function ChatPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('id', '!=', user.uid));
        const snapshot = await getDocs(q);
        const usersData = snapshot.docs.map((doc) => doc.data());
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, router]);

  useEffect(() => {
    if (!selectedUser || !user) return;

    const chatId = [user.uid, selectedUser.id].sort().join('_');
    const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const messagesList = Object.values(data) as Message[];
        setMessages(messagesList.sort((a, b) => a.timestamp - b.timestamp));
      }
    });

    return () => unsubscribe();
  }, [selectedUser, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !user) return;

    setSending(true);
    try {
      const chatId = [user.uid, selectedUser.id].sort().join('_');
      const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
      const newMessageRef = ref(realtimeDb, `chats/${chatId}/messages/${Date.now()}`);

      await set(newMessageRef, {
        id: Date.now().toString(),
        senderId: user.uid,
        senderName: user.appUser?.fullName || user.email,
        content: newMessage,
        timestamp: Date.now(),
        read: false,
      });

      setNewMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="text-white">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col">
      {/* Header */}
      <header className="bg-[#050f26] border-b border-white/10 px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Users List */}
        <div className="w-full md:w-80 bg-[#050f26] border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`w-full p-4 border-b border-white/5 text-left hover:bg-white/5 transition ${
                  selectedUser?.id === u.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                }`}
              >
                <h3 className="font-semibold text-white">{u.fullName}</h3>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 hidden md:flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="bg-[#050f26] border-b border-white/10 px-6 py-4">
                <h2 className="text-xl font-bold text-white">{selectedUser.fullName}</h2>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.senderId === user?.uid
                          ? 'bg-primary text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="border-t border-white/10 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a user to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
