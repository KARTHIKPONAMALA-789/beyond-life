import mongoose, { Document, Schema } from "mongoose";

export interface INomineeRequest {
  nomineeId: mongoose.Types.ObjectId;
  willId: mongoose.Types.ObjectId;
  secretKey: string; // Add secretKey field
  status: string;
  requestDate: Date;
  proof?: string;
  deathCertificate?: string;
  deathCertificateVerified: boolean;
  lastAccessed?: Date;
}

const nomineeRequestSchema = new Schema<INomineeRequest>({
  nomineeId: { type: Schema.Types.ObjectId, ref: "Nominee", required: true },
  willId: { type: Schema.Types.ObjectId, ref: "Will", required: true },
  secretKey: { type: String, required: true }, // Add to schema
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  requestDate: { type: Date, default: Date.now },
  proof: { type: String },
  deathCertificate: { type: String },
  deathCertificateVerified: { type: Boolean, default: false },
  lastAccessed: { type: Date },
});

export const NomineeRequest = mongoose.model<INomineeRequest>("NomineeRequest", nomineeRequestSchema);