import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PaymentEventsService } from "./payment-events.service"
import { PaymentsService } from "./payments.service"
import { PaymentStreamCursorsService } from "./payment-stream-cursors.service"

interface StellarPaymentsPage {
  _embedded?: {
    records?: Array<{
      paging_token?: string
      transaction_hash?: string
      amount?: string
      to?: string
      memo?: string
      transaction_successful?: boolean
    }>
  }
}

@Injectable()
export class PaymentsListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentsListenerService.name)
  private timer?: NodeJS.Timeout
  private running = false

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentsService: PaymentsService,
    private readonly paymentEventsService: PaymentEventsService,
    private readonly paymentStreamCursorsService: PaymentStreamCursorsService,
  ) {}

  onModuleInit(): void {
    const intervalMs = this.getNumberConfig("PAYMENT_LISTENER_INTERVAL_MS", 20_000)
    this.timer = setInterval(() => {
      void this.pollStellarPayments()
    }, intervalMs)
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  async pollStellarPayments(): Promise<void> {
    if (this.running || this.paymentsService.providerId !== "stellar") {
      return
    }

    const destinationAddress = this.configService.get<string>("STELLAR_DESTINATION_ADDRESS")
    if (!destinationAddress) {
      return
    }

    this.running = true

    try {
      const streamKey = `account:${destinationAddress}`
      const initialCursor = this.configService.get<string>("STELLAR_PAYMENTS_START_CURSOR") ?? "now"
      const currentCursor =
        (await this.paymentStreamCursorsService.getCursor("stellar", streamKey)) ?? initialCursor
      const limit = this.getNumberConfig("PAYMENT_LISTENER_BATCH_SIZE", 50)
      const horizonUrl = this.readHorizonUrl()

      const url = `${horizonUrl}/accounts/${encodeURIComponent(
        destinationAddress,
      )}/payments?order=asc&limit=${limit}&cursor=${encodeURIComponent(currentCursor)}`
      const page = await this.requestJson<StellarPaymentsPage>(url)
      const records = page._embedded?.records ?? []

      let latestCursor = currentCursor
      for (const record of records) {
        if (!record.paging_token || !record.transaction_hash) {
          continue
        }

        const eventId = `stellar:${record.paging_token}`
        await this.paymentEventsService.enqueue({
          provider: "stellar",
          eventId,
          txHash: record.transaction_hash,
          destinationAddress: record.to,
          amount: record.amount,
          memo: record.memo,
          payload: record as unknown as Record<string, unknown>,
        })

        latestCursor = record.paging_token
      }

      if (latestCursor !== currentCursor) {
        await this.paymentStreamCursorsService.upsertCursor("stellar", streamKey, latestCursor)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown listener failure"
      this.logger.warn(`Stellar payment listener poll failed: ${message}`)
    } finally {
      this.running = false
    }
  }

  private readHorizonUrl(): string {
    const configuredUrl = this.configService.get<string>("STELLAR_HORIZON_URL")
    if (configuredUrl?.trim()) {
      return configuredUrl
    }

    const network = this.configService.get<string>("STELLAR_NETWORK") ?? "testnet"
    return network === "public"
      ? "https://horizon.stellar.org"
      : "https://horizon-testnet.stellar.org"
  }

  private getNumberConfig(key: string, fallback: number): number {
    const raw = this.configService.get<string | number>(key)
    if (raw === undefined || raw === null || raw === "") {
      return fallback
    }
    const parsed = Number(raw)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback
    }
    return parsed
  }

  private async requestJson<T>(url: string): Promise<T> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Horizon request failed: ${response.status}`)
    }
    return (await response.json()) as T
  }
}
