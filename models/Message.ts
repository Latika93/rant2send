import mongoose, { Schema, model, models } from "mongoose";

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  originalMessage: string;
  rewrittenMessages: [string, string, string];
  context: string;
  tone: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    originalMessage: { type: String, required: true },
    rewrittenMessages: { type: [String], required: true, validate: (v: string[]) => v.length === 3 },
    context: { type: String, required: true },
    tone: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Message = models.Message ?? model<IMessage>("Message", MessageSchema);
