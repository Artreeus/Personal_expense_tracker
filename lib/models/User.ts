import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  name?: string;
  image?: string;
  password_hash?: string;
  email_verified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    password_hash: {
      type: String,
    },
    email_verified: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

let User: Model<IUser>;

try {
  User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
} catch (error) {
  User = mongoose.model<IUser>('User', UserSchema);
}

export default User;

