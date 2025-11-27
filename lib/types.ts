export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string | null;
  color?: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id?: string | null;
  type: 'income' | 'expense';
  amount: number;
  note?: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  max_transactions?: number | null;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'cancelled';
  current_period_start?: string | null;
  current_period_end?: string | null;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export interface DashboardStats {
  todayIncome: number;
  todayExpenses: number;
  todayNet: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNet: number;
  transactionCount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface MonthlyReport {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  net: number;
  categoryBreakdown: CategoryBreakdown[];
  transactions: Transaction[];
}

export interface TrendData {
  date: string;
  income: number;
  expense: number;
  net: number;
}
