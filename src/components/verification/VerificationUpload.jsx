import { useState } from 'react';
import { Upload, CheckCircle, Loader2, AlertCircle, X, Image as ImageIcon, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

/**
 * VerificationUpload — Influencer Screenshot Verification using OCR.space Prototype.
 * Uses Edge Function to verify follower counts and platform from screenshots.
 * Automatically verifies the user if the AI confidence is >= 0.85.
 */
export default function VerificationUpload({ user, profile }) {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [ocrStatus, setOcrStatus] = useState('idle'); // 'idle' | 'scanning' | 'success' | 'failed' | 'submitted'
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [manualFollowers, setManualFollowers] = useState('');
    const [extractedData, setExtractedData] = useState({
        followers: null,
        platform: null,
        handle: null
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setOcrStatus('idle');
            setError(null);
            setExtractedData({ followers: null, platform: null, handle: null });
            setManualFollowers('');
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setPreviewUrl(null);
        setOcrStatus('idle');
        setError(null);
        setExtractedData({ followers: null, platform: null, handle: null });
        setManualFollowers('');
    };

    const compressImageForUpload = async (fileUpload) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(fileUpload);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Scale down if too large, max width 1024
                const MAX_WIDTH = 1024;
                let width = img.width;
                let height = img.height;
                
                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // Draw white background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
        });
    };

    const handleScan = async () => {
        if (!file) return;

        setOcrStatus('scanning');
        setError(null);
        try {
            const base64Image = await compressImageForUpload(file);

            const { data, error: funcError } = await supabase.functions.invoke('verify-image', {
                body: { image: base64Image }
            });

            if (funcError) {
                // Handle Supabase function invocation errors
                let message = "Failed to call verification service";
                try {
                    const errBody = await funcError.context?.json?.();
                    message = errBody?.error || funcError.message || message;
                } catch {
                    message = funcError.message || message;
                }
                throw new Error(message);
            }

            console.log("AI Extracted Data:", data);

            const threshold = data?.threshold || 0.85;

            if (data && data.confidence >= threshold && data.followers_count) {
                setExtractedData({
                    followers: data.followers_count,
                    platform: data.platform || 'Social Media'
                });
                setOcrStatus('success');
            } else {
                setOcrStatus('failed');
                if (!data || !data.followers_count) {
                    setError("Could not detect follower count. Please try a clearer screenshot or enter manually.");
                } else if (data.confidence < threshold) {
                    setError("Verification confidence was low. Please enter your follower count manually for review.");
                }
            }
        } catch (err) {
            console.error("AI Scan Error:", err);
            setOcrStatus('failed');
            // Clean up cryptic messages
            const friendlyMessage = err.message?.includes('AbortError') || err.message?.includes('timeout')
                ? "Verification timed out. Please try a smaller image or better connection."
                : err.message;
            setError(friendlyMessage);
        }
    };

    const handleSubmit = async () => {
        const finalFollowers = extractedData.followers || parseInt(manualFollowers);
        if (!file || !finalFollowers) return;

        setIsSubmitting(true);
        try {
            // Upload to Storage
            const fileName = `${user.id}/${Date.now()}.png`;
            const { error: uploadError } = await supabase.storage
                .from('verification-proofs')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('verification-proofs')
                .getPublicUrl(fileName);

            const isAutoApproved = !!extractedData.followers;
            const status = isAutoApproved ? 'Approved' : 'Pending';

            const adminNotes = isAutoApproved
                ? `Auto-verified by AI Prototype. Follower count recorded as ${extractedData.followers.toLocaleString()}.`
                : `AI Verification Failed. User manually entered ${finalFollowers.toLocaleString()} followers. Needs Admin Review.`;

            const { error: dbError } = await supabase
                .from('verification_proofs')
                .insert({
                    influencer_id: user.id,
                    proof_url: publicUrl,
                    platform: extractedData.platform || 'Unknown',
                    status: status,
                    admin_notes: adminNotes
                });

            if (dbError) throw dbError;

            if (isAutoApproved) {
                // Update Profile: set is_verified to true AND update the followers count!
                await supabase
                    .from('profiles_influencer')
                    .update({
                        is_verified: true,
                        followers_count: finalFollowers
                    })
                    .eq('user_id', user.id);
            }

            setOcrStatus('submitted');
            
            // Clean up state after a few seconds
            setTimeout(() => {
                handleRemoveFile();
            }, 3000);

        } catch (err) {
            console.error("Submission Error:", err);
            setOcrStatus('failed'); // Simplified error handling
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent"
            >
                <div className="mb-8">
                    <h2 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-2">
                        <CheckCircle className="text-primary w-5 h-5" />
                        Verify Your Reach
                    </h2>
                    <p className="text-xs text-text-muted leading-relaxed uppercase tracking-widest font-bold opacity-70">
                        Upload a screenshot of your social media profile/insights page to verify your followers.
                    </p>
                </div>

                {/* Upload Area */}
                <div className="relative group">
                    {!previewUrl ? (
                        <label className={cn(
                            "flex flex-col items-center justify-center w-full h-64 rounded-3xl border-2 border-dashed transition-all cursor-pointer",
                            "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/40"
                        )}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <div className="p-4 rounded-2xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                                    <Upload size={28} />
                                </div>
                                <p className="mb-1 text-sm text-white font-bold">Click to upload screenshot</p>
                                <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">PNG, JPG or WEBP (Max. 5MB)</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    ) : (
                        <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-video bg-black/40 group">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                            {!isSubmitting && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={handleRemoveFile}
                                        className="p-3 rounded-full bg-rose-500 text-white shadow-xl hover:scale-110 transition-transform cursor-pointer"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* OCR Feedback & Action */}
                <div className="mt-8 space-y-6">
                    <AnimatePresence mode="wait">
                        {ocrStatus === 'scanning' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-4"
                            >
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                <div>
                                    <p className="text-xs font-bold text-white uppercase tracking-widest">Scanning Screenshot...</p>
                                    <p className="text-[10px] text-text-muted mt-0.5">Detecting platform and follower counts using OCR.space.</p>
                                </div>
                            </motion.div>
                        )}

                        {ocrStatus === 'submitted' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4"
                            >
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Submitted Successfully!</p>
                                    <p className="text-[10px] text-emerald-400/70 mt-0.5 font-bold">Your verification proof has been processed.</p>
                                </div>
                            </motion.div>
                        )}

                        {ocrStatus === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4"
                            >
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">AI Verification Successful</p>
                                    <p className="text-[10px] text-emerald-400/70 mt-0.5 font-bold">
                                        Detected: {extractedData.followers.toLocaleString()} {extractedData.platform === 'YouTube' ? 'Subscribers' : 'Followers'}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {ocrStatus === 'failed' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-5 rounded-2xl bg-rose-500/5  border border-rose-500/20"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">Verification Failed</p>
                                        <p className="text-[10px] text-rose-400/70 mt-0.5">{error || "We couldn't clearly detect your follower count."}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pl-9 space-y-2">
                                    <label className="text-xs text-text-muted uppercase tracking-widest font-bold">Please enter follower count manually:</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 15000"
                                        value={manualFollowers}
                                        onChange={(e) => setManualFollowers(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                    <p className="text-[10px] text-rose-400/50 italic">This will fall back to Admin manual review.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex flex-col gap-3">
                        {ocrStatus === 'success' ? (
                            <div className="flex flex-col gap-3">
                                <p className="text-sm text-center text-white font-medium mb-1">Is this information correct?</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all"
                                    >
                                        {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> ...</> : <><CheckCircle size={16} /> Yes, Auto-Verify</>}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setExtractedData({ followers: null, platform: null, handle: null });
                                            setOcrStatus('failed'); // Switch to manual fallback
                                        }}
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
                                    >
                                        <X size={16} /> No, there's a mistake
                                    </button>
                                </div>
                            </div>
                        ) : (ocrStatus === 'failed' && manualFollowers) ? (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-4 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg bg-white/10 hover:bg-white/20 border border-white/10 shadow-black/20"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                                ) : (
                                    <><Send size={16} /> Submit to Admin Review</>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleScan}
                                disabled={!file || ocrStatus === 'scanning'}
                                className={cn(
                                    "w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg",
                                    file && ocrStatus !== 'scanning'
                                        ? "bg-gradient-brand text-white shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
                                        : "bg-white/5 text-text-muted border border-white/5 cursor-not-allowed opacity-50"
                                )}
                            >
                                {ocrStatus === 'scanning' ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                ) : (
                                    <><ImageIcon size={16} /> Scan & Verify Screenshot</>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="pt-4 border-t border-white/5 text-center">
                        <p className="text-[10px] text-text-muted font-medium italic">
                            Tip: Make sure the follower count and profile handle are clearly visible.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
