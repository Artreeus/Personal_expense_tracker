import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMongoUserIdFromClerk } from '@/lib/clerk-helpers';
import connectDB from '@/lib/mongodb';
import Goal from '@/lib/models/Goal';

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
    const { id } = await params;

    const body = await req.json();
    const { name, target_amount, current_amount, category, deadline, color } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (target_amount !== undefined) {
      if (target_amount <= 0) {
        return NextResponse.json(
          { error: 'Target amount must be greater than 0' },
          { status: 400 }
        );
      }
      updates.target_amount = parseFloat(target_amount);
    }
    if (current_amount !== undefined) {
      if (current_amount < 0) {
        return NextResponse.json(
          { error: 'Current amount cannot be negative' },
          { status: 400 }
        );
      }
      updates.current_amount = parseFloat(current_amount);
    }
    if (category !== undefined) updates.category = category;
    if (deadline !== undefined) updates.deadline = deadline ? new Date(deadline) : null;
    if (color !== undefined) updates.color = color;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: id, user_id: mongoUserId },
      updates,
      { new: true }
    ).lean();

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    const percentage = goal.target_amount > 0 
      ? (goal.current_amount / goal.target_amount) * 100 
      : 0;

    return NextResponse.json({
      goal: {
        id: goal._id.toString(),
        name: goal.name,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount,
        category: goal.category,
        deadline: goal.deadline,
        color: goal.color,
        percentage: percentage,
        created_at: goal.createdAt,
        updated_at: goal.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error updating goal:', error);
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

    const result = await Goal.deleteOne({
      _id: id,
      user_id: mongoUserId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

