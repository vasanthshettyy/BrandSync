-- Phase 8: Notification System
-- Enable pg_net for edge function calls if available
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. Helper Function: Send Notification Email (Placeholder trigger for Edge Function)
-- This expects a 'send-email' Edge Function to be deployed
CREATE OR REPLACE FUNCTION public.notify_send_email(
    p_to_email TEXT,
    p_template TEXT,
    p_data JSONB
)
RETURNS VOID AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
        PERFORM net.http_post(
            url := 'https://qyrtkrzsrbmumgbwdojl.supabase.co/functions/v1/send-email',
            headers := '{"Content-Type": "application/json"}'::jsonb,
            body := json_build_object(
                'to', p_to_email,
                'template', p_template,
                'data', p_data
            )::jsonb
        );
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Silently fail to not block the main transaction
    RAISE NOTICE 'Failed to send notification email: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger: notify_on_new_proposal (Refined)
CREATE OR REPLACE FUNCTION public.notify_on_new_proposal()
RETURNS TRIGGER AS $$
DECLARE
    v_brand_id UUID;
    v_brand_email TEXT;
    v_gig_title TEXT;
BEGIN
    -- Get the brand_id, email, and gig title
    SELECT g.brand_id, u.email, g.title 
    INTO v_brand_id, v_brand_email, v_gig_title
    FROM gigs g 
    JOIN users u ON g.brand_id = u.user_id
    WHERE g.id = NEW.gig_id;

    -- Insert notification
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
        v_brand_id,
        'New Application Received 📥',
        'Someone applied to your gig: ' || v_gig_title,
        'proposal_received',
        '/brand/gigs/' || NEW.gig_id || '/applications'
    );

    -- Trigger email
    PERFORM public.notify_send_email(
        v_brand_email,
        'proposal_received',
        json_build_object('gig_title', v_gig_title)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger: notify_on_proposal_update
CREATE OR REPLACE FUNCTION public.notify_on_proposal_update()
RETURNS TRIGGER AS $$
DECLARE
    v_influencer_email TEXT;
    v_gig_title TEXT;
    v_title TEXT;
    v_message TEXT;
    v_template TEXT;
    v_should_notify BOOLEAN := FALSE;
BEGIN
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;

    -- Get influencer email and gig title
    SELECT u.email, g.title 
    INTO v_influencer_email, v_gig_title
    FROM gigs g 
    JOIN users u ON NEW.influencer_id = u.user_id
    WHERE g.id = NEW.gig_id;

    IF NEW.status = 'Accepted' THEN
        v_title := 'Proposal Accepted! 🎉';
        v_message := 'Your proposal for "' || v_gig_title || '" was accepted!';
        v_template := 'proposal_accepted';
        v_should_notify := TRUE;
    ELSIF NEW.status = 'Rejected' THEN
        v_title := 'Proposal Update';
        v_message := 'Your proposal for "' || v_gig_title || '" was not accepted this time.';
        v_template := 'proposal_rejected';
        v_should_notify := TRUE;
    END IF;

    IF v_should_notify THEN
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            NEW.influencer_id,
            v_title,
            v_message,
            'proposal_update',
            '/influencer/proposals'
        );

        -- Send email for acceptance
        IF NEW.status = 'Accepted' THEN
            PERFORM public.notify_send_email(
                v_influencer_email,
                v_template,
                json_build_object('gig_title', v_gig_title)
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger: notify_on_milestone_update
CREATE OR REPLACE FUNCTION public.notify_on_milestone_update()
RETURNS TRIGGER AS $$
DECLARE
    v_recipient_id UUID;
    v_recipient_email TEXT;
    v_title TEXT;
    v_message TEXT;
    v_link TEXT;
    v_template TEXT;
    v_should_notify BOOLEAN := FALSE;
    v_influencer_id UUID;
    v_brand_id UUID;
BEGIN
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;

    -- Get contract parties
    SELECT influencer_id, brand_id 
    INTO v_influencer_id, v_brand_id
    FROM contracts WHERE id = NEW.contract_id;

    IF NEW.status = 'Submitted' THEN
        -- Notify Brand
        v_recipient_id := v_brand_id;
        v_title := 'New Submission';
        v_message := 'A new submission is ready for your review: ' || NEW.milestone_name;
        v_link := '/brand/contracts/' || NEW.contract_id;
        v_template := 'milestone_submitted';
        v_should_notify := TRUE;
    ELSIF NEW.status = 'Approved' THEN
        -- Notify Influencer
        v_recipient_id := v_influencer_id;
        v_title := 'Milestone Approved ✅';
        v_message := 'Your ' || NEW.milestone_name || ' has been approved!';
        v_link := '/influencer/contracts/' || NEW.contract_id;
        v_template := 'milestone_approved';
        v_should_notify := TRUE;
    ELSIF NEW.status = 'Revision_Requested' THEN
        -- Notify Influencer
        v_recipient_id := v_influencer_id;
        v_title := 'Revision Requested';
        v_message := 'The brand requested revisions for ' || NEW.milestone_name;
        v_link := '/influencer/contracts/' || NEW.contract_id;
        v_template := 'revision_requested';
        v_should_notify := TRUE;
    END IF;

    IF v_should_notify THEN
        SELECT email INTO v_recipient_email FROM users WHERE user_id = v_recipient_id;

        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (v_recipient_id, v_title, v_message, 'milestone_update', v_link);

        PERFORM public.notify_send_email(
            v_recipient_email,
            v_template,
            json_build_object('milestone_name', NEW.milestone_name)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger: notify_on_contract_completed
CREATE OR REPLACE FUNCTION public.notify_on_contract_completed()
RETURNS TRIGGER AS $$
DECLARE
    v_influencer_email TEXT;
    v_brand_email TEXT;
BEGIN
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        -- Get emails
        SELECT email INTO v_influencer_email FROM users WHERE user_id = NEW.influencer_id;
        SELECT email INTO v_brand_email FROM users WHERE user_id = NEW.brand_id;

        -- Notify Influencer
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            NEW.influencer_id,
            'Contract Completed! 🎉',
            'Well done! The contract is marked as completed.',
            'contract_completed',
            '/influencer/contracts/' || NEW.id
        );

        -- Notify Brand
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            NEW.brand_id,
            'Contract Completed! 🎉',
            'Contract is successfully completed. Don''t forget to leave a review!',
            'contract_completed',
            '/brand/contracts/' || NEW.id
        );

        -- Send emails
        PERFORM public.notify_send_email(v_influencer_email, 'contract_completed', json_build_object());
        PERFORM public.notify_send_email(v_brand_email, 'contract_completed', json_build_object());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger: notify_on_review_received
