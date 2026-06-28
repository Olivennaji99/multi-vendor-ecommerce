import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

import {
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
  type PaymentProviderName,
  type PaymentStatus,
} from "../types/enums";

export interface IPayment extends Document {
  order: Types.ObjectId;
  provider: PaymentProviderName;
  providerReference: string;
  amount: number;
  status: PaymentStatus;
  paidAt: Date | null;
  rawResponse: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    provider: { type: String, enum: PAYMENT_PROVIDERS, required: true },
    providerReference: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: "PENDING" },
    paidAt: { type: Date, default: null },
    rawResponse: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);
