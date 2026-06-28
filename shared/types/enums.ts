export const ROLES = ["ADMIN", "SELLER", "CUSTOMER"] as const;
export type Role = (typeof ROLES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["PENDING", "SUCCEEDED", "FAILED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_PROVIDERS = ["DUMMY", "STRIPE", "PAYSTACK", "FLUTTERWAVE"] as const;
export type PaymentProviderName = (typeof PAYMENT_PROVIDERS)[number];

export const DISCOUNT_TYPES = ["PERCENTAGE", "FIXED"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export const DISCOUNT_APPLIES_TO = ["PRODUCT", "CATEGORY"] as const;
export type DiscountAppliesTo = (typeof DISCOUNT_APPLIES_TO)[number];

export const NOTIFICATION_TYPES = [
  "ORDER_PLACED",
  "ORDER_STATUS_CHANGED",
  "LOW_STOCK",
  "NEW_SELLER_CREATED",
  "PASSWORD_CHANGE_REQUIRED",
  "REVIEW_RECEIVED",
  "DISCOUNT_STARTED",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const AUDIT_ACTIONS = [
  "SELLER_CREATED",
  "SELLER_UPDATED",
  "USER_DEACTIVATED",
  "USER_REACTIVATED",
  "PRODUCT_CREATED",
  "PRODUCT_UPDATED",
  "PRODUCT_DELETED",
  "CATEGORY_CREATED",
  "CATEGORY_UPDATED",
  "CATEGORY_DELETED",
  "ORDER_STATUS_CHANGED",
  "DISCOUNT_CREATED",
  "DISCOUNT_UPDATED",
  "DISCOUNT_DELETED",
  "HOMEPAGE_SECTION_UPDATED",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const ANALYTICS_SCOPES = ["PLATFORM", "SELLER"] as const;
export type AnalyticsScope = (typeof ANALYTICS_SCOPES)[number];

export const ANALYTICS_PERIODS = ["DAILY", "MONTHLY"] as const;
export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

export const STORAGE_PROVIDERS = ["local", "s3"] as const;
export type StorageProviderName = (typeof STORAGE_PROVIDERS)[number];
