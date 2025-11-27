import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAIReport extends Document {
  _id: string;
  user_id: string;
  month: string; // Format: YYYY-MM
  report_content: string;
  financial_data: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    transactionCount: number;
  };
  generated_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AIReportSchema = new Schema<IAIReport>(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true,
      index: true,
    },
    report_content: {
      type: String,
      required: true,
    },
    financial_data: {
      totalIncome: { type: Number, required: true },
      totalExpenses: { type: Number, required: true },
      netBalance: { type: Number, required: true },
      transactionCount: { type: Number, required: true },
    },
    generated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one report per user per month
AIReportSchema.index({ user_id: 1, month: 1 }, { unique: true });

let AIReport: Model<IAIReport>;

try {
  AIReport = mongoose.models.AIReport || mongoose.model<IAIReport>('AIReport', AIReportSchema);
} catch (error) {
  AIReport = mongoose.model<IAIReport>('AIReport', AIReportSchema);
}

export default AIReport;

