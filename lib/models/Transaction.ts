import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  _id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category_id?: string;
  note?: string;
  transaction_date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user_id: {
      type: String,
      required: true,
      ref: 'User',
    },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense'],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category_id: {
      type: String,
      ref: 'Category',
    },
    note: {
      type: String,
      trim: true,
    },
    transaction_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

TransactionSchema.index({ user_id: 1, transaction_date: -1 });
TransactionSchema.index({ user_id: 1, type: 1 });

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;

