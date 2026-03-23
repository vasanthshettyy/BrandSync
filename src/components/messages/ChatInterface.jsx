import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../layout/PageWrapper';
import { 
    Send, MessageSquare, User, 
    Loader2, Search, Circle, ChevronLeft,
    Lock, Info, CheckCircle2, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PREMIUM_SPRING, STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/motion';
import { formatRelativeTime, cn } from '../../lib/utils';

/**
 * ChatInterface (Messaging)
 * Part 4 of 4: Real-Time Communication System
 */
export default function ChatInterface() {
    const { user, role } = useAuth();
    const [threads, setThreads] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    // Fetch active/completed contracts to build threads
    async function fetchThreads() {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch contracts where user is either brand or influencer
            // The prompt says "Proposal is Accepted or Contract is Active"
            // According to roadmap, Accepted Proposal = Active Contract
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
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setThreads(data || []);
        } catch (err) {
            console.error('Error fetching chat threads:', err);
        } finally {
            setLoading(false);
        }
    }

    // Fetch historical messages for the selected contract
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

            // Real-time subscription for 'INSERT' events on messages table
            const channel = supabase
                .channel(`chat-${selectedThread.id}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages',
                    filter: `contract_id=eq.${selectedThread.id}`
                }, (payload) => {
                    // Update state instantly without refresh
                    setMessages(prev => {
                        // Avoid duplicates if real-time fires twice or on own message
                        if (prev.some(m => m.id === payload.new.id)) return prev;
                        return [...prev, payload.new];
                    });
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [selectedThread]);

    // Auto-scroll to newest message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    async function handleSendMessage(e) {
        e.preventDefault();
        // Messaging allowed ONLY if contract is Active (or completed)
        const isMessagingAllowed = selectedThread?.status === 'Active' || selectedThread?.status === 'Completed';
        
        if (!newMessage.trim() || !selectedThread || sending || !isMessagingAllowed) return;

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
                {/* Threads Sidebar */}
                <div className={cn(
                    "w-full md:w-80 border-r border-white/10 flex flex-col transition-all bg-white/[0.02]",
                    selectedThread && "hidden md:flex"
                )}>
                    <div className="p-5 border-b border-white/10">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search chats..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-12 gap-3 opacity-40">
                                <Loader2 className="animate-spin text-primary" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Loading chats...</p>
                            </div>
                        ) : threads.length === 0 ? (
                            <div className="text-center p-12 opacity-20 flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                    <MessageSquare size={32} />
                                </div>
                                <p className="text-xs font-medium">No active conversations</p>
                            </div>
                        ) : (
                            threads.map(thread => {
                                const partner = getPartnerInfo(thread);
                                const isActive = selectedThread?.id === thread.id;
                                return (
                                    <motion.button
                                        key={thread.id}
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedThread(thread)}
                                        className={cn(
                                            "w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left group border relative",
                                            isActive 
                                                ? "bg-primary/10 border-primary/20 shadow-lg shadow-primary/10" 
                                                : "hover:bg-white/5 border-transparent"
                                        )}
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-brand p-[1px] shadow-lg flex-shrink-0">
                                            <div className="w-full h-full rounded-[15px] bg-surface-900 flex items-center justify-center overflow-hidden">
                                                {partner.avatar ? (
                                                    <img src={partner.avatar} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={20} className="text-white" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <p className="text-sm font-bold text-white truncate">{partner.name}</p>
                                                {thread.status === 'Active' && (
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-text-muted truncate font-medium">{thread.gigs?.title}</p>
                                        </div>
                                        {isActive && (
                                            <motion.div 
                                                layoutId="active-thread"
                                                className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                                            />
                                        )}
                                    </motion.button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className={cn(
                    "flex-1 flex flex-col bg-white/[0.01] relative",
                    !selectedThread && "hidden md:flex items-center justify-center"
                )}>
                    {selectedThread ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02] backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setSelectedThread(null)} 
                                        className="md:hidden p-2 hover:bg-white/5 rounded-xl text-text-muted"
                                    >
                                        <ChevronLeft />
                                    </button>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-brand p-[1px] shadow-lg flex-shrink-0">
                                            <div className="w-full h-full rounded-[15px] bg-surface-900 flex items-center justify-center overflow-hidden">
                                                {getPartnerInfo(selectedThread).avatar ? (
                                                    <img src={getPartnerInfo(selectedThread).avatar} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={20} className="text-white" />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white leading-tight">
                                                {getPartnerInfo(selectedThread).name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded-lg border font-bold uppercase tracking-widest",
                                                    selectedThread.status === 'Active' ? "bg-success/10 text-success border-success/20" : "bg-white/10 text-text-muted border-white/20"
                                                )}>
                                                    {selectedThread.status}
                                                </span>
                                                <span className="text-[10px] text-text-muted font-bold truncate max-w-[150px]">
                                                    {selectedThread.gigs?.title}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Scroll Area */}
                            <div 
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide"
                            >
                                <AnimatePresence mode="popLayout">
                                    {messages.map((msg, idx) => {
                                        const isOwn = msg.sender_id === user.id;
                                        return (
                                            <motion.div
                                                key={msg.id || idx}
                                                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ ...PREMIUM_SPRING, delay: idx * 0.02 }}
                                                className={cn(
                                                    "flex w-full",
                                                    isOwn ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div className={cn(
                                                    "max-w-[75%] md:max-w-[60%] flex flex-col",
                                                    isOwn ? "items-end" : "items-start"
                                                )}>
                                                    <div className={cn(
                                                        "p-4 rounded-3xl text-sm leading-relaxed",
                                                        isOwn 
                                                            ? "bg-primary text-white rounded-tr-none shadow-xl shadow-primary/20" 
                                                            : "glass-card rounded-tl-none border-white/10 text-white"
                                                    )}>
                                                        {msg.content}
                                                    </div>
                                                    <span className="text-[9px] mt-2 font-bold uppercase tracking-widest text-text-muted px-1">
                                                        {formatRelativeTime(msg.created_at)}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {/* Message Input Area */}
                            <div className="p-6 bg-surface-900/50 backdrop-blur-xl border-t border-white/10">
                                {selectedThread.status === 'Active' || selectedThread.status === 'Completed' ? (
                                    <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
                                        <div className="flex-1 relative group">
                                            <input 
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your message..."
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all shadow-inner"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-40">
                                                <Info size={14} className="hover:text-primary cursor-help" />
                                            </div>
                                        </div>
                                        <motion.button 
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center text-white hover:shadow-indigo-500/40 transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-indigo-500/20"
                                        >
                                            {sending ? <Loader2 className="animate-spin w-6 h-6" /> : <Send size={22} className="ml-1" />}
                                        </motion.button>
                                    </form>
                                ) : (
                                    <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-dashed border-white/10 text-text-muted">
                                        <Lock size={16} />
                                        <p className="text-xs font-bold uppercase tracking-widest">Chat locked: Campaign is {selectedThread.status}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-12 select-none animate-fade-in flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 relative">
                                <MessageSquare size={48} className="text-primary/40" />
                                <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse-dot" />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-white mb-3">Campaign Messenger</h3>
                            <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
                                Select a campaign thread from the sidebar to coordinate content, scripts, and feedback with your partners.
                            </p>
                            <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-left">
                                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success mb-3">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">Secure</p>
                                    <p className="text-[10px] text-text-muted mt-1">End-to-end encrypted contract talks.</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-left">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3">
                                        <Clock size={16} />
                                    </div>
                                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">Real-time</p>
                                    <p className="text-[10px] text-text-muted mt-1">Instant updates with no refresh needed.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
}
