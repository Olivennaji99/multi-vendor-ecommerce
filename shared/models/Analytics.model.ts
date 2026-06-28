import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

import {
  ANALYTICS_PERIODS,
  ANALYTICS_SCOPES,
  type AnalyticsPeriod,
  type AnalyticsScope,
} from "../types/enums";

export interface IAnalytics extends Document {
  scope: AnalyticsScope;
  seller: Types.ObjectId | null;
  period: AnalyticsPeriod;
  periodKey: string;
  revenue: number;
  orderCount: number;
  unitsSold: number;
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    scope: { type: String, enum: ANALYTICS_SCOPES, required: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", default: null },
    period: { type: String, enum: ANALYTICS_PERIODS, required: true },
    periodKey: { type: String, required: true },
    revenue: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    unitsSold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

analyticsSchema.index({ scope: 1, seller: 1, period: 1, periodKey: 1 }, { unique: true });

export const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics || mongoose.model<IAnalytics>("Analytics", analyticsSchema);
