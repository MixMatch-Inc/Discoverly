import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PaymentTransactionsService } from "./payment-transactions.service"
import { PaymentsService } from "./payments.service"

@Injectable()
export class PaymentsReconciliationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentsReconciliationService.name)
  private timer?: NodeJS.Timeout
  private running = false

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentsService: PaymentsService,
    private readonly paymentTransactionsService: PaymentTransactionsService,
  ) {}

  onModuleInit(): void {
    const intervalMs = this.getNumberConfig("PAYMENT_RECONCILIATION_INTERVAL_MS", 60_000)
    this.timer = setInterval(() => {
      void this.reconcilePendingTransactions()
    }, intervalMs)
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  async reconcilePendingTransactions(): Promise<void> {
    if (this.running) {
      return
    }

    if (this.paymentsService.providerId !== "stellar") {
      return
    }

    this.running = true
    const batchSize = this.getNumberConfig("PAYMENT_RECONCILIATION_BATCH_SIZE", 50)
    const staleThresholdMs = this.getNumberConfig("PAYMENT_RECONCILIATION_STALE_MS", 30_000)
    const staleBefore = new Date(Date.now() - staleThresholdMs)

    try {
      const candidates = await this.paymentTransactionsService.findReconciliationCandidates({
        limit: batchSize,
        staleBefore,
      })

      for (const tx of candidates) {
        try {
          const status = await this.paymentsService.getStatus(tx.txHash)
          await this.paymentTransactionsService.upsertByTxHash({
            provider: tx.provider,
            txHash: tx.txHash,
            status,
            orderId: tx.orderId,
            destinationAddress: tx.destinationAddress,
            amount: tx.amount,
            memo: tx.memo,
            asset: tx.asset,
            ledger: tx.ledger,
          })
        } catch (error) {
          const reason = error instanceof Error ? error.message : "Unknown reconciliation failure"
          await this.paymentTransactionsService.upsertByTxHash({
            provider: tx.provider,
            txHash: tx.txHash,
            status: "pending",
            orderId: tx.orderId,
            destinationAddress: tx.destinationAddress,
            amount: tx.amount,
            memo: tx.memo,
            asset: tx.asset,
            failureReason: reason,
            incrementRetries: true,
          })
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown batch reconciliation failure"
      this.logger.error(`Payment reconciliation batch failed: ${message}`)
    } finally {
      this.running = false
    }
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
