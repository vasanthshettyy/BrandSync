import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Globe, 
  FileText, 
  MapPin, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const BrandSettingsPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    location: '',
    website: '',
    description: ''
  });

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || '',
        industry: profile.industry || '',
        location: profile.location || '',
        website: profile.website || '',
        description: profile.description || ''
      });
    }
  }, [profile]);

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
        .from('profiles_brand')
        .update({
          company_name: formData.company_name,
          industry: formData.industry,
          location: formData.location,
          website: formData.website,
          description: formData.description,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (err) {
      console.error('Error updating brand settings:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Brand Settings</h1>
        <p className="text-zinc-500">Manage your company profile and public information.</p>
      </div>

      <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                <Building2 size={16} className="text-primary" />
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                name="company_name"
                type="text"
                required
                value={formData.company_name}
                onChange={handleChange}
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/5 text-white placeholder:text-zinc-700 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                <FileText size={16} className="text-primary" />
                Industry
              </label>
              <input
                name="industry"
                type="text"
                value={formData.industry}
                onChange={handleChange}
                placeholder="e.g. Fashion, Tech"
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/5 text-white placeholder:text-zinc-700 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                <MapPin size={16} className="text-primary" />
                Location
              </label>
              <input
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Mumbai, India"
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/5 text-white placeholder:text-zinc-700 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                <Globe size={16} className="text-primary" />
                Website
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">https://</span>
                <input
                  name="website"
                  type="url"
                  value={formData.website.replace(/^https?:\/\//, '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({ ...prev, website: val ? `https://${val}` : '' }));
                  }}
                  placeholder="www.company.com"
                  className="w-full pl-16 pr-4 py-3 rounded-xl bg-zinc-950 border border-white/5 text-white placeholder:text-zinc-700 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <FileText size={16} className="text-primary" />
              Company Description
            </label>
            <textarea
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell influencers about your brand, mission, and typical campaign goals..."
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/5 text-white placeholder:text-zinc-700 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg shadow-primary/20 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving...
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
    </div>
  );
};

export default BrandSettingsPage;
