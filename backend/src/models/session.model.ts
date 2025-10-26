import mongoose, { Document, Schema } from 'mongoose';

// Session types
export enum SessionType {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

// Interface for Session document
export interface ISession extends Document {
  isExpired: any;
  userId: mongoose.Types.ObjectId;
  userType: SessionType;
  token: string;
  deviceIdHash: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  expiresAt: Date;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for Session
const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      index: true,
    },
    userType: {
      type: String,
      enum: Object.values(SessionType),
      required: [true, 'User type is required'],
    },
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true,
      index: true,
    },
    deviceIdHash: {
      type: String,
      required: [true, 'Device ID hash is required'],
      index: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes for better query performance
SessionSchema.index({ userId: 1, userType: 1, isActive: 1 });
SessionSchema.index({ deviceIdHash: 1, isActive: 1 });
SessionSchema.index({ expiresAt: 1 }); // For cleanup of expired sessions

// Virtual to check if session is expired
SessionSchema.virtual('isExpired').get(function (this: ISession) {
  return new Date() > this.expiresAt;
});

// Virtual to check if session is valid
SessionSchema.virtual('isValid').get(function (this: ISession) {
  return this.isActive && !this.isExpired;
});

// Method to update last activity
SessionSchema.methods.updateActivity = function () {
  this.lastActivityAt = new Date();
  return this.save();
};

// Static method to cleanup expired sessions
SessionSchema.statics.cleanupExpired = async function () {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false },
    ],
  });
};

export const Session = mongoose.model<ISession>('Session', SessionSchema);
