import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBudget extends Document {
  _id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: string; // Format: YYYY-MM
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    user_id: {
      type: String,
      required: true,
      ref: 'User',
    },
    category_id: {
      type: String,
      required: true,
      ref: 'Category',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/, // YYYY-MM format
    },
  },
  {
    timestamps: true,
  }
);

BudgetSchema.index({ user_id: 1, category_id: 1, month: 1 }, { unique: true });

const Budget: Model<IBudget> = mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);

export default Budget;

