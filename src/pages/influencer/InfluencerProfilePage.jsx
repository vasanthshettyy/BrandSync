import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  IndianRupee, 
  Instagram, 
  Youtube, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Target,
  ShieldCheck,
  RefreshCcw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import VerificationUpload from '../../components/verification/VerificationUpload';
import VerificationStatus from '../../components/trust/VerificationStatus';

const InfluencerProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [proofs, setProofs] = useState([]);
  const [loadingProofs, setLoadingProofs] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    niche: '',
    city: '',
    bio: '',
    instagram_handle: '',
    youtube_handle: '',
    price_per_post: ''
  });

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        niche: profile.niche || '',
        city: profile.city || '',
        bio: profile.bio || '',
        instagram_handle: profile.instagram_handle || '',
        youtube_handle: profile.youtube_handle || '',
        price_per_post: profile.price_per_post || ''
      });
      fetchProofs();
    }
  }, [profile]);

  const fetchProofs = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('verification_proofs')
        .select('*')
        .eq('influencer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProofs(data || []);
    } catch (err) {
      console.error('Error fetching proofs:', err);
    } finally {
      setLoadingProofs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message) setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles_influencer')
        .update({
          full_name: formData.full_name,
          niche: formData.niche,
          city: formData.city,
          bio: formData.bio,
          instagram_handle: formData.instagram_handle,
          youtube_handle: formData.youtube_handle,
          price_per_post: parseFloat(formData.price_per_post) || 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Error updating influencer profile:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Manage Profile</h1>
        <p className="text-zinc-500">Update your professional details and social media links.</p>
      </div>

      {/* Status Message */}
      {message && (
        <div className={cn(
          "p-4 rounded-xl border flex items-center gap-3 animate-in zoom-in-95 duration-300",
          message.type === 'success' 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        )}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Basic Details */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl p-6 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <User size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-white">Basic Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-400">Full Name <span className="text-rose-500">*</span></label>
              <input
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Your professional name"
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/5 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-400">Niche / Category</label>
              <input
                name="niche"
                value={formData.niche}
                onChange={handleChange}
                placeholder="e.g. Fashion, Tech, Travel"
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/5 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
                <MapPin size={14} /> City
              </label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Mumbai"
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/5 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
              <FileText size={14} /> Bio
            </label>
            <textarea
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell brands about yourself and the value you bring..."
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/5 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
          </div>
        </div>

        {/* Card 2: Social & Pricing */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl p-6 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Target size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-white">Social & Pricing</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
                <Instagram size={14} className="text-pink-500" /> Instagram Handle
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">@</span>
                <input
                  name="instagram_handle"
                  value={formData.instagram_handle.replace('@', '')}
                  onChange={handleChange}
                  placeholder="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-white/5 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
                <Youtube size={14} className="text-rose-500" /> YouTube Handle
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">@</span>
                <input
                  name="youtube_handle"
                  value={formData.youtube_handle.replace('@', '')}
                  onChange={handleChange}
                  placeholder="channel_id"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-white/5 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
                <IndianRupee size={14} className="text-emerald-500" /> Price Per Post
              </label>
              <input
                name="price_per_post"
                type="number"
                value={formData.price_per_post}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/5 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Verification Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              <h2 className="text-lg font-bold text-white tracking-tight">Trust & Verification</h2>
            </div>
            {proofs.length > 0 && (
              <button 
                type="button"
                onClick={fetchProofs}
                className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 transition-colors"
                title="Refresh status"
              >
                <RefreshCcw size={14} className={cn(loadingProofs && "animate-spin")} />
              </button>
            )}
          </div>

          {/* Only show status list if there are actual proofs to show */}
          {proofs.length > 0 && <VerificationStatus proofs={proofs} />}

          {/* Show Upload UI if not verified OR if they have no proofs at all OR if a proof was rejected */}
          {(!profile?.is_verified || proofs.length === 0 || proofs.some(p => p.status === 'Rejected')) && (
            <div className={cn(proofs.length > 0 && "pt-6 border-t border-white/5")}>
              {proofs.length > 0 && (
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4 px-1">
                  Submit New Evidence
                </p>
              )}
              <VerificationUpload user={user} profile={profile} onUploadSuccess={fetchProofs} />
            </div>
          )}

          {/* Success state for verified users with no pending rejections */}
          {profile?.is_verified && proofs.every(p => p.status !== 'Rejected') && (
            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold">You are Verified</h4>
                <p className="text-sm text-zinc-400">Your reach has been confirmed by our AI and moderation team.</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg shadow-primary/20 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InfluencerProfilePage;
