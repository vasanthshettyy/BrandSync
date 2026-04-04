-- Migration: 20260404000000_standardize_notification_flow.sql
-- Description: Standardizes the notification and email dispatch architecture (Option A).
-- 1. Event Triggers: Only insert a record into the notifications table.
-- 2. Notification Trigger: A single AFTER INSERT on notifications handles email dispatch via pg_net.
-- This ensures no duplicate emails and decouples delivery from business logic.

-- 1. Enable pg_net for making HTTP requests from Postgres
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 2. Update trigger_send_email function
-- This handles the actual email dispatch to the Supabase Edge Function.
CREATE OR REPLACE FUNCTION public.trigger_send_email()
RETURNS TRIGGER AS $$
DECLARE
    v_user_email TEXT;
    v_edge_function_url TEXT;
    v_edge_function_key TEXT;
BEGIN
    -- Fetch the recipient's email from the users table
    SELECT email INTO v_user_email FROM public.users WHERE user_id = NEW.user_id;

    -- Only attempt to send if an email was found
    IF v_user_email IS NOT NULL THEN
        -- Resolve Edge Function configuration from database settings
        v_edge_function_url := COALESCE(
            current_setting('app.settings.edge_function_url', true),
            'https://qyrtkrzsrbmumgbwdojl.supabase.co/functions/v1/send-email'
        );
        v_edge_function_key := COALESCE(
            current_setting('app.settings.edge_function_key', true),
            'anon_key' -- Fallback to anon_key if not set (not ideal for production but safe for local)
        );

        -- Use pg_net to make an asynchronous POST request to the Edge Function
        PERFORM net.http_post(
            url := v_edge_function_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || v_edge_function_key
            ),
            body := jsonb_build_object(
                'to', v_user_email,
                'title', NEW.title,
                'message', NEW.message,
                'type', NEW.type,
                'link', NEW.link,
                'notification_id', NEW.id
            )
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the transaction
    RAISE WARNING 'Failed to trigger email notification for notification_id %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure the trigger is active on the notifications table
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;
CREATE TRIGGER on_notification_created
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_send_email();

COMMENT ON FUNCTION public.trigger_send_email() IS 'Canonical trigger that handles email dispatch whenever a notification record is created.';

-- 4. Neutralize the old notify_send_email function to a no-op
-- This prevents any older, un-updated triggers from firing duplicate emails.
CREATE OR REPLACE FUNCTION public.notify_send_email(
    p_to_email TEXT,
    p_template TEXT,
    p_data JSONB
)
RETURNS VOID AS $$
BEGIN
    -- No-op: Email dispatch is now handled exclusively by public.trigger_send_email()
    -- triggered by insertions into the notifications table.
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Standardize Event Trigger Functions to ONLY insert notifications

-- 5a. New Proposal
CREATE OR REPLACE FUNCTION public.notify_on_new_proposal()
RETURNS TRIGGER AS $$
DECLARE
    v_brand_id UUID;
    v_gig_title TEXT;
BEGIN
    -- Get the brand_id and gig title
    SELECT g.brand_id, g.title 
    INTO v_brand_id, v_gig_title
    FROM gigs g 
    WHERE g.id = NEW.gig_id;

    -- Insert notification (trigger_send_email will handle the email)
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
        v_brand_id,
        'New Application Received 📥',
        'Someone applied to your gig: ' || v_gig_title,
        'proposal_received',
        '/brand/contracts'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5b. Proposal Update
CREATE OR REPLACE FUNCTION public.notify_on_proposal_update()
RETURNS TRIGGER AS $$
DECLARE
    v_gig_title TEXT;
    v_title TEXT;
    v_message TEXT;
    v_should_notify BOOLEAN := FALSE;
BEGIN
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;

    -- Get gig title
    SELECT g.title 
    INTO v_gig_title
    FROM gigs g 
    WHERE g.id = NEW.gig_id;

    IF NEW.status = 'Accepted' THEN
        v_title := 'Proposal Accepted! 🎉';
        v_message := 'Your proposal for "' || v_gig_title || '" was accepted!';
        v_should_notify := TRUE;
    ELSIF NEW.status = 'Rejected' THEN
        v_title := 'Proposal Update';
        v_message := 'Your proposal for "' || v_gig_title || '" was not accepted this time.';
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
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5c. Milestone Update
CREATE OR REPLACE FUNCTION public.notify_on_milestone_update()
RETURNS TRIGGER AS $$
DECLARE
    v_recipient_id UUID;
    v_title TEXT;
    v_message TEXT;
    v_link TEXT;
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
        v_recipient_id := v_brand_id;
        v_title := 'New Submission';
        v_message := 'A new milestone submission is ready for your review.';
        v_link := '/brand/contracts';
        v_should_notify := TRUE;
    ELSIF NEW.status = 'Approved' THEN
        v_recipient_id := v_influencer_id;
        v_title := 'Milestone Approved ✅';
        v_message := 'A milestone has been approved!';
        v_link := '/influencer/contracts';
        v_should_notify := TRUE;
    ELSIF NEW.status = 'Revision_Requested' THEN
        v_recipient_id := v_influencer_id;
        v_title := 'Revision Requested';
        v_message := 'The brand requested revisions on your milestone.';
        v_link := '/influencer/contracts';
        v_should_notify := TRUE;
    END IF;

    IF v_should_notify THEN
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (v_recipient_id, v_title, v_message, 'milestone_update', v_link);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5d. Contract Completed
CREATE OR REPLACE FUNCTION public.notify_on_contract_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        -- Notify Influencer
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            NEW.influencer_id,
            'Contract Completed! 🎉',
            'Well done! The contract is marked as completed.',
            'contract_completed',
            '/influencer/contracts'
        );

        -- Notify Brand
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            NEW.brand_id,
            'Contract Completed! 🎉',
            'Contract is successfully completed. Don''t forget to leave a review!',
            'contract_completed',
            '/brand/contracts'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5e. Review Received
CREATE OR REPLACE FUNCTION public.notify_on_review_received()
RETURNS TRIGGER AS $$
DECLARE
    v_target_role TEXT;
    v_link TEXT;
BEGIN
    -- Determine link based on recipient role
    SELECT role INTO v_target_role FROM users WHERE user_id = NEW.target_id;
    v_link := CASE
        WHEN v_target_role = 'brand' THEN '/brand/contracts'
        WHEN v_target_role = 'influencer' THEN '/influencer/contracts'
        ELSE '/login'
    END;

    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
        NEW.target_id,
        'New Review Received ⭐',
        'You received a ' || NEW.rating || '-star review.',
        'review_received',
        v_link
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Apply Comments
COMMENT ON FUNCTION public.notify_on_new_proposal() IS 'Creates notification for new proposals; email handled by notifications trigger.';
COMMENT ON FUNCTION public.notify_on_proposal_update() IS 'Creates notification for proposal status changes; email handled by notifications trigger.';
COMMENT ON FUNCTION public.notify_on_milestone_update() IS 'Creates notification for milestone status changes; email handled by notifications trigger.';
COMMENT ON FUNCTION public.notify_on_contract_completed() IS 'Creates notifications for contract completion; email handled by notifications trigger.';
COMMENT ON FUNCTION public.notify_on_review_received() IS 'Creates notification for new reviews; email handled by notifications trigger.';
