export type PaymentProviderId = "flare" | "stellar"

export type PaymentStatus =
  | "created"
  | "submitted"
  | "pending"
  | "confirmed"
  | "failed"

export interface CreatePaymentIntentInput {
  orderId: string
  amount: string
  currency: string
  destinationAddress?: string
}

export interface PaymentIntent {
  provider: PaymentProviderId
  reference: string
  amount: string
  currency: string
  destinationAddress: string
  memo?: string
}

export interface SubmitPaymentInput {
  signedPayload: string
}

export interface SubmittedPayment {
  provider: PaymentProviderId
  txHash: string
  status: PaymentStatus
}

export interface VerifyPaymentInput {
  txHash: string
  orderId: string
  expectedAmount: string
  expectedDestinationAddress: string
}

export interface VerifiedPayment {
  provider: PaymentProviderId
  txHash: string
  status: PaymentStatus
  confirmed: boolean
  ledger?: string
}

export interface PaymentProvider {
  readonly id: PaymentProviderId

  createIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent>
  submit(input: SubmitPaymentInput): Promise<SubmittedPayment>
  verify(input: VerifyPaymentInput): Promise<VerifiedPayment>
  getStatus(txHash: string): Promise<PaymentStatus>
}
