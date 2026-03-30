-- Migration: 006_accept_proposal_function.sql
-- Description: Atomic RPC function to accept a proposal, reject others,
--              close the gig, and create a contract with 3 milestones.

CREATE OR REPLACE FUNCTION accept_proposal(p_proposal_id UUID, p_brand_id UUID)
RETURNS UUID AS $$
DECLARE
    v_gig_id UUID;
    v_influencer_id UUID;
    v_agreed_price DECIMAL;
    v_contract_id UUID;
BEGIN
    -- Step 1: Fetch the proposal (must be Pending)
    SELECT gig_id, influencer_id, quoted_price
      INTO v_gig_id, v_influencer_id, v_agreed_price
      FROM proposals
     WHERE id = p_proposal_id AND status = 'Pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposal not found or already processed';
    END IF;

    -- Step 2: Verify the brand owns this gig
    PERFORM 1 FROM gigs WHERE id = v_gig_id AND brand_id = p_brand_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unauthorized: you do not own this gig';
    END IF;

    -- Step 3: Accept this proposal
    UPDATE proposals
       SET status = 'Accepted', updated_at = NOW()
     WHERE id = p_proposal_id;

    -- Step 4: Reject all other pending proposals for the same gig
    UPDATE proposals
       SET status = 'Rejected', updated_at = NOW()
     WHERE gig_id = v_gig_id
       AND id != p_proposal_id
       AND status = 'Pending';

    -- Step 5: Close the gig
    UPDATE gigs
       SET status = 'Closed', updated_at = NOW()
     WHERE id = v_gig_id;

    -- Step 6: Create the contract
    INSERT INTO contracts (gig_id, influencer_id, brand_id, agreed_price, status, payment_status)
    VALUES (v_gig_id, v_influencer_id, p_brand_id, v_agreed_price, 'Active', 'Unpaid')
    RETURNING id INTO v_contract_id;

    -- Step 7: Create 3 default milestones
    INSERT INTO contract_milestones (contract_id, milestone_name, sort_order, status) VALUES
        (v_contract_id, 'Script', 1, 'Pending'),
        (v_contract_id, 'Draft',  2, 'Pending'),
        (v_contract_id, 'Final',  3, 'Pending');

    -- Step 8: Return the new contract ID
    RETURN v_contract_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (Supabase role)
GRANT EXECUTE ON FUNCTION accept_proposal(UUID, UUID) TO authenticated;
