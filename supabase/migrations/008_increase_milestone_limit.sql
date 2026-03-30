-- Migration 008: Increase milestone sort_order limit from 3 to 10

ALTER TABLE contract_milestones
DROP CONSTRAINT contract_milestones_sort_order_check;

ALTER TABLE contract_milestones
ADD CONSTRAINT contract_milestones_sort_order_check CHECK (sort_order >= 1 AND sort_order <= 10);
