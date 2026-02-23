import { Injectable, NotImplementedException } from "@nestjs/common"
import type {
  CreatePaymentIntentInput,
  PaymentProvider,
  PaymentProviderId,
  PaymentStatus,
  PaymentIntent,
  SubmitPaymentInput,
  SubmittedPayment,
  VerifyPaymentInput,
  VerifiedPayment,
} from "../interfaces/payment-provider.interface"

@Injectable()
export class FlarePaymentProvider implements PaymentProvider {
  readonly id: PaymentProviderId = "flare"

  async createIntent(_input: CreatePaymentIntentInput): Promise<PaymentIntent> {
    throw new NotImplementedException("Flare payment adapter is not implemented yet")
  }

  async submit(_input: SubmitPaymentInput): Promise<SubmittedPayment> {
    throw new NotImplementedException("Flare payment adapter is not implemented yet")
  }

  async verify(_input: VerifyPaymentInput): Promise<VerifiedPayment> {
    throw new NotImplementedException("Flare payment adapter is not implemented yet")
  }

  async getStatus(_txHash: string): Promise<PaymentStatus> {
    throw new NotImplementedException("Flare payment adapter is not implemented yet")
  }
}
