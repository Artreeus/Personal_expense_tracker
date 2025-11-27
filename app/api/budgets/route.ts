import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMongoUserIdFromClerk } from '@/lib/clerk-helpers';
import connectDB from '@/lib/mongodb';
import Budget from '@/lib/models/Budget';
import Category from '@/lib/models/Category';
import Transaction from '@/lib/models/Transaction';

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

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

    const budgets = await Budget.find({
      user_id: mongoUserId,
      month,
    })
      .populate('category_id', 'name color')
      .lean();

    // Calculate spent amounts for each budget
    const firstDayOfMonth = new Date(month + '-01');
    const lastDayOfMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);

    const transactions = await Transaction.find({
      user_id: mongoUserId,
      type: 'expense',
      transaction_date: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      },
    }).lean();

    const categorySpending = new Map<string, number>();
    transactions.forEach((t: any) => {
      const catId = t.category_id?.toString() || 'uncategorized';
      const current = categorySpending.get(catId) || 0;
      categorySpending.set(catId, current + Number(t.amount));
    });

    const budgetsWithSpending = budgets.map((budget: any) => {
      const spent = categorySpending.get(budget.category_id?._id?.toString() || budget.category_id) || 0;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        id: budget._id.toString(),
        category_id: budget.category_id?._id?.toString() || budget.category_id,
        category: budget.category_id?.name || 'Unknown',
        color: budget.category_id?.color || '#3b82f6',
        amount: budget.amount,
        spent: spent,
        percentage: percentage,
        month: budget.month,
        created_at: budget.createdAt,
        updated_at: budget.updatedAt,
      };
    });

    return NextResponse.json({ budgets: budgetsWithSpending });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { category_id, amount, month } = body;

    if (!category_id || !amount || !month) {
      return NextResponse.json(
        { error: 'Category, amount, and month are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Verify category belongs to user
    const category = await Category.findOne({
      _id: category_id,
      user_id: mongoUserId,
      type: 'expense',
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found or not an expense category' },
        { status: 404 }
      );
    }

    const budget = await Budget.create({
      user_id: mongoUserId,
      category_id,
      amount: parseFloat(amount),
      month,
    });

    const populatedBudget = await Budget.findById(budget._id)
      .populate('category_id', 'name color')
      .lean();

    return NextResponse.json({
      budget: {
        id: budget._id.toString(),
        category_id: populatedBudget?.category_id?._id?.toString() || category_id,
        category: populatedBudget?.category_id?.name || category.name,
        color: populatedBudget?.category_id?.color || category.color,
        amount: budget.amount,
        month: budget.month,
        spent: 0,
        percentage: 0,
        created_at: budget.createdAt,
        updated_at: budget.updatedAt,
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating budget:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Budget for this category and month already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

