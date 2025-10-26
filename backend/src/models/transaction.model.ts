import mongoose, { Document, Schema } from 'mongoose';

// Transaction types
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  INTEREST = 'interest',
  FEE = 'fee',
}

// Transaction status
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Interface for Transaction document
export interface ITransaction extends Document {
  customerId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  description?: string;
  reference: string; // Unique transaction reference
  relatedTransactionId?: mongoose.Types.ObjectId; // For transfers
  processedBy?: mongoose.Types.ObjectId; // Admin who processed
  processedAt?: Date;
  failureReason?: string;
  metadata?: Record<string, any>; // Additional data
  createdAt: Date;
  updatedAt: Date;
}

// Schema for Transaction
const TransactionSchema = new Schema<ITransaction>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    balanceBefore: {
      type: Number,
      required: [true, 'Balance before is required'],
    },
    balanceAfter: {
      type: Number,
      required: [true, 'Balance after is required'],
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    relatedTransactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    processedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
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
TransactionSchema.index({ customerId: 1, createdAt: -1 });
TransactionSchema.index({ reference: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ createdAt: -1 });

// Compound index for customer transaction history
TransactionSchema.index({ customerId: 1, status: 1, createdAt: -1 });

// Virtual to check if transaction is modifiable
TransactionSchema.virtual('isModifiable').get(function (this: ITransaction) {
  return this.status === TransactionStatus.PENDING;
});

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
