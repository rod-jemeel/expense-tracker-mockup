-- Migration: Create recurring expense templates
-- Date: 2026-01-18
-- Description: Enables recurring expense templates for pre-filling expense forms

-- Create recurring expense templates table
CREATE TABLE IF NOT EXISTS recurring_expense_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,

  -- Template fields (pre-filled when creating expense)
  category_id UUID NOT NULL REFERENCES expense_categories(id),
  vendor VARCHAR(255),
  estimated_amount DECIMAL(12,2), -- Reference amount (can fluctuate)
  notes TEXT,

  -- Schedule info (for reminders/tracking)
  frequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
  typical_day_of_month INTEGER CHECK (typical_day_of_month IS NULL OR (typical_day_of_month BETWEEN 1 AND 31)),

  -- State
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Audit
  created_by TEXT NOT NULL REFERENCES "user"(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recurring_templates_org
  ON recurring_expense_templates(org_id);

CREATE INDEX IF NOT EXISTS idx_recurring_templates_active
  ON recurring_expense_templates(org_id, is_active)
  WHERE is_active = true;

-- Add recurring_template_id to expenses (link expenses to their template)
-- Check if column exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses'
    AND column_name = 'recurring_template_id'
  ) THEN
    ALTER TABLE expenses
    ADD COLUMN recurring_template_id UUID REFERENCES recurring_expense_templates(id);
  END IF;
END $$;

-- Index for finding expenses by template
CREATE INDEX IF NOT EXISTS idx_expenses_template
  ON expenses(recurring_template_id)
  WHERE recurring_template_id IS NOT NULL;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_recurring_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_recurring_template_timestamp ON recurring_expense_templates;

CREATE TRIGGER trigger_recurring_template_timestamp
  BEFORE UPDATE ON recurring_expense_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_recurring_template_timestamp();

-- Row Level Security
ALTER TABLE recurring_expense_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see templates in their organizations
CREATE POLICY recurring_templates_org_isolation ON recurring_expense_templates
  FOR ALL
  USING (org_id IN (
    SELECT "organizationId" FROM member WHERE "userId" = auth.uid()::text
  ));

-- Comments for documentation
COMMENT ON TABLE recurring_expense_templates IS 'Templates for recurring expenses (monthly bills, subscriptions, etc.)';
COMMENT ON COLUMN recurring_expense_templates.estimated_amount IS 'Reference amount - actual expense amounts may vary';
COMMENT ON COLUMN recurring_expense_templates.frequency IS 'Recurrence frequency (currently only monthly supported)';
COMMENT ON COLUMN recurring_expense_templates.typical_day_of_month IS 'Typical day when this expense occurs (for tracking)';
