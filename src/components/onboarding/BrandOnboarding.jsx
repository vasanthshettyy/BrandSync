import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import StepIndicator from '../../components/onboarding/StepIndicator';
import { INDUSTRIES, INDIAN_CITIES } from '../../lib/constants';
import {
    Building2, MapPin, Briefcase, Upload, Globe, FileText,
    Loader2, ArrowRight, ArrowLeft, Check,
} from 'lucide-react';

const STEPS = ['Company Info', 'Branding', 'Description'];

export default function BrandOnboarding() {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1 fields
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('');
    const [location, setLocation] = useState('');

    // Step 2 fields
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [website, setWebsite] = useState('');

    // Step 3 fields
    const [description, setDescription] = useState('');

    function handleLogoChange(e) {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    }

    function canProceed() {
        if (step === 1) return companyName.trim() && industry && location;
        if (step === 2) return logoFile || logoPreview;
        if (step === 3) return description.trim().length >= 50;
        return false;
    }

    async function handleNext() {
        if (step < 3) {
            setStep(step + 1);
            return;
        }

        // Final step — save everything
        setLoading(true);
        setError('');

        try {
            let logoUrl = '';

            // Upload logo
            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop();
                const filePath = `${user.id}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('logos')
                    .upload(filePath, logoFile, { cacheControl: '3600', upsert: true });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('logos')
                    .getPublicUrl(filePath);
                logoUrl = publicUrl;
            }

            // Update brand profile
            const { error: updateError } = await supabase
                .from('profiles_brand')
                .update({
                    company_name: companyName.trim(),
                    industry,
                    location,
                    logo_url: logoUrl,
                    website: website.trim() || null,
                    description: description.trim(),
                    onboarding_complete: true,
                })
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            await refreshProfile();
            navigate('/brand/dashboard');
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, var(--color-surface-900) 0%, #1a0a2e 50%, var(--color-surface-900) 100%)' }}
        >
            <div className="glass-card w-full max-w-lg p-8 fade-slide-up">
                <h2 className="text-2xl font-display font-bold text-center mb-1">Set Up Your Brand Profile</h2>
                <p className="text-text-secondary text-sm text-center mb-6">Complete these steps to start posting campaigns</p>

                <StepIndicator steps={STEPS} currentStep={step} />

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                        {error}
                    </div>
                )}

                {/* Step 1: Company Info */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-slide-up">
                        <div className="stagger-1 animate-in fade-slide-up">
                            <label htmlFor="companyName" className="text-sm font-medium text-text-secondary mb-1.5 block">Company Name *</label>
                            <div className="relative group">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                <input
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    placeholder="Your Company Name"
                                />
                            </div>
                        </div>

                        <div className="stagger-2 animate-in fade-slide-up">
                            <label htmlFor="industry" className="text-sm font-medium text-text-secondary mb-1.5 block">Industry *</label>
                            <div className="relative group">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                <select
                                    id="industry"
                                    name="industry"
                                    value={industry}
                                    onChange={e => setIndustry(e.target.value)}
                                    className="appearance-none cursor-pointer"
                                >
                                    <option value="">Select industry</option>
                                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="stagger-3 animate-in fade-slide-up">
                            <label htmlFor="location" className="text-sm font-medium text-text-secondary mb-1.5 block">Location *</label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                <select
                                    id="location"
                                    name="location"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    className="appearance-none cursor-pointer"
                                >
                                    <option value="">Select city</option>
                                    {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Branding */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-slide-up">
                        <div className="stagger-1 animate-in fade-slide-up">
                            <label className="text-sm font-medium text-text-secondary mb-1.5 block">Company Logo *</label>
                            <div className="flex items-center gap-6">
                                <label htmlFor="logo" className="group relative flex flex-col items-center justify-center w-32 h-32 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-primary/50 transition-all cursor-pointer overflow-hidden shadow-xl">
                                    {logoPreview ? (
                                        <>
                                            <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Upload className="w-6 h-6 text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Upload className="w-8 h-8 text-text-muted mb-2 group-hover:text-primary transition-colors" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Upload Logo</span>
                                        </div>
                                    )}
                                    <input id="logo" name="logo" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                                </label>
                                <div className="flex-1 space-y-1">
                                    <h4 className="text-sm font-bold text-text-primary">Logo Guidelines</h4>
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        Use a high-quality SVG or PNG (min 400x400px). Square logos work best for profiles.
                                    </p>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2">Max Size: 2MB</p>
                                </div>
                            </div>
                        </div>

                        <div className="stagger-2 animate-in fade-slide-up">
                            <label htmlFor="website" className="text-sm font-medium text-text-secondary mb-1.5 block">Website (Optional)</label>
                            <div className="relative group">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                <input
                                    id="website"
                                    name="website"
                                    type="url"
                                    value={website}
                                    onChange={e => setWebsite(e.target.value)}
                                    placeholder="https://yourcompany.com"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Description */}
                {step === 3 && (
                    <div className="space-y-4 animate-in fade-slide-up">
                        <div className="stagger-1 animate-in fade-slide-up">
                            <label htmlFor="description" className="text-sm font-medium text-text-secondary mb-1.5 block flex justify-between">
                                About Your Company * 
                                <span className={description.length >= 50 ? 'text-emerald-500' : 'text-text-muted'}>
                                    {description.length}/500
                                </span>
                            </label>
                            <div className="relative group">
                                <FileText className="absolute left-3 top-3 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                <textarea
                                    id="description"
                                    name="description"
                                    value={description}
                                    onChange={e => setDescription(e.target.value.slice(0, 500))}
                                    rows={6}
                                    className="pl-10 resize-none"
                                    placeholder="Tell influencers about your brand vision, target audience, and why they should partner with you..."
                                />
                            </div>
                            {description.length > 0 && description.length < 50 && (
                                <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-2">
                                    Need {50 - description.length} more characters to build trust.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center gap-3 mt-8">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="btn-secondary flex items-center gap-2 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!canProceed() || loading}
                        className="btn-primary flex-1 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:active:scale-100"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Finalizing...</>
                        ) : step === 3 ? (
                            <><Check className="w-4 h-4 group-hover:scale-110 transition-transform" /> Start Growing</>
                        ) : (
                            <>Next <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
