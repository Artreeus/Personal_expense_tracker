import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMongoUserIdFromClerk } from '@/lib/clerk-helpers';
import connectDB from '@/lib/mongodb';
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
    const type = searchParams.get('type');

    let query: any = { user_id: mongoUserId };

    if (type) {
      query.type = type;
    }

    const categories = await Category.find(query)
      .sort({ name: 1 })
      .lean();

    const formattedCategories = categories.map((cat) => ({
      id: cat._id.toString(),
      user_id: cat.user_id,
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      color: cat.color,
      created_at: cat.createdAt,
      updated_at: cat.updatedAt,
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error) {
    console.error('Categories error:', error);
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
    const { name, type, icon, color } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid category type' },
        { status: 400 }
      );
    }

    const category = await Category.create({
      user_id: mongoUserId,
      name,
      type,
      icon,
      color,
    });

    return NextResponse.json({
      category: {
        id: category._id.toString(),
        user_id: category.user_id,
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        created_at: category.createdAt,
        updated_at: category.updatedAt,
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create category error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
