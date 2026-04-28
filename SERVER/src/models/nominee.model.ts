import mongoose, { Schema, model } from "mongoose";
import { IBaseUser, IbaseUserSchema } from "./base.model";

// Extended interface for Nominee-specific fields
export interface INominee extends IBaseUser {
  mobile: string;
  address: string;
  photo: string;
  date_of_birth: Date;
  gender: "Male" | "Female" | "Other";
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  relation: string;
  registeredBy: mongoose.Schema.Types.ObjectId;
  nomineeSign: string;                // ✅ SHA-256 hash of signature image
  signatureUrl?: string;             // ✅ Optional preview URL
  attributes: { [key: string]: string | number | boolean }; // ✅ For policy-based access
}

// Mongoose schema for Nominee
const nomineeSchema = new Schema<INominee>(
  {
    ...IbaseUserSchema, // Reuse fields like username, email, password, etc.
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    photo: { type: String, required: true },
    date_of_birth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    relation: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip_code: { type: String, required: true },
    country: { type: String, required: true },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    nomineeSign: { type: String, required: true },     // ✅ SHA-256 hash
    signatureUrl: { type: String, required: false },   // ✅ For preview
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}, // ✅ Allow any attribute type
    },
  },
  { timestamps: true }
);

// Export the Mongoose model
export const Nominee = model<INominee>("Nominee", nomineeSchema);
