import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

import { AUDIT_ACTIONS, type AuditAction } from "../types/enums";

export interface IAuditLog extends Document {
  actor: Types.ObjectId;
  action: AuditAction;
  entityType: string;
  entityId: Types.ObjectId;
  meta: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: AUDIT_ACTIONS, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: null },
  },
  { timestamps: true }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
