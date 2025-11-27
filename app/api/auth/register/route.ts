import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Category from '@/lib/models/Category';
import SubscriptionPlan from '@/lib/models/SubscriptionPlan';
import UserSubscription from '@/lib/models/UserSubscription';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    try {
      await connectDB();
    } catch (dbError: any) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please check your DATABASE_URL environment variable.' },
        { status: 500 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const newUser = await User.create({
      email: email.toLowerCase(),
      name,
      password_hash: hashedPassword,
    });

    const freePlan = await SubscriptionPlan.findOne({ name: 'Free' });

    if (freePlan) {
      await UserSubscription.create({
        user_id: newUser._id.toString(),
        plan_id: freePlan._id.toString(),
        status: 'active',
      });
    }

    const defaultCategories = [
      { name: 'Salary', type: 'income', icon: 'briefcase', color: '#10b981' },
      { name: 'Freelance', type: 'income', icon: 'code', color: '#3b82f6' },
      { name: 'Investment', type: 'income', icon: 'trending-up', color: '#8b5cf6' },
      { name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#ef4444' },
      { name: 'Transportation', type: 'expense', icon: 'car', color: '#f59e0b' },
      { name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#ec4899' },
      { name: 'Entertainment', type: 'expense', icon: 'film', color: '#6366f1' },
      { name: 'Bills & Utilities', type: 'expense', icon: 'receipt', color: '#14b8a6' },
      { name: 'Healthcare', type: 'expense', icon: 'heart', color: '#f43f5e' },
    ];

    await Category.insertMany(
      defaultCategories.map((cat) => ({
        user_id: newUser._id.toString(),
        ...cat,
      }))
    );

    return NextResponse.json(
      { user: { id: newUser._id.toString(), email: newUser.email, name: newUser.name } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
