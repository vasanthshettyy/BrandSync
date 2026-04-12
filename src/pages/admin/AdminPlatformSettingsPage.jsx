import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, CheckCircle2, ShieldCheck, MessageSquare, BadgePercent, LayoutGrid } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { usePlatformSettings } from '../../hooks/usePlatformSettings';
import PageWrapper from '../../components/layout/PageWrapper';
import { cn } from '../../lib/utils';

export default function AdminPlatformSettingsPage() {
    const { settings: initialSettings, loading: loadingInitial } = usePlatformSettings();
    const [settings, setSettings] = useState(null);
    const [saving, setSaving] = useState({});
    const [savedFeedback, setSavedFeedback] = useState({});

    useEffect(() => {
        if (initialSettings) {
            setSettings({
                commission_rate: initialSettings.commissionRate,
                max_gigs_per_brand_free: initialSettings.maxGigsPerBrandFree,
                enable_escrow: initialSettings.enableEscrow,
                enable_chat: initialSettings.enableChat
            });
        }
    }, [initialSettings]);

    const handleUpdate = async (key, value) => {
        // Prevent redundant saves
        if (settings[key] === value && typeof value !== 'boolean') return;

        setSaving(prev => ({ ...prev, [key]: true }));
        
        try {
            const { error } = await supabase
                .from('platform_settings')
                .upsert({ key, value }, { onConflict: 'key' });

            if (error) throw error;

            setSettings(prev => ({ ...prev, [key]: value }));
            setSavedFeedback(prev => ({ ...prev, [key]: true }));
            
            // Clear feedback after 2 seconds
            setTimeout(() => {
                setSavedFeedback(prev => ({ ...prev, [key]: false }));
            }, 2000);
        } catch (err) {
            console.error(`Failed to update ${key}:`, err);
            alert(`Failed to save ${key}. Please try again.`);
        } finally {
            setSaving(prev => ({ ...prev, [key]: false }));
        }
    };

    if (loadingInitial || !settings) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
                <p className="text-xs font-bold uppercase tracking-widest opacity-40">Loading Settings...</p>
            </div>
        );
    }

    return (
        <PageWrapper title="Platform Settings" subtitle="Configure global platform behavior and defaults.">
            <div className="max-w-3xl">
                <div className="glass-card overflow-hidden">
                    <div className="p-8 space-y-8">
                        
                        {/* Commission Rate */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                                    <BadgePercent className="w-4 h-4 text-primary" />
                                    Commission Rate (%)
                                </label>
                                <Feedback saved={savedFeedback.commission_rate} saving={saving.commission_rate} />
                            </div>
                            <input 
                                type="number" 
                                className="bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 transition-all"
                                value={settings.commission_rate}
                                onChange={(e) => setSettings(prev => ({ ...prev, commission_rate: e.target.value }))}
                                onBlur={(e) => handleUpdate('commission_rate', parseFloat(e.target.value))}
                            />
                            <p className="text-[10px] text-text-muted font-medium">Standard percentage taken from each milestone payment.</p>
                        </div>

                        {/* Max Gigs */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                                    <LayoutGrid className="w-4 h-4 text-accent" />
                                    Max Gigs (Free Tier)
                                </label>
                                <Feedback saved={savedFeedback.max_gigs_per_brand_free} saving={saving.max_gigs_per_brand_free} />
                            </div>
                            <input 
                                type="number" 
                                className="bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent/50 transition-all"
                                value={settings.max_gigs_per_brand_free}
                                onChange={(e) => setSettings(prev => ({ ...prev, max_gigs_per_brand_free: e.target.value }))}
                                onBlur={(e) => handleUpdate('max_gigs_per_brand_free', parseInt(e.target.value))}
                            />
                            <p className="text-[10px] text-text-muted font-medium">Limits the number of open gigs a brand can have without a subscription.</p>
                        </div>

                        <div className="h-px bg-white/5" />

                        {/* Toggles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ToggleField 
                                label="Enable Escrow" 
                                icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
                                description="Forces payments into escrow before milestones start."
                                value={settings.enable_escrow}
                                onChange={(val) => handleUpdate('enable_escrow', val)}
                                saved={savedFeedback.enable_escrow}
                                saving={saving.enable_escrow}
                            />
                            <ToggleField 
                                label="Enable Chat" 
                                icon={<MessageSquare className="w-4 h-4 text-blue-400" />}
                                description="Global kill-switch for brand-influencer messaging."
                                value={settings.enable_chat}
                                onChange={(val) => handleUpdate('enable_chat', val)}
                                saved={savedFeedback.enable_chat}
                                saving={saving.enable_chat}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}

function ToggleField({ label, icon, description, value, onChange, saved, saving }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-xs font-bold text-white uppercase tracking-widest">{label}</span>
                </div>
                <Feedback saved={saved} saving={saving} />
            </div>
            <button 
                onClick={() => onChange(!value)}
                className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                    value 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-white/5 border-white/10 text-text-muted hover:border-white/20"
                )}
            >
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{value ? 'Active' : 'Disabled'}</span>
                <div className={cn(
                    "w-10 h-5 rounded-full relative transition-colors duration-300",
                    value ? "bg-emerald-500" : "bg-white/10"
                )}>
                    <motion.div 
                        animate={{ x: value ? 22 : 2 }}
                        className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-lg" 
                    />
                </div>
            </button>
            <p className="text-[10px] text-text-muted font-medium leading-relaxed">{description}</p>
        </div>
    );
}

function Feedback({ saved, saving }) {
    return (
        <div className="min-w-[60px] flex justify-end">
            <AnimatePresence mode="wait">
                {saving ? (
                    <motion.div 
                        key="saving"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 text-text-muted"
                    >
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Saving</span>
                    </motion.div>
                ) : saved ? (
                    <motion.div 
                        key="saved"
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-1 text-emerald-400"
                    >
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Saved</span>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
