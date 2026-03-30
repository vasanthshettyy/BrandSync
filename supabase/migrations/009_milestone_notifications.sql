-- Phase 8: Milestone Notifications Trigger
-- This migration sets up automatic notifications when milestone statuses change.

-- 1. Create the notification function
CREATE OR REPLACE FUNCTION public.notify_on_milestone_update()
RETURNS TRIGGER AS $$
DECLARE
    v_brand_id UUID;
    v_influencer_id UUID;
    v_recipient_id UUID;
    v_title TEXT;
    v_message TEXT;
    v_type TEXT := 'milestone_update';
    v_link TEXT;
BEGIN
    -- Only trigger if the status has actually changed
    IF (NEW.status IS DISTINCT FROM OLD.status) THEN
        
        -- Fetch the brand and influencer IDs from the parent contract
        SELECT brand_id, influencer_id 
        INTO v_brand_id, v_influencer_id
        FROM public.contracts 
        WHERE id = NEW.contract_id;

        -- Define notification content based on the new status
        IF NEW.status = 'Submitted' THEN
            v_recipient_id := v_brand_id;
            v_title := 'Milestone Submitted';
            v_message := 'A new submission is ready for your review: ' || NEW.milestone_name;
            v_link := '/brand/contracts/' || NEW.contract_id;
            
        ELSIF NEW.status = 'Approved' THEN
            v_recipient_id := v_influencer_id;
            v_title := 'Milestone Approved ✅';
            v_message := 'Your ' || NEW.milestone_name || ' has been approved!';
            v_link := '/influencer/contracts/' || NEW.contract_id;
            
        ELSIF NEW.status = 'Revision_Requested' THEN
            v_recipient_id := v_influencer_id;
            v_title := 'Revision Requested ⚠️';
            v_message := 'The brand requested revisions for ' || NEW.milestone_name;
            v_link := '/influencer/contracts/' || NEW.contract_id;
        END IF;

        -- Insert the notification if a recipient was identified
        IF v_recipient_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, title, message, type, link)
            VALUES (v_recipient_id, v_title, v_message, v_type, v_link);
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS trg_notify_milestone_update ON public.contract_milestones;
CREATE TRIGGER trg_notify_milestone_update
    AFTER UPDATE ON public.contract_milestones
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_on_milestone_update();

-- Add helpful comments to the database
COMMENT ON FUNCTION public.notify_on_milestone_update() IS 'Automatically creates notifications for brands/influencers when a milestone status changes.';
COMMENT ON TRIGGER trg_notify_milestone_update ON public.contract_milestones IS 'Trigger that fires notify_on_milestone_update() after an update to a milestone.';
