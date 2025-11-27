/*
  # Add Budget Planning and Financial Goals Features

  ## New Tables

  ### 1. budgets
  Monthly budget planning by category
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Links to users
  - `category_id` (uuid, foreign key) - Links to categories  
  - `amount` (numeric) - Budget limit
  - `period` (text) - monthly, weekly, yearly
  - `start_date` (date) - Budget period start
  - `end_date` (date) - Budget period end
  - `alert_threshold` (numeric) - Alert when X% reached
  - `created_at` (timestamptz)

  ### 2. financial_goals
  User savings and financial goals
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `name` (text) - Goal name
  - `target_amount` (numeric) - Target amount
  - `current_amount` (numeric) - Current progress
  - `target_date` (date) - Goal deadline
  - `category` (text) - savings, investment, debt
  - `status` (text) - active, completed, cancelled
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. recurring_transactions
  Scheduled recurring transactions
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `category_id` (uuid, foreign key)
  - `type` (text) - income, expense
  - `amount` (numeric)
  - `description` (text)
  - `frequency` (text) - daily, weekly, biweekly, monthly, yearly
  - `start_date` (date)
  - `end_date` (date, nullable)
  - `next_occurrence` (date)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 4. financial_insights
  AI-generated financial insights
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `insight_type` (text) - spending_pattern, savings_opportunity, alert
  - `title` (text)
  - `description` (text)
  - `priority` (text) - low, medium, high
  - `is_read` (boolean)
  - `created_at` (timestamptz)

  ## Security
  All tables have RLS enabled with user-specific policies
*/

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  period text NOT NULL DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  alert_threshold numeric(5, 2) DEFAULT 80 CHECK (alert_threshold > 0 AND alert_threshold <= 100),
  created_at timestamptz DEFAULT now()
);

-- Create financial_goals table
CREATE TABLE IF NOT EXISTS financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_amount numeric(12, 2) NOT NULL CHECK (target_amount > 0),
  current_amount numeric(12, 2) DEFAULT 0 CHECK (current_amount >= 0),
  target_date date,
  category text NOT NULL CHECK (category IN ('savings', 'investment', 'debt', 'emergency_fund', 'retirement', 'other')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  description text,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly')),
  start_date date NOT NULL,
  end_date date,
  next_occurrence date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create financial_insights table
CREATE TABLE IF NOT EXISTS financial_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('spending_pattern', 'savings_opportunity', 'alert', 'prediction', 'recommendation')),
  title text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON financial_goals(status);

CREATE INDEX IF NOT EXISTS idx_recurring_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_next ON recurring_transactions(next_occurrence);
CREATE INDEX IF NOT EXISTS idx_recurring_active ON recurring_transactions(is_active);

CREATE INDEX IF NOT EXISTS idx_insights_user_id ON financial_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_read ON financial_insights(is_read);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budgets
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own budgets"
  ON budgets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for financial_goals
CREATE POLICY "Users can view own goals"
  ON financial_goals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own goals"
  ON financial_goals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own goals"
  ON financial_goals FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own goals"
  ON financial_goals FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for recurring_transactions
CREATE POLICY "Users can view own recurring transactions"
  ON recurring_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own recurring transactions"
  ON recurring_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own recurring transactions"
  ON recurring_transactions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own recurring transactions"
  ON recurring_transactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for financial_insights
CREATE POLICY "Users can view own insights"
  ON financial_insights FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own insights"
  ON financial_insights FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own insights"
  ON financial_insights FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger for updating financial_goals updated_at
DROP TRIGGER IF EXISTS update_financial_goals_updated_at ON financial_goals;
CREATE TRIGGER update_financial_goals_updated_at
  BEFORE UPDATE ON financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();