CREATE OR REPLACE FUNCTION public.notify_on_review_received()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
        NEW.target_id,
        'New Review Received ⭐',
        'You received a ' || NEW.rating || '-star review.',
        'review_received',
        '/profile'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Triggers
-- trg_notify_new_proposal (Already exists, but refined above)
DROP TRIGGER IF EXISTS trg_notify_new_proposal ON proposals;
CREATE TRIGGER trg_notify_new_proposal
    AFTER INSERT ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_new_proposal();

-- trg_notify_proposal_update
DROP TRIGGER IF EXISTS trg_notify_proposal_update ON proposals;
CREATE TRIGGER trg_notify_proposal_update
    AFTER UPDATE ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_proposal_update();

-- trg_notify_milestone_update
DROP TRIGGER IF EXISTS trg_notify_milestone_update ON contract_milestones;
CREATE TRIGGER trg_notify_milestone_update
    AFTER UPDATE ON contract_milestones
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_milestone_update();

-- trg_notify_contract_completed
DROP TRIGGER IF EXISTS trg_notify_contract_completed ON contracts;
CREATE TRIGGER trg_notify_contract_completed
    AFTER UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_contract_completed();

-- trg_notify_review_received
DROP TRIGGER IF EXISTS trg_notify_review_received ON reviews;
CREATE TRIGGER trg_notify_review_received
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_review_received();

-- 7. Performance: Add composite index for notification feed
CREATE INDEX IF NOT EXISTS idx_notifications_user_feed 
ON public.notifications (user_id, created_at DESC);

-- 8. Ensure RLS is strictly owner-only
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own notifications" ON public.notifications;
CREATE POLICY "Users see own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark own notifications read" ON public.notifications;
CREATE POLICY "Users can mark own notifications read" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
