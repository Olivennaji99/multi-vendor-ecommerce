export interface InitiatePaymentInput {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
}

export interface InitiatePaymentResult {
  providerReference: string;
  redirectUrl?: string;
}

export interface VerifyPaymentResult {
  status: "SUCCEEDED" | "FAILED" | "PENDING";
  rawResponse: Record<string, unknown>;
}

export interface PaymentProvider {
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  verify(providerReference: string): Promise<VerifyPaymentResult>;
}
