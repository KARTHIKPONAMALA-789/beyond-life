import mongoose, { Document, Schema } from 'mongoose';

export interface IWill extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  encryptedFilePath: string;
  fileType: string;
  encryptedAESKey: string;
  integrityHash: string;
  iv: string;                                // ✅ Add this line
  attributes: { [key: string]: string | number | boolean | string[] | { operator: string; value: number } }; policy: string;
  nomineeIds: mongoose.Types.ObjectId[];
  signature?: string;
  publicKey?: string;
  uploadedAt: Date;
}

const WillSchema: Schema<IWill> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  encryptedFilePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  encryptedAESKey: {
    type: String,
    required: true
  },
  integrityHash: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  attributes: {
    type: [String],
    required: true
  },
  policy: {
    type: String,
    enum: ["Standard","SecureStorage", "ApprovalBased", "MultiNominee", "TimeLocked", "AutoTransfer"],
    required: true,
  },
  nomineeIds: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Nominee',
      required: false
    }
  ],
  signature: {
    type: String,
    required: false
  },
  publicKey: {
    type: String,
    required: false
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

export const WillModel = mongoose.model<IWill>('Will', WillSchema);
