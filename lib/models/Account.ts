import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAccount extends Document {
  user_id: string;
  type: string;
  provider: string;
  provider_account_id: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    user_id: {
      type: String,
      required: true,
      ref: 'User',
    },
    type: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    provider_account_id: {
      type: String,
      required: true,
    },
    access_token: {
      type: String,
    },
    refresh_token: {
      type: String,
    },
    expires_at: {
      type: Number,
    },
    token_type: {
      type: String,
    },
    scope: {
      type: String,
    },
    id_token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

AccountSchema.index({ provider: 1, provider_account_id: 1 }, { unique: true });

const Account: Model<IAccount> = mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);

export default Account;

