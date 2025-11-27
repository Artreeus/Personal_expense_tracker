import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: 'Invalid month format. Use YYYY-MM' },
        { status: 400 }
      );
    }

    const [year, monthNum] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await Transaction.find({
      user_id: session.user.id,
      transaction_date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate('category_id', 'name type icon color')
      .sort({ transaction_date: -1 })
      .lean();

    const totalIncome = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    const categoryMap = new Map();
    transactions.forEach((t: any) => {
      const categoryName = t.category_id && typeof t.category_id === 'object' 
        ? t.category_id.name 
        : 'Uncategorized';
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, { amount: 0, count: 0, type: t.type });
      }
      const current = categoryMap.get(categoryName);
      categoryMap.set(categoryName, {
        amount: current.amount + Number(t.amount),
        count: current.count + 1,
        type: t.type,
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(
      ([category, data]: [string, any]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenses > 0 && data.type === 'expense'
          ? (data.amount / totalExpenses) * 100
          : totalIncome > 0 && data.type === 'income'
          ? (data.amount / totalIncome) * 100
          : 0,
      })
    );

    const formattedTransactions = transactions.map((t: any) => ({
      id: t._id.toString(),
      user_id: t.user_id,
      type: t.type,
      amount: t.amount,
      category_id: t.category_id?._id?.toString() || t.category_id,
      category: t.category_id && typeof t.category_id === 'object' ? {
        id: t.category_id._id.toString(),
        name: t.category_id.name,
        type: t.category_id.type,
        icon: t.category_id.icon,
        color: t.category_id.color,
      } : null,
      note: t.note,
      transaction_date: t.transaction_date,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
    }));

    return NextResponse.json({
      month,
      totalIncome,
      totalExpenses,
      net: totalIncome - totalExpenses,
      categoryBreakdown,
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
