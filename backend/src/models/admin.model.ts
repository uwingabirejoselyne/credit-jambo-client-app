import mongoose, { Document, Schema } from 'mongoose';

// Admin roles
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  SUPPORT = 'support',
}

// Interface for Admin document
export interface IAdmin extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: AdminRole;
  isActive: boolean;
  permissions: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for Admin
const AdminSchema = new Schema<IAdmin>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      default: AdminRole.SUPPORT,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete (ret as any).password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes for better query performance
AdminSchema.index({ email: 1 });
AdminSchema.index({ phone: 1 });
AdminSchema.index({ role: 1 });

// Virtual for full name
AdminSchema.virtual('fullName').get(function (this: IAdmin) {
  return `${this.firstName} ${this.lastName}`;
});

export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
