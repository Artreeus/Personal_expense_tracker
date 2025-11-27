import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMongoUserIdFromClerk } from '@/lib/clerk-helpers';
import connectDB from '@/lib/mongodb';
import Budget from '@/lib/models/Budget';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
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
    const { amount } = body;

    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (amount !== undefined) updates.amount = parseFloat(amount);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: params.id, user_id: mongoUserId },
      updates,
      { new: true }
    )
      .populate('category_id', 'name color')
      .lean();

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      budget: {
        id: budget._id.toString(),
        category_id: budget.category_id?._id?.toString() || budget.category_id,
        category: budget.category_id?.name || 'Unknown',
        color: budget.category_id?.color || '#3b82f6',
        amount: budget.amount,
        month: budget.month,
        created_at: budget.createdAt,
        updated_at: budget.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const result = await Budget.deleteOne({
      _id: params.id,
      user_id: mongoUserId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

