import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../layout/PageWrapper';
import { 
    Send, MessageSquare, User, 
    Loader2, Search, Circle, ChevronLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PREMIUM_SPRING, STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/motion';
import { formatRelativeTime, cn } from '../../lib/utils';

export default function ChatInterface() {
    const { user, role } = useAuth();
    const [threads, setThreads] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    // Fetch active contracts/accepted proposals to build threads
    async function fetchThreads() {
        if (!user) return;
        setLoading(true);
        try {
            // Threads are based on contracts
            const { data, error } = await supabase
                .from('contracts')
                .select(`
                    id,
                    status,
                    brand_id,
                    influencer_id,
                    gigs(title),
                    profiles_brand(company_name, logo_url),
                    profiles_influencer(full_name, avatar_url)
                `)
                .or(`brand_id.eq.${user.id},influencer_id.eq.${user.id}`)
                .neq('status', 'Cancelled');

            if (error) throw error;
            setThreads(data || []);
        } catch (err) {
            console.error('Error fetching chat threads:', err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchMessages(contractId) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('contract_id', contractId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    }

    useEffect(() => {
        fetchThreads();
    }, [user]);

    useEffect(() => {
        if (selectedThread) {
            fetchMessages(selectedThread.id);

            // Subscribe to real-time messages
            const channel = supabase
                .channel(`chat-${selectedThread.id}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages',
                    filter: `contract_id=eq.${selectedThread.id}`
                }, (payload) => {
                    setMessages(prev => [...prev, payload.new]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [selectedThread]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    async function handleSendMessage(e) {
        e.preventDefault();
        if (!newMessage.trim() || !selectedThread || sending) return;

        setSending(true);
        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    contract_id: selectedThread.id,
                    sender_id: user.id,
                    content: newMessage.trim()
                });

            if (error) throw error;
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setSending(false);
        }
    }

    const getPartnerInfo = (thread) => {
        if (role === 'brand') {
            return {
                name: thread.profiles_influencer?.full_name,
                avatar: thread.profiles_influencer?.avatar_url
            };
        }
        return {
            name: thread.profiles_brand?.company_name,
            avatar: thread.profiles_brand?.logo_url
        };
    };

    return (
        <PageWrapper title="Messages" subtitle="Secure communication with your campaign partners.">
            <div className="flex h-[calc(100vh-220px)] glass-card overflow-hidden">
                {/* Sidebar: Threads */}
                <div className={cn(
                    "w-full md:w-80 border-r border-white/10 flex flex-col transition-all",
                    selectedThread && "hidden md:flex"
                )}>
                    <div className="p-4 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input 
                                type="text" 
                                placeholder="Search messages..."
                                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-primary"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                        ) : threads.length === 0 ? (
                            <div className="text-center p-8 opacity-20"><MessageSquare size={40} className="mx-auto mb-2" /><p className="text-xs">No active chats</p></div>
                        ) : (
                            threads.map(thread => {
                                const partner = getPartnerInfo(thread);
                                return (
                                    <button
                                        key={thread.id}
                                        onClick={() => setSelectedThread(thread)}
                                        className={cn(
                                            "w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left",
                                            selectedThread?.id === thread.id ? "bg-primary/10 border border-primary/20" : "hover:bg-white/5 border border-transparent"
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center shrink-0 overflow-hidden">
                                            {partner.avatar ? <img src={partner.avatar} className="w-full h-full object-cover" /> : <User size={20} className="text-white" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-white truncate">{partner.name}</p>
                                            <p className="text-[10px] text-text-muted truncate">{thread.gigs?.title}</p>
                                        </div>
                                        {thread.status === 'Active' && <Circle size={8} className="fill-emerald-500 text-emerald-500" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Main: Chat Window */}
                <div className={cn(
                    "flex-1 flex flex-col bg-white/[0.01]",
                    !selectedThread && "hidden md:flex items-center justify-center"
                )}>
                    {selectedThread ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/10 flex items-center gap-4">
                                <button onClick={() => setSelectedThread(null)} className="md:hidden p-2 hover:bg-white/5 rounded-lg"><ChevronLeft /></button>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center overflow-hidden">
                                        {getPartnerInfo(selectedThread).avatar ? <img src={getPartnerInfo(selectedThread).avatar} className="w-full h-full object-cover" /> : <User size={20} className="text-white" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{getPartnerInfo(selectedThread).name}</p>
                                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{selectedThread.status}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div 
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
                            >
                                <AnimatePresence>
                                    {messages.map((msg, idx) => {
                                        const isOwn = msg.sender_id === user.id;
                                        return (
                                            <motion.div
                                                key={msg.id || idx}
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={PREMIUM_SPRING}
                                                className={cn(
                                                    "flex w-full",
                                                    isOwn ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div className={cn(
                                                    "max-w-[80%] p-4 rounded-2xl text-sm",
                                                    isOwn 
                                                        ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20" 
                                                        : "bg-white/10 text-white rounded-tl-none border border-white/10"
                                                )}>
                                                    <p className="leading-relaxed">{msg.content}</p>
                                                    <p className={cn(
                                                        "text-[9px] mt-2 font-bold uppercase opacity-50",
                                                        isOwn ? "text-white" : "text-text-muted"
                                                    )}>
                                                        {formatRelativeTime(msg.created_at)}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/10">
                                <div className="flex gap-3">
                                    <input 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary transition-all"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                                    >
                                        {sending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={20} />}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="text-center opacity-30 select-none">
                            <MessageSquare size={64} className="mx-auto mb-4 text-primary" />
                            <h3 className="text-xl font-bold text-white">Your Conversations</h3>
                            <p className="text-sm max-w-xs mx-auto mt-2">Select a thread to start chatting with your campaign partners.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
}
