import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import VerificationModerationPanel from '../../components/admin/VerificationModerationPanel';
import { Loader2, ShieldCheck } from 'lucide-react';

const AdminVerificationPage = () => {
  const [pendingProofs, setPendingProofs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingProofs = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('verification_proofs')
        .select(`
          id, 
          influencer_id, 
          platform, 
          proof_url, 
          submitted_at, 
          status,
          profiles_influencer (
            full_name
          )
        `)
        .eq('status', 'Pending')
        .order('submitted_at', { ascending: true });

      if (fetchError) throw fetchError;
      setPendingProofs(data || []);
    } catch (err) {
      console.error('Error fetching pending proofs:', err);
      setError('Failed to load verification queue.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProofs();
  }, []);

  const handleReview = async (proofId, newStatus, adminNotes) => {
    try {
      const { error: updateError } = await supabase
        .from('verification_proofs')
        .update({
          status: newStatus,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', proofId);

      if (updateError) throw updateError;

      // If approved, update the influencer's profile status
      if (newStatus === 'Approved') {
        const proof = pendingProofs.find(p => p.id === proofId);
        if (proof) {
          await supabase
            .from('profiles_influencer')
            .update({ is_verified: true })
            .eq('user_id', proof.influencer_id);
        }
      }

      // Remove from local list
      setPendingProofs(prev => prev.filter(p => p.id !== proofId));
    } catch (err) {
      console.error('Error reviewing proof:', err);
      throw err; // Let the component handle the UI error state
    }
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Trust & Safety</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Verification Queue</h1>
          <p className="text-zinc-500 text-sm">Review and moderate influencer analytics for account verification.</p>
        </div>
        
        {!isLoading && (
          <div className="bg-zinc-900 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider text-right leading-none">
              Pending<br/>Reviews
            </span>
            <span className="text-2xl font-black text-primary leading-none">
              {pendingProofs.length}
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 size={40} className="text-primary animate-spin" />
          <p className="text-zinc-500 font-medium">Loading queue...</p>
        </div>
      ) : error ? (
        <div className="p-12 text-center bg-rose-500/5 border border-rose-500/10 rounded-2xl">
          <p className="text-rose-400 font-medium">{error}</p>
          <button 
            onClick={fetchPendingProofs}
            className="mt-4 text-sm text-zinc-400 hover:text-white underline underline-offset-4"
          >
            Try Again
          </button>
        </div>
      ) : (
        <VerificationModerationPanel 
          pendingProofs={pendingProofs} 
          onReview={handleReview} 
        />
      )}
    </div>
  );
};

export default AdminVerificationPage;
