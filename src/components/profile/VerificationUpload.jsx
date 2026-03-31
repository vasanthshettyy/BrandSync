// TODO: This file is no longer used. Delete in future cleanup.
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, 
    FileCheck, 
    X, 
    Loader2, 
    Instagram, 
    Youtube, 
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { useVerification } from '../../hooks/useVerification';
import { useAuth } from '../../context/AuthContext';
import { MICRO_INTERACTION, PREMIUM_SPRING } from '../../lib/motion';
import { cn } from '../../lib/utils';

/**
 * VerificationUpload — Drag-and-drop UI for Influencer verification proofs.
 */
export default function VerificationUpload({ onUploadSuccess }) {
    const { user } = useAuth();
    const { submitVerification } = useVerification();
    
    const [platform, setPlatform] = useState('instagram');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/')) {
                setError('Please upload an image file (PNG, JPG, etc.)');
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            if (!droppedFile.type.startsWith('image/')) {
                setError('Please upload an image file.');
                return;
            }
            setFile(droppedFile);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;
        
        setIsSubmitting(true);
        setError(null);
        
        try {
            await submitVerification(user.id, platform, file);
            setSuccess(true);
            setFile(null);
            if (onUploadSuccess) onUploadSuccess();
            
            // Reset success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Verification upload error:', err);
            setError('Failed to upload proof. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-display font-bold text-white tracking-tight">
                        Platform Verification
                    </h3>
                    <p className="text-zinc-500 text-xs mt-1">
                        Upload analytics screenshots to earn your verified badge.
                    </p>
                </div>
                
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    <motion.button
                        {...MICRO_INTERACTION}
                        onClick={() => setPlatform('instagram')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                            platform === 'instagram' 
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-lg shadow-rose-500/10" 
                                : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <Instagram size={14} />
                        Instagram
                    </motion.button>
                    <motion.button
                        {...MICRO_INTERACTION}
                        onClick={() => setPlatform('youtube')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                            platform === 'youtube' 
                                ? "bg-red-500/20 text-red-400 border border-red-500/20 shadow-lg shadow-red-500/10" 
                                : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <Youtube size={14} />
                        YouTube
                    </motion.button>
                </div>
            </div>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "relative aspect-[16/6] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden",
                    isDragging 
                        ? "border-indigo-500 bg-indigo-500/5" 
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]",
                    file && "border-emerald-500/30 bg-emerald-500/5"
                )}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept="image/*"
                />

                <AnimatePresence mode="wait">
                    {file ? (
                        <motion.div 
                            key="file-selected"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={PREMIUM_SPRING}
                            className="flex flex-col items-center text-center px-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                                <FileCheck size={24} />
                            </div>
                            <p className="text-sm font-bold text-white truncate max-w-[200px]">
                                {file.name}
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB • READY TO UPLOAD
                            </p>
                            <motion.button
                                {...MICRO_INTERACTION}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                }}
                                className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </motion.button>
                        </motion.div>
                    ) : success ? (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={PREMIUM_SPRING}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center mb-4 text-white shadow-lg shadow-emerald-500/20">
                                <CheckCircle2 size={24} />
                            </div>
                            <p className="text-sm font-bold text-emerald-400">
                                Upload Successful!
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">
                                Proof submitted for admin review
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="upload-prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={PREMIUM_SPRING}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-zinc-400 group-hover:text-white transition-colors">
                                <Upload size={24} />
                            </div>
                            <p className="text-sm font-bold text-zinc-300">
                                Click or drag screenshots
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">
                                PNG or JPG • Max 5MB
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            <motion.button
                disabled={!file || isSubmitting}
                {...MICRO_INTERACTION}
                onClick={handleSubmit}
                className={cn(
                    "w-full py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg",
                    file && !isSubmitting 
                        ? "bg-indigo-500 text-white shadow-indigo-500/20 hover:bg-indigo-600" 
                        : "bg-white/5 text-zinc-500 border border-white/5 cursor-not-allowed"
                )}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Uploading Proof...
                    </>
                ) : (
                    <>
                        <Upload size={16} />
                        Submit for Verification
                    </>
                )}
            </motion.button>
        </div>
    );
}
