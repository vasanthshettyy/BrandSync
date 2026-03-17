import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import StepIndicator from '../../components/onboarding/StepIndicator';
import { NICHES, LANGUAGES, INDIAN_CITIES, PLATFORMS } from '../../lib/constants';
import {
    User, MapPin, Languages, Upload, Instagram, Youtube,
    Users, TrendingUp, IndianRupee, FileText,
    Loader2, ArrowRight, ArrowLeft, Check,
} from 'lucide-react';

const STEPS = ['Personal Info', 'Social Stats', 'Pricing & Bio'];

export default function InfluencerOnboarding() {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1
    const [fullName, setFullName] = useState('');
    const [city, setCity] = useState('');
    const [language, setLanguage] = useState('');

    // Step 2
    const [platformPrimary, setPlatformPrimary] = useState('');
    const [instagramHandle, setInstagramHandle] = useState('');
    const [youtubeHandle, setYoutubeHandle] = useState('');
    const [followersCount, setFollowersCount] = useState('');
    const [engagementRate, setEngagementRate] = useState('');

    // Step 3
    const [niche, setNiche] = useState('');
    const [pricePerPost, setPricePerPost] = useState('');
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    function handleAvatarChange(e) {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    }

    function canProceed() {
        if (step === 1) return fullName.trim() && city && language;
        if (step === 2) {
            const hasHandle = platformPrimary === 'Instagram' ? instagramHandle.trim()
                : platformPrimary === 'YouTube' ? youtubeHandle.trim()
                    : instagramHandle.trim() || youtubeHandle.trim();
            return platformPrimary && hasHandle && Number(followersCount) > 0;
        }
        if (step === 3) return niche && Number(pricePerPost) >= 100 && bio.trim().length >= 50;
        return false;
    }

    async function handleNext() {
        if (step < 3) {
            setStep(step + 1);
            return;
        }

        setLoading(true);
        setError('');

        try {
            let avatarUrl = '';

            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const filePath = `${user.id}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile, { cacheControl: '3600', upsert: true });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);
                avatarUrl = publicUrl;
            }

            const { error: updateError } = await supabase
                .from('profiles_influencer')
                .update({
                    full_name: fullName.trim(),
                    city,
                    language,
                    platform_primary: platformPrimary.toLowerCase(),
                    instagram_handle: instagramHandle.trim() || null,
                    youtube_handle: youtubeHandle.trim() || null,
                    followers_count: parseInt(followersCount),
                    engagement_rate: parseFloat(engagementRate) || 0,
                    niche,
                    price_per_post: parseFloat(pricePerPost),
                    bio: bio.trim(),
                    avatar_url: avatarUrl || null,
                    onboarding_complete: true,
                })
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            await refreshProfile();
            navigate('/influencer/dashboard');
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
                <h2 className="text-2xl font-display font-bold text-center mb-1">Set Up Your Creator Profile</h2>
                <p className="text-text-secondary text-sm text-center mb-6">Showcase your best to brands</p>

                <StepIndicator steps={STEPS} currentStep={step} />

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Step 1: Personal Info */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-slide-up">
                        <div className="stagger-1 animate-in fade-slide-up">
                            <label htmlFor="fullName" className="text-sm font-medium text-text-secondary mb-1.5 block">Full Name *</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                />
                            </div>
                        </div>

                        <div className="stagger-2 animate-in fade-slide-up">
                            <label htmlFor="city" className="text-sm font-medium text-text-secondary mb-1.5 block">City *</label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                <select
                                    id="city"
                                    name="city"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    className="appearance-none cursor-pointer"
                                >
                                    <option value="">Select city</option>
                                    {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="stagger-3 animate-in fade-slide-up">
                            <label htmlFor="language" className="text-sm font-medium text-text-secondary mb-1.5 block">Primary Language *</label>
                            <div className="relative group">
                                <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                <select
                                    id="language"
                                    name="language"
                                    value={language}
                                    onChange={e => setLanguage(e.target.value)}
                                    className="appearance-none cursor-pointer"
                                >
                                    <option value="">Select language</option>
                                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Social Stats */}
                {step === 2 && (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <label className="text-sm text-text-secondary mb-1.5 block">Primary Platform *</label>
                            <div className="flex gap-2">
                                {PLATFORMS.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPlatformPrimary(p)}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${platformPrimary === p
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border-dark hover:border-primary/30 text-text-secondary'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {(platformPrimary === 'Instagram' || platformPrimary === 'Both') && (
                            <div>
                                <label htmlFor="instagramHandle" className="text-sm text-text-secondary mb-1.5 block">Instagram Handle *</label>
                                <div className="relative">
                                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        id="instagramHandle"
                                        name="instagramHandle"
                                        type="text"
                                        value={instagramHandle}
                                        onChange={e => setInstagramHandle(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors"
                                        placeholder="@yourhandle"
                                    />
                                </div>
                            </div>
                        )}

                        {(platformPrimary === 'YouTube' || platformPrimary === 'Both') && (
                            <div>
                                <label htmlFor="youtubeHandle" className="text-sm text-text-secondary mb-1.5 block">YouTube Channel *</label>
                                <div className="relative">
                                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        id="youtubeHandle"
                                        name="youtubeHandle"
                                        type="text"
                                        value={youtubeHandle}
                                        onChange={e => setYoutubeHandle(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors"
                                        placeholder="Channel name or URL"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="followersCount" className="text-sm text-text-secondary mb-1.5 block">Followers *</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        id="followersCount"
                                        name="followersCount"
                                        type="number"
                                        value={followersCount}
                                        onChange={e => setFollowersCount(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors"
                                        placeholder="e.g. 15000"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="engagementRate" className="text-sm text-text-secondary mb-1.5 block">Eng. Rate (%)</label>
                                <div className="relative">
                                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        id="engagementRate"
                                        name="engagementRate"
                                        type="number"
                                        value={engagementRate}
                                        onChange={e => setEngagementRate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors"
                                        placeholder="e.g. 3.5"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Pricing & Bio */}
                {step === 3 && (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <label className="text-sm text-text-secondary mb-1.5 block">Profile Photo</label>
                            <div className="flex items-center gap-4">
                                <label htmlFor="avatar" className="w-20 h-20 rounded-full border-2 border-dashed border-border-dark hover:border-primary/50 transition-colors cursor-pointer overflow-hidden flex items-center justify-center">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <Upload className="w-5 h-5 text-text-muted" />
                                    )}
                                    <input id="avatar" name="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                </label>
                                <span className="text-xs text-text-muted">JPG or PNG • Max 2MB</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="niche" className="text-sm text-text-secondary mb-1.5 block">Niche *</label>
                                <select
                                    id="niche"
                                    name="niche"
                                    value={niche}
                                    onChange={e => setNiche(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="">Select niche</option>
                                    {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="pricePerPost" className="text-sm text-text-secondary mb-1.5 block">Price/Post (₹) *</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        id="pricePerPost"
                                        name="pricePerPost"
                                        type="number"
                                        value={pricePerPost}
                                        onChange={e => setPricePerPost(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors"
                                        placeholder="e.g. 2000"
                                        min="100"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="bio" className="text-sm text-text-secondary mb-1.5 block">
                                Bio * <span className="text-text-muted">({bio.length}/300)</span>
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={bio}
                                    onChange={e => setBio(e.target.value.slice(0, 300))}
                                    rows={4}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors resize-none"
                                    placeholder="Tell brands about yourself, your content style, and why they should work with you... (min. 50 characters)"
                                />
                            </div>
                            {bio.length > 0 && bio.length < 50 && (
                                <p className="text-xs text-amber-400 mt-1">{50 - bio.length} more characters needed</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center gap-3 mt-6">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-2 px-4 py-2.5 border border-border-dark rounded-lg text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!canProceed() || loading}
                        className="flex-1 py-2.5 bg-gradient-brand text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                        ) : step === 3 ? (
                            <><Check className="w-4 h-4" /> Complete Setup</>
                        ) : (
                            <>Next <ArrowRight className="w-4 h-4" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
