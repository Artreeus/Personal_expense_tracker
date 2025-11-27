import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMongoUserIdFromClerk } from '@/lib/clerk-helpers';
import connectDB from '@/lib/mongodb';
import Goal from '@/lib/models/Goal';

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

    const goals = await Goal.find({
      user_id: mongoUserId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedGoals = goals.map((goal) => {
      const percentage = goal.target_amount > 0 
        ? (goal.current_amount / goal.target_amount) * 100 
        : 0;

      return {
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
      };
    });

    return NextResponse.json({ goals: formattedGoals });
  } catch (error) {
    console.error('Error fetching goals:', error);
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
    const { name, target_amount, category, deadline, color, current_amount } = body;

    if (!name || !target_amount) {
      return NextResponse.json(
        { error: 'Name and target amount are required' },
        { status: 400 }
      );
    }

    if (target_amount <= 0) {
      return NextResponse.json(
        { error: 'Target amount must be greater than 0' },
        { status: 400 }
      );
    }

    const goal = await Goal.create({
      user_id: mongoUserId,
      name,
      target_amount: parseFloat(target_amount),
      current_amount: parseFloat(current_amount || 0),
      category,
      deadline: deadline ? new Date(deadline) : undefined,
      color: color || '#3b82f6',
    });

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
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

