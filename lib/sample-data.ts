import connectDB from './mongodb';
import Category from './models/Category';
import Transaction from './models/Transaction';

export async function generateSampleData(userId: string) {
  await connectDB();

  const categories = [
    { name: 'Salary', type: 'income', icon: 'briefcase', color: '#10b981' },
    { name: 'Freelance', type: 'income', icon: 'code', color: '#3b82f6' },
    { name: 'Investment', type: 'income', icon: 'trending-up', color: '#8b5cf6' },
    { name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#ef4444' },
    { name: 'Transportation', type: 'expense', icon: 'car', color: '#f59e0b' },
    { name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#ec4899' },
    { name: 'Entertainment', type: 'expense', icon: 'film', color: '#6366f1' },
    { name: 'Bills & Utilities', type: 'expense', icon: 'receipt', color: '#14b8a6' },
  ];

  const insertedCategories = await Category.insertMany(
    categories.map((cat) => ({ ...cat, user_id: userId }))
  );

  if (!insertedCategories || insertedCategories.length === 0) return;

  const incomeCategories = insertedCategories.filter((c) => c.type === 'income');
  const expenseCategories = insertedCategories.filter((c) => c.type === 'expense');

  const transactions = [];
  const today = new Date();

  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    if (Math.random() > 0.3) {
      const expenseCategory = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      transactions.push({
        user_id: userId,
        type: 'expense',
        category_id: expenseCategory._id.toString(),
        amount: parseFloat((Math.random() * 200 + 10).toFixed(2)),
        note: `Sample expense for ${expenseCategory.name}`,
        transaction_date: date,
      });
    }

    if (Math.random() > 0.7) {
      const incomeCategory = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
      transactions.push({
        user_id: userId,
        type: 'income',
        category_id: incomeCategory._id.toString(),
        amount: parseFloat((Math.random() * 1000 + 500).toFixed(2)),
        note: `Sample income from ${incomeCategory.name}`,
        transaction_date: date,
      });
    }
  }

  if (transactions.length > 0) {
    await Transaction.insertMany(transactions);
  }

  return { 
    categories: insertedCategories.map(c => ({
      id: c._id.toString(),
      ...c.toObject(),
    })), 
    transactionCount: transactions.length 
  };
}
