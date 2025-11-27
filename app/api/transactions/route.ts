import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMongoUserIdFromClerk } from '@/lib/clerk-helpers';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import Category from '@/lib/models/Category';

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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    let query: any = { user_id: mongoUserId };

    if (type) {
      query.type = type;
    }

    if (categoryId) {
      query.category_id = categoryId;
    }

    if (startDate) {
      query.transaction_date = { ...query.transaction_date, $gte: new Date(startDate) };
    }

    if (endDate) {
      query.transaction_date = { ...query.transaction_date, $lte: new Date(endDate) };
    }

    if (search) {
      query.note = { $regex: search, $options: 'i' };
    }

    const count = await Transaction.countDocuments(query);

    const transactions = await Transaction.find(query)
      .populate('category_id', 'name type icon color')
      .sort({ transaction_date: -1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

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
      transactions: formattedTransactions,
      count,
      hasMore: offset + limit < count,
    });
  } catch (error) {
    console.error('Transactions error:', error);
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
    const { type, amount, category_id, note, transaction_date } = body;

    if (!type || !amount) {
      return NextResponse.json(
        { error: 'Type and amount are required' },
        { status: 400 }
      );
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const transaction = await Transaction.create({
      user_id: mongoUserId,
      type,
      amount,
      category_id: category_id || undefined,
      note,
      transaction_date: transaction_date ? new Date(transaction_date) : new Date(),
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('category_id', 'name type icon color')
      .lean();

    const category = populatedTransaction?.category_id && typeof populatedTransaction.category_id === 'object' ? {
      id: populatedTransaction.category_id._id.toString(),
      name: populatedTransaction.category_id.name,
      type: populatedTransaction.category_id.type,
      icon: populatedTransaction.category_id.icon,
      color: populatedTransaction.category_id.color,
    } : null;

    return NextResponse.json({
      transaction: {
        id: transaction._id.toString(),
        user_id: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount,
        category_id: transaction.category_id?.toString(),
        category,
        note: transaction.note,
        transaction_date: transaction.transaction_date,
        created_at: transaction.createdAt,
        updated_at: transaction.updatedAt,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
