-- Phase 8 Follow-up Fixes
-- Fix invalid notification links and make trigger text schema-safe.

-- 1) New Proposal link should route to an existing page.
CREATE OR REPLACE FUNCTION public.notify_on_new_proposal()
RETURNS TRIGGER AS $$
DECLARE
    v_brand_id UUID;
    v_brand_email TEXT;
    v_gig_title TEXT;
BEGIN
    SELECT g.brand_id, u.email, g.title
    INTO v_brand_id, v_brand_email, v_gig_title
    FROM gigs g
    JOIN users u ON g.brand_id = u.user_id
    WHERE g.id = NEW.gig_id;

    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
        v_brand_id,
        'New Application Received 📥',
        'Someone applied to your gig: ' || v_gig_title,
        'proposal_received',
        '/brand/contracts'
    );

    PERFORM public.notify_send_email(
        v_brand_email,
        'proposal_received',
        json_build_object('gig_title', v_gig_title)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2) Milestone updates: use generic milestone label (schema-safe) and valid links.
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

    SELECT influencer_id, brand_id
    INTO v_influencer_id, v_brand_id
    FROM contracts
    WHERE id = NEW.contract_id;

    IF NEW.status = 'Submitted' THEN
        v_recipient_id := v_brand_id;
        v_title := 'New Submission';
        v_message := 'A new milestone submission is ready for your review.';
        v_link := '/brand/contracts';
        v_template := 'milestone_submitted';
        v_should_notify := TRUE;
    ELSIF NEW.status = 'Approved' THEN
        v_recipient_id := v_influencer_id;
        v_title := 'Milestone Approved ✅';
        v_message := 'A milestone has been approved!';
        v_link := '/influencer/contracts';
        v_template := 'milestone_approved';
        v_should_notify := TRUE;
    ELSIF NEW.status = 'Revision_Requested' THEN
        v_recipient_id := v_influencer_id;
        v_title := 'Revision Requested';
        v_message := 'The brand requested revisions on your milestone.';
        v_link := '/influencer/contracts';
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
            json_build_object('contract_id', NEW.contract_id)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) Contract completed links should route to existing list pages.
CREATE OR REPLACE FUNCTION public.notify_on_contract_completed()
RETURNS TRIGGER AS $$
DECLARE
    v_influencer_email TEXT;
    v_brand_email TEXT;
BEGIN
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        SELECT email INTO v_influencer_email FROM users WHERE user_id = NEW.influencer_id;
        SELECT email INTO v_brand_email FROM users WHERE user_id = NEW.brand_id;

        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            NEW.influencer_id,
            'Contract Completed! 🎉',
            'Well done! The contract is marked as completed.',
            'contract_completed',
            '/influencer/contracts'
        );

        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            NEW.brand_id,
            'Contract Completed! 🎉',
            'Contract is successfully completed. Don''t forget to leave a review!',
            'contract_completed',
            '/brand/contracts'
        );

        PERFORM public.notify_send_email(v_influencer_email, 'contract_completed', json_build_object());
        PERFORM public.notify_send_email(v_brand_email, 'contract_completed', json_build_object());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4) Review notification link should route by recipient role.
CREATE OR REPLACE FUNCTION public.notify_on_review_received()
RETURNS TRIGGER AS $$
DECLARE
    v_target_role TEXT;
    v_link TEXT;
BEGIN
    SELECT role INTO v_target_role
    FROM users
    WHERE user_id = NEW.target_id;

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

-- 5) Normalize existing bad links created before this patch.
UPDATE notifications
SET link = '/brand/contracts'
WHERE type = 'proposal_received' AND (link IS NULL OR link LIKE '/brand/gigs/%');

UPDATE notifications
SET link = '/brand/contracts'
WHERE type = 'milestone_update' AND link LIKE '/brand/contracts/%';

UPDATE notifications
SET link = '/influencer/contracts'
WHERE type = 'milestone_update' AND link LIKE '/influencer/contracts/%';

UPDATE notifications
SET link = '/brand/contracts'
WHERE type = 'contract_completed' AND link LIKE '/brand/contracts/%';

UPDATE notifications
SET link = '/influencer/contracts'
WHERE type = 'contract_completed' AND link LIKE '/influencer/contracts/%';

UPDATE notifications
SET link = '/influencer/contracts'
WHERE type = 'review_received' AND link = '/profile';
