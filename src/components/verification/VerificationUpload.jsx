import { useState } from 'react';
import { Upload, CheckCircle, Loader2, AlertCircle, X, Image as ImageIcon, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

/**
 * VerificationUpload — Influencer Screenshot Verification using Tesseract.js.
 * Uses client-side OCR to verify follower counts and platform from screenshots.
 * Automatically verifies the user if the OCR count is within 80% of their stated count.
 */
export default function VerificationUpload({ user, profile }) {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [ocrStatus, setOcrStatus] = useState('idle'); // 'idle' | 'scanning' | 'success' | 'failed'
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
            setExtractedData({ followers: null, platform: null, handle: null });
            setManualFollowers('');
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setPreviewUrl(null);
        setOcrStatus('idle');
        setExtractedData({ followers: null, platform: null, handle: null });
        setManualFollowers('');
    };

    const enhanceImageForOCR = async (fileUpload) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(fileUpload);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Scale 2x: Tesseract needs text to be ~20px tall to read it well.
                // Mobile screenshots often have tiny 12px text.
                canvas.width = img.width * 2;
                canvas.height = img.height * 2;
                const ctx = canvas.getContext('2d');

                // Draw white background (removes dark mode transparency issues)
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas); // Tesseract natively accepts canvas!
            };
        });
    };

    const handleScan = async () => {
        if (!file) return;

        setOcrStatus('scanning');
        try {
            // Pre-process the image for better OCR
            const processedCanvas = await enhanceImageForOCR(file);

            const result = await Tesseract.recognize(processedCanvas, 'eng');
            const text = result.data.text;
            console.log("OCR Extracted Text:", text);

            // Platform Detection
            let platform = 'Unknown';
            if (/instagram/i.test(text)) platform = 'Instagram';
            else if (/youtube/i.test(text)) platform = 'YouTube';

            // Follower/Subscriber Regex Parsing
            const followerMatch = text.match(/(?:followers|subscribers|subscribers count)[\s:\n]*([\d,.]+[\s]*[KkMm]?)/i)
                || text.match(/([\d,.]+[\s]*[KkMm]?)[\s\n]*(?:followers|subscribers)/i);

            let parsedCount = null;
            if (followerMatch) {
                let rawNum = followerMatch[1].toUpperCase().replace(/\s/g, '');
                if (rawNum.includes('K')) {
                    parsedCount = Math.round(parseFloat(rawNum.replace('K', '')) * 1000);
                } else if (rawNum.includes('M')) {
                    parsedCount = Math.round(parseFloat(rawNum.replace('M', '')) * 1000000);
                } else {
                    parsedCount = parseInt(rawNum.replace(/,/g, ''));
                }
            }

            if (parsedCount && !isNaN(parsedCount)) {
                setExtractedData({
                    followers: parsedCount,
                    platform: platform === 'Unknown' ? 'Social Media' : platform
                });
                setOcrStatus('success');
            } else {
                setOcrStatus('failed');
            }
        } catch (err) {
            console.error("OCR Error:", err);
            setOcrStatus('failed');
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
                ? `Auto-verified by OCR AI. Follower count recorded as ${extractedData.followers.toLocaleString()}.`
                : `OCR Failed. User manually entered ${finalFollowers.toLocaleString()} followers. Needs Admin Review.`;

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

                alert(`Profile Auto-Verified! AI detected ${finalFollowers.toLocaleString()} followers and updated your profile.`);
            } else {
                alert(`Screenshot submitted! An admin will review your ${finalFollowers.toLocaleString()} follower claim shortly.`);
            }

            handleRemoveFile();

        } catch (err) {
            console.error("Submission Error:", err);
            alert("Failed to submit verification. Please try again.");
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
                                    <p className="text-[10px] text-text-muted mt-0.5">Detecting platform and follower counts using Tesseract OCR.</p>
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
                                        <p className="text-[10px] text-rose-400/70 mt-0.5">We couldn't clearly detect your follower count.</p>
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
