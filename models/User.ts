import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string | null;
  image: string | null;
  credits: number;
  totalUsage: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, default: null },
    image: { type: String, default: null },
    credits: { type: Number, default: 10 },
    totalUsage: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User = models.User ?? model<IUser>("User", UserSchema);
