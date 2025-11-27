import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMongoUserIdFromClerk } from '@/lib/clerk-helpers';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mongoUserId = await getMongoUserIdFromClerk();
    if (!mongoUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const todayTransactions = await Transaction.find({
      user_id: mongoUserId,
      transaction_date: {
        $gte: today,
        $lt: tomorrow,
      },
    }).select('type amount').lean();

    const monthlyTransactions = await Transaction.find({
      user_id: mongoUserId,
      transaction_date: {
        $gte: firstDayOfMonth,
      },
    }).select('type amount').lean();

    const todayIncome = todayTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const todayExpenses = todayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyExpenses = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return NextResponse.json({
      todayIncome,
      todayExpenses,
      todayNet: todayIncome - todayExpenses,
      monthlyIncome,
      monthlyExpenses,
      monthlyNet: monthlyIncome - monthlyExpenses,
      transactionCount: monthlyTransactions.length,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
