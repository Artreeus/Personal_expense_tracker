import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMongoUserIdFromClerk } from '@/lib/clerk-helpers';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';

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
    const { name, type, icon, color } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (icon !== undefined) updates.icon = icon;
    if (color !== undefined) updates.color = color;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const category = await Category.findOneAndUpdate(
      { _id: id, user_id: mongoUserId },
      updates,
      { new: true }
    ).lean();

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

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
    });
  } catch (error) {
    console.error('Update category error:', error);
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

    const result = await Category.deleteOne({
      _id: id,
      user_id: mongoUserId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
