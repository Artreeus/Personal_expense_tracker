/*
  # Personal Finance Tracker Database Schema

  ## Overview
  This migration creates a complete multi-tenant personal finance tracking system
  with authentication, transactions, categories, and subscription management.

  ## Tables Created

  ### 1. users
  Stores user account information for authentication
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique, not null) - User email address
  - `name` (text) - User display name
  - `image` (text) - Profile image URL
  - `password_hash` (text) - Hashed password for credentials auth
  - `email_verified` (timestamptz) - Email verification timestamp
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. accounts
  OAuth provider account linkage (NextAuth)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Links to users table
  - `type` (text) - Account type (oauth, credentials)
  - `provider` (text) - Provider name (google, credentials)
  - `provider_account_id` (text) - Provider's user ID
  - `refresh_token` (text) - OAuth refresh token
  - `access_token` (text) - OAuth access token
  - `expires_at` (bigint) - Token expiration
  - `token_type` (text) - Token type
  - `scope` (text) - OAuth scope
  - `id_token` (text) - ID token
  - `session_state` (text) - Session state

  ### 3. sessions
  User session management (NextAuth)
  - `id` (uuid, primary key)
  - `session_token` (text, unique) - Session identifier
  - `user_id` (uuid, foreign key) - Links to users table
  - `expires` (timestamptz) - Session expiration

  ### 4. categories
  User-defined transaction categories
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Links to users table
  - `name` (text, not null) - Category name
  - `type` (text, not null) - "income" or "expense"
  - `icon` (text) - Icon identifier
  - `color` (text) - Display color
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. transactions
  Financial transactions (income/expense records)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Links to users table
  - `category_id` (uuid, foreign key) - Links to categories table
  - `type` (text, not null) - "income" or "expense"
  - `amount` (numeric(12,2), not null) - Transaction amount
  - `note` (text) - Optional description
  - `transaction_date` (date, not null) - Date of transaction
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. subscription_plans
  Available subscription tiers
  - `id` (uuid, primary key)
  - `name` (text, not null) - Plan name (Free, Pro, Premium)
  - `price` (numeric(10,2), not null) - Monthly price
  - `features` (jsonb) - Feature list as JSON array
  - `max_transactions` (integer) - Transaction limit per month
  - `created_at` (timestamptz) - Creation timestamp

  ### 7. user_subscriptions
  User subscription status
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Links to users table
  - `plan_id` (uuid, foreign key) - Links to subscription_plans
  - `status` (text, not null) - "active", "inactive", "cancelled"
  - `current_period_start` (timestamptz) - Billing period start
  - `current_period_end` (timestamptz) - Billing period end
  - `created_at` (timestamptz) - Subscription creation
  - `updated_at` (timestamptz) - Last update

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with restrictive policies:
  - Users can only access their own data
  - All operations require authentication
  - Subscription plans are publicly readable
  - No data leakage between users

  ### Indexes
  Optimized indexes for common query patterns:
  - User email lookup
  - Transaction date range queries
  - Category lookups by user
  - Session token validation

  ## Notes
  - All timestamps use UTC timezone
  - Monetary amounts use NUMERIC(12,2) for precision
  - Foreign keys enforce referential integrity
  - Cascading deletes clean up related records
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  image text,
  password_hash text,
  email_verified timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create accounts table for OAuth
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text NOT NULL,
  provider_account_id text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider, provider_account_id)
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  icon text,
  color text,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  note text,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  price numeric(10, 2) NOT NULL DEFAULT 0,
  features jsonb DEFAULT '[]'::jsonb,
  max_transactions integer,
  created_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for accounts table
CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for sessions table
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for categories table
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for transactions table
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for subscription_plans table (public read)
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_subscriptions table
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price, features, max_transactions)
VALUES 
  ('Free', 0, '["100 transactions per month", "Basic categories", "Monthly reports", "Mobile access"]'::jsonb, 100),
  ('Pro', 9.99, '["Unlimited transactions", "Custom categories", "Advanced analytics", "Export to PDF", "Email reports", "Priority support"]'::jsonb, NULL),
  ('Premium', 19.99, '["Everything in Pro", "AI-powered insights", "Auto-categorization", "Multi-user access", "API access", "Custom integrations"]'::jsonb, NULL)
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();