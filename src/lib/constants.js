// ============================
// BrandSync Constants & Enums
// ============================

export const NICHES = [
    'Fashion', 'Tech', 'Food', 'Fitness', 'Travel',
    'Lifestyle', 'Education', 'Beauty', 'Gaming',
    'Finance', 'Health', 'Parenting', 'Other',
];

export const LANGUAGES = [
    'Hindi', 'English', 'Tamil', 'Telugu', 'Marathi',
    'Bengali', 'Kannada', 'Gujarati', 'Malayalam',
    'Punjabi', 'Odia', 'Urdu', 'Other',
];

export const INDIAN_CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
    'Chandigarh', 'Kochi', 'Indore', 'Bhopal', 'Nagpur',
    'Surat', 'Vadodara', 'Thiruvananthapuram', 'Coimbatore',
    'Visakhapatnam', 'Patna', 'Ranchi', 'Guwahati', 'Mysore',
    'Noida', 'Gurgaon', 'Other',
];

export const FOLLOWER_TIERS = {
    nano: { label: 'Nano (1K-10K)', min: 1000, max: 10000 },
    micro: { label: 'Micro (10K-100K)', min: 10000, max: 100000 },
    macro: { label: 'Macro (100K-500K)', min: 100000, max: 500000 },
    mega: { label: 'Mega (500K+)', min: 500000, max: 999999999 },
};

export const PLATFORMS = ['Instagram', 'YouTube', 'Both'];

export const INDUSTRIES = [
    'E-commerce', 'Fashion', 'Food & Beverage', 'Health & Wellness',
    'Technology', 'Education', 'Finance', 'Real Estate',
    'Travel & Hospitality', 'Beauty & Personal Care',
    'Entertainment', 'Sports', 'Automotive', 'Other',
];

export const MILESTONE_NAMES = ['Script', 'Draft', 'Final'];

export const PROPOSAL_STATUSES = ['Pending', 'Accepted', 'Rejected', 'Withdrawn'];
export const CONTRACT_STATUSES = ['Active', 'Completed', 'Cancelled', 'Disputed'];
export const MILESTONE_STATUSES = ['Pending', 'Submitted', 'In_Review', 'Approved', 'Revision_Requested'];
export const GIG_STATUSES = ['Open', 'Closed', 'Cancelled'];

// Status color mapping for badges
export const STATUS_COLORS = {
    // Proposals
    Pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Accepted: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    Withdrawn: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    // Gigs
    Open: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Closed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    Cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    // Contracts
    Active: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Disputed: 'bg-red-500/10 text-red-500 border-red-500/20',
    // Milestones
    Submitted: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    In_Review: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Revision_Requested: 'bg-red-500/10 text-red-500 border-red-500/20',
};
