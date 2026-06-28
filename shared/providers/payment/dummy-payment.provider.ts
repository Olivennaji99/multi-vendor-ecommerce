import { randomUUID } from "crypto";

import type {
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProvider,
  VerifyPaymentResult,
} from "./payment-provider.interface";

export class DummyPaymentProvider implements PaymentProvider {
  async initiate(_input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    return { providerReference: `DUMMY-${randomUUID()}` };
  }

  async verify(_providerReference: string): Promise<VerifyPaymentResult> {
    return {
      status: "SUCCEEDED",
      rawResponse: { simulated: true, verifiedAt: new Date().toISOString() },
    };
  }
}
