import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PaymentEventsService } from "./payment-events.service"
import { PaymentTransactionsService } from "./payment-transactions.service"
import { PaymentsService } from "./payments.service"

@Injectable()
export class PaymentsEventsProcessorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentsEventsProcessorService.name)
  private timer?: NodeJS.Timeout
  private running = false

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentsService: PaymentsService,
    private readonly paymentEventsService: PaymentEventsService,
    private readonly paymentTransactionsService: PaymentTransactionsService,
  ) {}

  onModuleInit(): void {
    const intervalMs = this.getNumberConfig("PAYMENT_EVENT_PROCESSOR_INTERVAL_MS", 5_000)
    this.timer = setInterval(() => {
      void this.processPendingEvents()
    }, intervalMs)
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  async processPendingEvents(): Promise<void> {
    if (this.running || this.paymentsService.providerId !== "stellar") {
      return
    }

    this.running = true
    const batchSize = this.getNumberConfig("PAYMENT_EVENT_PROCESSOR_BATCH_SIZE", 25)
    const candidates = await this.paymentEventsService.findPending(batchSize)

    try {
      for (const event of candidates) {
        await this.paymentEventsService.markProcessing(event)

        try {
          if (!event.txHash || !event.destinationAddress || !event.amount) {
            await this.paymentEventsService.markProcessed(event)
            continue
          }

          const existingTx = await this.paymentTransactionsService.findByTxHash(event.txHash)
          if (existingTx?.status === "confirmed") {
            await this.paymentEventsService.markProcessed(event)
            continue
          }

          const orderId = event.orderId ?? event.memo
          if (!orderId) {
            await this.paymentEventsService.markProcessed(event)
            continue
          }

          const verification = await this.paymentsService.verify({
            txHash: event.txHash,
            orderId,
            expectedAmount: event.amount,
            expectedDestinationAddress: event.destinationAddress,
          })

          if (!verification.confirmed) {
            throw new Error("transaction not confirmed yet")
          }

          await this.paymentEventsService.markProcessed(event)
        } catch (error) {
          const lastError = error instanceof Error ? error.message : "unknown event processing failure"
          const nextAttemptAt = this.computeBackoffDate(event.retries + 1)
          await this.paymentEventsService.markFailed(event, lastError, nextAttemptAt)
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown processor failure"
      this.logger.error(`Payment event processing batch failed: ${message}`)
    } finally {
      this.running = false
    }
  }

  private computeBackoffDate(retries: number): Date {
    const baseMs = this.getNumberConfig("PAYMENT_EVENT_RETRY_BASE_MS", 5_000)
    const maxMs = this.getNumberConfig("PAYMENT_EVENT_RETRY_MAX_MS", 300_000)
    const backoffMs = Math.min(maxMs, baseMs * 2 ** Math.max(0, retries - 1))
    return new Date(Date.now() + backoffMs)
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
}
