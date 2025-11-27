import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserSubscription extends Document {
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const UserSubscriptionSchema = new Schema<IUserSubscription>(
  {
    user_id: {
      type: String,
      required: true,
      ref: 'User',
    },
    plan_id: {
      type: String,
      required: true,
      ref: 'SubscriptionPlan',
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

UserSubscriptionSchema.index({ user_id: 1, status: 1 });

const UserSubscription: Model<IUserSubscription> = mongoose.models.UserSubscription || mongoose.model<IUserSubscription>('UserSubscription', UserSubscriptionSchema);

export default UserSubscription;

