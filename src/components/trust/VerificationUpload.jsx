// TODO: This file is no longer used. Delete in future cleanup.
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  AlertCircle, 
  Camera, 
  Youtube, 
  Loader2, 
  X, 
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';

const VerificationUpload = ({ influencerId, onUploadComplete }) => {
  const [platform, setPlatform] = useState('instagram');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload an image file (PNG, JPG).');
        setFile(null);
        return;
      }
      
      // Limit file size to 5MB for MVP
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const mockUploadProcess = () => new Promise((resolve) => setTimeout(resolve, 2000));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Internal logic constraint: Mocking the upload process
      await mockUploadProcess();
      
      onUploadComplete({ 
        platform, 
        proof_url: 'mock_url_path' 
      });
      
      setFile(null);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-zinc-900 border border-white/10 rounded-xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <ImageIcon size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Verification Proof</h3>
          <p className="text-xs text-zinc-500">Upload analytics to verify your reach</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Platform Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-400">Select Platform</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPlatform('instagram')}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all",
                platform === 'instagram' 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/10"
              )}
            >
              <Camera size={18} />
              <span className="font-medium">Instagram</span>
            </button>
            <button
              type="button"
              onClick={() => setPlatform('youtube')}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all",
                platform === 'youtube' 
                  ? "bg-rose-500/10 border-rose-500 text-rose-500" 
                  : "bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/10"
              )}
            >
              <Youtube size={18} />
              <span className="font-medium">YouTube</span>
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-400">Analytics Screenshot</label>
          <div 
            onClick={triggerFileInput}
            className={cn(
              "relative group cursor-pointer border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-3",
              file 
                ? "border-emerald-500/30 bg-emerald-500/5" 
                : "border-white/10 bg-zinc-950 hover:border-white/20 hover:bg-zinc-900/50"
            )}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept="image/*"
            />
            
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div 
                  key="file-selected"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                    <Check size={24} />
                  </div>
                  <p className="text-sm text-zinc-200 font-medium truncate max-w-[220px]">
                    {file.name}
                  </p>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-xs text-zinc-500 hover:text-rose-400 underline underline-offset-2 transition-colors"
                  >
                    Change file
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="no-file"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="p-3 rounded-full bg-white/5 text-zinc-500 group-hover:text-primary transition-colors">
                    <UploadCloud size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-zinc-300 font-medium">Click to upload screenshot</p>
                    <p className="text-xs text-zinc-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2"
          >
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isUploading || !file}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-bold transition-all shadow-lg",
            file && !isUploading 
              ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20 active:scale-95" 
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Verifying Proof...
            </>
          ) : (
            <>
              <Check size={18} />
              Submit Proof
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default VerificationUpload;
