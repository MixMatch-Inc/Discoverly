import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
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
export class StellarPaymentProvider implements PaymentProvider {
  readonly id: PaymentProviderId = "stellar"

  private readonly horizonUrl: string
  private readonly defaultDestinationAddress?: string
  private readonly network: string

  constructor(private readonly configService: ConfigService) {
    this.network = this.configService.get<string>("STELLAR_NETWORK") ?? "testnet"
    this.horizonUrl = this.readHorizonUrl()
    this.defaultDestinationAddress = this.configService.get<string>("STELLAR_DESTINATION_ADDRESS")
  }

  async createIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent> {
    const destinationAddress = input.destinationAddress || this.defaultDestinationAddress

    if (!destinationAddress) {
      throw new BadRequestException(
        "Missing Stellar destination address in request and STELLAR_DESTINATION_ADDRESS env var",
      )
    }

    return {
      provider: this.id,
      reference: `stellar-${input.orderId}-${Date.now()}`,
      amount: this.normalizeAmount(input.amount),
      currency: input.currency,
      destinationAddress,
      memo: input.orderId,
    }
  }

  async submit(input: SubmitPaymentInput): Promise<SubmittedPayment> {
    if (!input.signedPayload?.trim()) {
      throw new BadRequestException("signedPayload is required")
    }

    const response = await this.requestJson<StellarSubmittedTransaction>(
      `${this.horizonUrl}/transactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ tx: input.signedPayload }).toString(),
      },
    )

    return {
      provider: this.id,
      txHash: response.hash,
      status: response.successful ? "submitted" : "failed",
    }
  }

  async verify(input: VerifyPaymentInput): Promise<VerifiedPayment> {
    const tx = await this.requestJson<StellarTransaction>(
      `${this.horizonUrl}/transactions/${encodeURIComponent(input.txHash)}`,
    )
    const operations = await this.requestJson<StellarOperationsPage>(
      `${this.horizonUrl}/transactions/${encodeURIComponent(input.txHash)}/operations?limit=200`,
    )

    const matchedPayment = operations?._embedded?.records?.find((operation) => {
      if (operation.type !== "payment") {
        return false
      }

      if (!operation.to || !operation.amount) {
        return false
      }

      return (
        operation.to === input.expectedDestinationAddress &&
        this.normalizeAmount(operation.amount) === this.normalizeAmount(input.expectedAmount)
      )
    })

    const memoMatches = String(tx.memo ?? "") === input.orderId
    const confirmed = Boolean(tx.successful && memoMatches && matchedPayment)

    return {
      provider: this.id,
      txHash: tx.hash,
      status: tx.successful ? "confirmed" : "failed",
      confirmed,
      ledger: tx.ledger ? String(tx.ledger) : undefined,
    }
  }

  async getStatus(txHash: string): Promise<PaymentStatus> {
    if (!txHash?.trim()) {
      throw new BadRequestException("txHash is required")
    }

    try {
      const tx = await this.requestJson<StellarTransaction>(
        `${this.horizonUrl}/transactions/${encodeURIComponent(txHash)}`,
      )

      if (tx.successful) {
        return "confirmed"
      }

      return "failed"
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return "pending"
      }

      throw error
    }
  }

  private readHorizonUrl(): string {
    const configuredUrl = this.configService.get<string>("STELLAR_HORIZON_URL")
    if (configuredUrl?.trim()) {
      return configuredUrl
    }

    return this.network === "public"
      ? "https://horizon.stellar.org"
      : "https://horizon-testnet.stellar.org"
  }

  private normalizeAmount(rawAmount: string): string {
    const parsed = Number(rawAmount)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new BadRequestException(`Invalid amount: ${rawAmount}`)
    }

    return parsed.toFixed(7)
  }

  private isNotFoundError(error: unknown): boolean {
    return Boolean(
      typeof error === "object" &&
        error &&
        "status" in error &&
        (error as { status?: number }).status === 404,
    )
  }

  private async requestJson<T>(url: string, init?: RequestInit): Promise<T> {
    let response: Response

    try {
      response = await fetch(url, init)
    } catch {
      throw new ServiceUnavailableException("Stellar Horizon is unreachable")
    }

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      const message =
        (payload as { detail?: string; extras?: { result_codes?: unknown } }).detail ||
        "Stellar Horizon request failed"
      throw new HorizonRequestError(response.status, message)
    }

    return payload as T
  }
}

class HorizonRequestError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
    this.name = "HorizonRequestError"
  }
}

interface StellarSubmittedTransaction {
  hash: string
  successful: boolean
}

interface StellarTransaction {
  hash: string
  successful: boolean
  memo?: string
  ledger?: number
}

interface StellarPaymentOperation {
  type: string
  to?: string
  amount?: string
}

interface StellarOperationsPage {
  _embedded?: {
    records?: StellarPaymentOperation[]
  }
}
