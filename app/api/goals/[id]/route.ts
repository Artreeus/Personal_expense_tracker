import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Goal from '@/lib/models/Goal';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

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
      { _id: params.id, user_id: session.user.id },
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const result = await Goal.deleteOne({
      _id: params.id,
      user_id: session.user.id,
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

