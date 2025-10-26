import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  customer: mongoose.Types.ObjectId;
  sessionId: string;
  deviceIdHash: string;
  accessToken: string;
  refreshToken: string;
  isActive: boolean;
  expiresAt: Date;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceIdHash: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
SessionSchema.index({ customer: 1, isActive: 1 });
SessionSchema.index({ sessionId: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic cleanup

// Method to check if session is expired
SessionSchema.methods.isExpired = function (): boolean {
  return this.expiresAt < new Date();
};

// Static method to invalidate all sessions for a customer
SessionSchema.statics.invalidateCustomerSessions = async function (
  customerId: mongoose.Types.ObjectId
): Promise<void> {
  await this.updateMany(
    { customer: customerId, isActive: true },
    { isActive: false }
  );
};

export const Session = mongoose.model<ISession>('Session', SessionSchema);
