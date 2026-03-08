import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { In, IsNull, LessThanOrEqual, Repository } from "typeorm"
import {
  type PaymentTransactionStatus,
  PaymentTransaction,
} from "./entities/payment-transaction.entity"

interface UpsertPaymentTransactionInput {
  provider: string
  txHash: string
  orderId?: string
  destinationAddress?: string
  asset?: string
  memo?: string
  amount?: string
  status?: PaymentTransactionStatus
  ledger?: string
  failureReason?: string
  incrementRetries?: boolean
}

interface ReconciliationCandidatesOptions {
  limit: number
  staleBefore: Date
}

@Injectable()
export class PaymentTransactionsService {
  constructor(
    @InjectRepository(PaymentTransaction)
    private readonly repository: Repository<PaymentTransaction>,
  ) {}

  async upsertByTxHash(input: UpsertPaymentTransactionInput): Promise<PaymentTransaction> {
    const existing = await this.repository.findOne({ where: { txHash: input.txHash } })

    if (!existing) {
      const created = this.repository.create({
        provider: input.provider,
        txHash: input.txHash,
        orderId: input.orderId,
        destinationAddress: input.destinationAddress,
        asset: input.asset,
        memo: input.memo,
        amount: input.amount,
        status: input.status ?? "pending",
        ledger: input.ledger,
        failureReason: input.failureReason,
        retries: input.incrementRetries ? 1 : 0,
        lastCheckedAt: new Date(),
      })
      return this.repository.save(created)
    }

    existing.provider = input.provider ?? existing.provider
    existing.orderId = input.orderId ?? existing.orderId
    existing.destinationAddress = input.destinationAddress ?? existing.destinationAddress
    existing.asset = input.asset ?? existing.asset
    existing.memo = input.memo ?? existing.memo
    existing.amount = input.amount ?? existing.amount
    existing.status = this.resolveNextStatus(existing.status, input.status)
    existing.ledger = input.ledger ?? existing.ledger
    existing.failureReason = input.failureReason ?? existing.failureReason
    existing.lastCheckedAt = new Date()
    if (input.incrementRetries) {
      existing.retries += 1
    }

    return this.repository.save(existing)
  }

  findReconciliationCandidates(
    options: ReconciliationCandidatesOptions,
  ): Promise<PaymentTransaction[]> {
    return this.repository.find({
      where: [
        {
          status: In(["pending", "submitted"]),
          lastCheckedAt: IsNull(),
        },
        {
          status: In(["pending", "submitted"]),
          lastCheckedAt: LessThanOrEqual(options.staleBefore),
        },
      ],
      order: { updatedAt: "ASC" },
      take: options.limit,
    })
  }

  findByOrderId(orderId: string): Promise<PaymentTransaction[]> {
    return this.repository.find({
      where: { orderId },
      order: { createdAt: "DESC" },
    })
  }

  findByTxHash(txHash: string): Promise<PaymentTransaction | null> {
    return this.repository.findOne({ where: { txHash } })
  }

  private resolveNextStatus(
    current: PaymentTransactionStatus,
    incoming?: PaymentTransactionStatus,
  ): PaymentTransactionStatus {
    if (!incoming) {
      return current
    }

    if (current === "confirmed") {
      return "confirmed"
    }

    if (incoming === "confirmed") {
      return "confirmed"
    }

    if (current === "failed" && incoming !== "confirmed") {
      return "failed"
    }

    return incoming
  }
}
