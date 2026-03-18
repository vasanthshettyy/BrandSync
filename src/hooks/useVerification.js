import { supabase } from '../lib/supabase';

/**
 * useVerification — Identity and platform verification logic.
 */
export function useVerification() {
    /**
     * Submits a verification proof by uploading a file to storage
     * and recording it in the database.
     */
    async function submitVerification(userId, platform, file) {
        // 1. Upload file to Supabase Storage
        const fileName = `${userId}/${platform}_${Date.now()}.png`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
            .from('verification-proofs')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get the public URL of the uploaded file
        const { data: { publicUrl } } = supabase.storage
            .from('verification-proofs')
            .getPublicUrl(filePath);

        // 3. Record the verification proof in the database
        const { data, error: dbError } = await supabase
            .from('verification_proofs')
            .insert({
                influencer_id: userId,
                platform,
                proof_url: publicUrl,
                status: 'Pending'
            })
            .select()
            .single();

        if (dbError) throw dbError;

        return data;
    }

    return {
        submitVerification
    };
}
