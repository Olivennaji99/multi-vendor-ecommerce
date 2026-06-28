import { AuditLog } from "../models/AuditLog.model";
import type { AuditAction } from "../types/enums";

export interface WriteAuditLogInput {
  actor: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  meta?: Record<string, unknown>;
  ipAddress?: string | null;
}

export async function writeAuditLog(input: WriteAuditLogInput) {
  return AuditLog.create({
    actor: input.actor,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    meta: input.meta ?? {},
    ipAddress: input.ipAddress ?? null,
  });
}
