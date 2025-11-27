import { auth } from '@clerk/nextjs/server';
import connectDB from './mongodb';
import User from './models/User';
import SubscriptionPlan from './models/SubscriptionPlan';
import UserSubscription from './models/UserSubscription';
import Category from './models/Category';

export async function getClerkUserId() {
  const { userId } = await auth();
  return userId;
}

export async function syncClerkUserToMongoDB(clerkUserId: string, email: string, name?: string, image?: string) {
  try {
    await connectDB();
    
    let user = await User.findOne({ clerk_id: clerkUserId });
    
    if (!user) {
      // Check if user exists with email
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      
      if (existingUser) {
        // Update existing user with clerk_id
        existingUser.clerk_id = clerkUserId;
        if (name) existingUser.name = name;
        if (image) existingUser.image = image;
        await existingUser.save();
        user = existingUser;
      } else {
        // Create new user
        user = await User.create({
          clerk_id: clerkUserId,
          email: email.toLowerCase(),
          name: name || '',
          image: image || '',
          email_verified: new Date(),
        });

        // Create default subscription
        const freePlan = await SubscriptionPlan.findOne({ name: 'Free' });
        if (freePlan) {
          await UserSubscription.create({
            user_id: user._id.toString(),
            plan_id: freePlan._id.toString(),
            status: 'active',
          });
        }

        // Create default categories
        const defaultCategories = [
          { name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#ef4444', user_id: user._id.toString() },
          { name: 'Transportation', type: 'expense', icon: '🚗', color: '#3b82f6', user_id: user._id.toString() },
          { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#ec4899', user_id: user._id.toString() },
          { name: 'Bills & Utilities', type: 'expense', icon: '💡', color: '#f59e0b', user_id: user._id.toString() },
          { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#8b5cf6', user_id: user._id.toString() },
          { name: 'Salary', type: 'income', icon: '💰', color: '#10b981', user_id: user._id.toString() },
          { name: 'Freelance', type: 'income', icon: '💼', color: '#10b981', user_id: user._id.toString() },
          { name: 'Investment', type: 'income', icon: '📈', color: '#10b981', user_id: user._id.toString() },
        ];

        await Category.insertMany(defaultCategories);
      }
    } else {
      // Update user info if changed
      if (name && user.name !== name) user.name = name;
      if (image && user.image !== image) user.image = image;
      await user.save();
    }

    return user._id.toString();
  } catch (error) {
    console.error('Error syncing Clerk user to MongoDB:', error);
    throw error;
  }
}

export async function getMongoUserIdFromClerk() {
  const { userId: clerkUserId } = await auth();
  
  if (!clerkUserId) {
    return null;
  }

  try {
    await connectDB();
    const user = await User.findOne({ clerk_id: clerkUserId });
    return user?._id.toString() || null;
  } catch (error) {
    console.error('Error getting MongoDB user ID:', error);
    return null;
  }
}

