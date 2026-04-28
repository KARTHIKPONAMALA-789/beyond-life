import { Document } from "mongoose";

export interface IBaseUser extends Document {
  fullname: string;
  username: string;
  email: string;
  password: string;
  isApproved: boolean;
  passwordResetToken: string,
  passwordResetExpiry: Date
}

export const IbaseUserSchema = {
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  passwordResetToken: { type: String },
  passwordResetExpiry: { type: Date },
};
