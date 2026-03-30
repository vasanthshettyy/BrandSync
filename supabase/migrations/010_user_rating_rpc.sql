-- Phase 7: User Rating RPC
-- This migration creates a function to dynamically calculate a user's average rating and total reviews.

-- 1. Create the rating calculation function
CREATE OR REPLACE FUNCTION public.get_user_rating(p_user_id UUID)
RETURNS TABLE (avg_rating NUMERIC, total_reviews INTEGER) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        COALESCE(ROUND(AVG(rating)::NUMERIC, 1), 0.0) as avg_rating,
        COUNT(*)::INTEGER as total_reviews
    FROM public.reviews
    WHERE target_id = p_user_id;
$$;

-- 2. Grant execution permissions
-- Authenticated users (brands/influencers) can see ratings
GRANT EXECUTE ON FUNCTION public.get_user_rating(UUID) TO authenticated;
-- Anonymous users (for public profiles) can see ratings
GRANT EXECUTE ON FUNCTION public.get_user_rating(UUID) TO anon;

-- Add helpful comments to the database
COMMENT ON FUNCTION public.get_user_rating(UUID) IS 'Calculates the average rating and total count of reviews for a specific user.';
