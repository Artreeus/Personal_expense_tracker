import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGoal extends Document {
  _id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  category?: string;
  deadline?: Date;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    user_id: {
      type: String,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    target_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    current_amount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
    },
    deadline: {
      type: Date,
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
  },
  {
    timestamps: true,
  }
);

const Goal: Model<IGoal> = mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);

export default Goal;

