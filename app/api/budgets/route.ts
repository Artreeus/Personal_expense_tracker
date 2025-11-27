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
      return NextResponse.json({ 
        error: 'User not found. Please try refreshing the page or contact support if the issue persists.' 
      }, { status: 404 });
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
      const categoryIdStr = budget.category_id && typeof budget.category_id === 'object' && '_id' in budget.category_id
        ? (budget.category_id as any)._id.toString()
        : (typeof budget.category_id === 'string' ? budget.category_id : '');
      const spent = categorySpending.get(categoryIdStr) || 0;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        id: budget._id.toString(),
        category_id: budget.category_id && typeof budget.category_id === 'object' && '_id' in budget.category_id
          ? (budget.category_id as any)._id.toString()
          : (typeof budget.category_id === 'string' ? budget.category_id : null),
        category: budget.category_id && typeof budget.category_id === 'object' && 'name' in budget.category_id
          ? (budget.category_id as any).name
          : 'Unknown',
        color: budget.category_id && typeof budget.category_id === 'object' && 'color' in budget.category_id
          ? (budget.category_id as any).color
          : '#3b82f6',
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
      return NextResponse.json({ 
        error: 'User not found. Please try refreshing the page or contact support if the issue persists.' 
      }, { status: 404 });
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

    const populatedCategory = populatedBudget?.category_id && typeof populatedBudget.category_id === 'object' && '_id' in populatedBudget.category_id
      ? {
          id: (populatedBudget.category_id as any)._id.toString(),
          name: (populatedBudget.category_id as any).name,
          color: (populatedBudget.category_id as any).color,
        }
      : null;

    return NextResponse.json({
      budget: {
        id: budget._id.toString(),
        category_id: populatedCategory?.id || category_id,
        category: populatedCategory?.name || category.name,
        color: populatedCategory?.color || category.color,
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

