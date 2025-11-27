import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMongoUserIdFromClerk } from '@/lib/clerk-helpers';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const transaction = await Transaction.findOne({
      _id: id,
      user_id: mongoUserId,
    })
      .populate('category_id', 'name type icon color')
      .lean();

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const category = transaction.category_id && typeof transaction.category_id === 'object' ? {
      id: transaction.category_id._id.toString(),
      name: transaction.category_id.name,
      type: transaction.category_id.type,
      icon: transaction.category_id.icon,
      color: transaction.category_id.color,
    } : null;

    return NextResponse.json({
      transaction: {
        id: transaction._id.toString(),
        user_id: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount,
        category_id: transaction.category_id?._id?.toString() || transaction.category_id,
        category,
        note: transaction.note,
        transaction_date: transaction.transaction_date,
        created_at: transaction.createdAt,
        updated_at: transaction.updatedAt,
      }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { type, amount, category_id, note, transaction_date } = body;

    const updates: any = {};
    if (type !== undefined) updates.type = type;
    if (amount !== undefined) updates.amount = amount;
    if (category_id !== undefined) updates.category_id = category_id || null;
    if (note !== undefined) updates.note = note;
    if (transaction_date !== undefined) updates.transaction_date = new Date(transaction_date);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user_id: mongoUserId },
      updates,
      { new: true }
    )
      .populate('category_id', 'name type icon color')
      .lean();

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const category = transaction.category_id && typeof transaction.category_id === 'object' ? {
      id: transaction.category_id._id.toString(),
      name: transaction.category_id.name,
      type: transaction.category_id.type,
      icon: transaction.category_id.icon,
      color: transaction.category_id.color,
    } : null;

    return NextResponse.json({
      transaction: {
        id: transaction._id.toString(),
        user_id: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount,
        category_id: transaction.category_id?._id?.toString() || transaction.category_id,
        category,
        note: transaction.note,
        transaction_date: transaction.transaction_date,
        created_at: transaction.createdAt,
        updated_at: transaction.updatedAt,
      }
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const result = await Transaction.deleteOne({
      _id: id,
      user_id: mongoUserId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
