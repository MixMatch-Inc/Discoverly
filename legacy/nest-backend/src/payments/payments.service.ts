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
import { PaymentTransactionsService } from "./payment-transactions.service"

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
    private readonly paymentTransactionsService: PaymentTransactionsService,
  ) {}

  get providerId() {
    return this.provider.id
  }

  createIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent> {
    return this.provider.createIntent(input)
  }

  async submit(input: SubmitPaymentInput): Promise<SubmittedPayment> {
    const submitted = await this.provider.submit(input)

    await this.paymentTransactionsService.upsertByTxHash({
      provider: submitted.provider,
      txHash: submitted.txHash,
      orderId: input.orderId,
      amount: input.amount,
      destinationAddress: input.destinationAddress,
      memo: input.memo,
      asset: input.asset,
      status: submitted.status === "failed" ? "failed" : "submitted",
    })

    return submitted
  }

  async verify(input: VerifyPaymentInput): Promise<VerifiedPayment> {
    const verified = await this.provider.verify(input)

    await this.paymentTransactionsService.upsertByTxHash({
      provider: verified.provider,
      txHash: verified.txHash,
      orderId: input.orderId,
      amount: input.expectedAmount,
      destinationAddress: input.expectedDestinationAddress,
      memo: input.orderId,
      status: verified.confirmed ? "confirmed" : verified.status === "failed" ? "failed" : "pending",
      ledger: verified.ledger,
    })

    return verified
  }

  async getStatus(txHash: string): Promise<PaymentStatus> {
    const status = await this.provider.getStatus(txHash)
    await this.paymentTransactionsService.upsertByTxHash({
      provider: this.provider.id,
      txHash,
      status: status === "failed" ? "failed" : status === "confirmed" ? "confirmed" : "pending",
    })
    return status
  }
}
