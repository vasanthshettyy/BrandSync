import { supabase } from '../lib/supabase';

/**
 * useReviews — Trust & Reputation business logic.
 */
export function useReviews() {
    /**
     * Checks if a user can leave a review for a specific contract.
     * Must be Completed, user must be a party, and not already reviewed by this user.
     */
    async function canLeaveReview(contractId, userId) {
        try {
            // 1. Check contract status and participants
            const { data: contract, error: contractError } = await supabase
                .from('contracts')
                .select('id, status, brand_id, influencer_id')
                .eq('id', contractId)
                .single();

            if (contractError || !contract) return false;
            if (contract.status !== 'Completed') return false;
            if (contract.brand_id !== userId && contract.influencer_id !== userId) return false;

            // 2. Check if user already left a review
            const { data: existingReview, error: reviewError } = await supabase
                .from('reviews')
                .select('id')
                .eq('contract_id', contractId)
                .eq('reviewer_id', userId)
                .maybeSingle();

            if (reviewError) return false;
            return !existingReview;
        } catch (err) {
            console.error('Error in canLeaveReview:', err);
            return false;
        }
    }

    /**
     * Submits a new review and creates a notification for the target user.
     */
    async function submitReview(contractId, reviewerId, targetId, rating, comment, reviewerRole) {
        // 1. Insert review
        const { data: review, error: reviewError } = await supabase
            .from('reviews')
            .insert({
                contract_id: contractId,
                reviewer_id: reviewerId,
                target_id: targetId,
                rating,
                comment,
                reviewer_role: reviewerRole
            })
            .select()
            .single();

        if (reviewError) throw reviewError;

        // 2. Create notification for the target user
        const { error: notifError } = await supabase
            .from('notifications')
            .insert({
                user_id: targetId,
                type: 'review_received',
                title: 'New Review Received ⭐',
                message: 'You received a new rating!'
            });

        if (notifError) {
            console.error('Failed to create notification for review:', notifError);
            // We don't throw here to avoid failing the review submission itself
        }

        return review;
    }

    /**
     * Fetches the average rating and total reviews for a user.
     */
    async function getUserRating(userId) {
        const { data, error } = await supabase.rpc('get_user_rating', { 
            p_user_id: userId 
        });

        if (error) throw error;
        
        // Return default values if data is null or empty
        return {
            avg_rating: data?.[0]?.avg_rating || 0,
            total_reviews: data?.[0]?.total_reviews || 0
        };
    }

    return {
        canLeaveReview,
        submitReview,
        getUserRating
    };
}
