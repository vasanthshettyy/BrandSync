import { useState } from 'react';
import { Send, Loader2, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MilestoneSubmitForm({ onSubmit, loading }) {
    const [link, setLink] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!link.trim()) return;
        await onSubmit({ link, notes });
    };

    return (
        <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit} 
            className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/5"
        >
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Deliverable Link</label>
                <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input 
                        type="url" 
                        required
                        value={link}
                        onChange={e => setLink(e.target.value)}
                        placeholder="Google Drive, Dropbox, etc."
                        className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-xs outline-none focus:border-primary transition-colors"
                    />
                </div>
            </div>
            
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Notes for Brand</label>
                <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add context or instructions..."
                    rows={3}
                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-xs outline-none focus:border-primary transition-colors resize-none"
                />
            </div>

            <button 
                type="submit" 
                disabled={loading || !link.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-brand text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
            >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {loading ? 'Submitting...' : 'Submit Work'}
            </button>
        </motion.form>
    );
}
