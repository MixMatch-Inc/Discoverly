import { Inject, Injectable } from "@nestjs/common"
import { PAYMENT_PROVIDER } from "./constants/payment.constants"
import type {
  CreatePaymentIntentInput,
  PaymentProvider,
  PaymentStatus,
  PaymentIntent,
  SubmitPaymentInput,
  SubmittedPayment,
  VerifyPaymentInput,
  VerifiedPayment,
} from "./interfaces/payment-provider.interface"

@Injectable()
export class PaymentsService {
  constructor(@Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider) {}

  get providerId() {
    return this.provider.id
  }

  createIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent> {
    return this.provider.createIntent(input)
  }

  submit(input: SubmitPaymentInput): Promise<SubmittedPayment> {
    return this.provider.submit(input)
  }

  verify(input: VerifyPaymentInput): Promise<VerifiedPayment> {
    return this.provider.verify(input)
  }

  getStatus(txHash: string): Promise<PaymentStatus> {
    return this.provider.getStatus(txHash)
  }
}
