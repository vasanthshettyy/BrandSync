-- Migration 007: Grant Brands access to manage workflow milestones

-- Allow Brands to INSERT milestones for their own contracts
CREATE POLICY "Brands can insert milestones" ON contract_milestones
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT brand_id FROM contracts WHERE contracts.id = contract_id
        )
    );

-- Allow Brands to UPDATE milestones for their own contracts (e.g., approve or edit names)
CREATE POLICY "Brands can update milestones" ON contract_milestones
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT brand_id FROM contracts WHERE contracts.id = contract_milestones.contract_id
        )
    );

-- Allow Brands to DELETE milestones for their own contracts
CREATE POLICY "Brands can delete milestones" ON contract_milestones
    FOR DELETE USING (
        auth.uid() IN (
            SELECT brand_id FROM contracts WHERE contracts.id = contract_milestones.contract_id
        )
    );
