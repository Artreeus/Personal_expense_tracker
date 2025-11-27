import connectDB from './mongodb';
import SubscriptionPlan from './models/SubscriptionPlan';

export async function initializeDatabase() {
  try {
    await connectDB();

    // Check if Free plan exists, if not create it
    const freePlan = await SubscriptionPlan.findOne({ name: 'Free' });
    
    if (!freePlan) {
      await SubscriptionPlan.create({
        name: 'Free',
        price: 0,
        features: [
          'Unlimited transactions',
          'Basic categories',
          'Monthly reports',
          'Dashboard analytics',
        ],
      });
      console.log('Free subscription plan created');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

