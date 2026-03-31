-- Migration: 005_email_notification_trigger.sql
-- Description: Centralizes email dispatch by triggering on any new record in the notifications table.
-- This approach decouples business logic (proposals, milestones) from the notification delivery mechanism.

-- 1. Ensure pg_net extension is enabled for making HTTP requests from Postgres
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 2. Helper Function: trigger_send_email
-- This function is called whenever a new notification is inserted.
-- It fetches the recipient's email and forwards the payload to a Supabase Edge Function.
CREATE OR REPLACE FUNCTION public.trigger_send_email()
RETURNS TRIGGER AS $$
DECLARE
    v_user_email TEXT;
BEGIN
    -- Fetch the user's email from the users table
    SELECT email INTO v_user_email FROM public.users WHERE user_id = NEW.user_id;

    -- Only attempt to send if an email was found
    IF v_user_email IS NOT NULL THEN
        -- Use pg_net to make an asynchronous POST request to the Edge Function
        -- Note: URL is configured for local development interoperability by default.
        -- STRATEGY FOR PRODUCTION: Set the 'app.settings.edge_function_url' in your database settings to the production Edge Function URL.
        -- To prevent accidental non-local breakage, we use COALESCE to fallback to the local URL if the setting is not defined.
        -- Example run on production: ALTER DATABASE postgres SET "app.settings.edge_function_url" TO 'https://[YOUR_PROJECT_REF].supabase.co/functions/v1/send-email';
        PERFORM net.http_post(
            url := COALESCE(
                current_setting('app.settings.edge_function_url', true),
                'http://host.docker.internal:54321/functions/v1/send-email'
            ),
            headers := '{"Content-Type": "application/json"}'::jsonb,
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
    -- Log the error but don't fail the transaction (ensures app stability)
    RAISE WARNING 'Failed to trigger email notification for notification_id %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger: on_notification_created
-- Fires AFTER INSERT on the notifications table.
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;
CREATE TRIGGER on_notification_created
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_send_email();

COMMENT ON FUNCTION public.trigger_send_email() IS 'Decoupled trigger that sends email payloads via pg_net whenever a notification record is created.';
