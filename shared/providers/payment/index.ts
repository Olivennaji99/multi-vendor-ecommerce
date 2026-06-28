import { DummyPaymentProvider } from "./dummy-payment.provider";
import type { PaymentProvider } from "./payment-provider.interface";

let cachedProvider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = process.env.PAYMENT_PROVIDER ?? "dummy";

  if (providerName === "dummy") {
    cachedProvider = new DummyPaymentProvider();
    return cachedProvider;
  }

  throw new Error(
    `Unsupported PAYMENT_PROVIDER: ${providerName}. Only 'dummy' is implemented in this build.`
  );
}

export * from "./payment-provider.interface";
