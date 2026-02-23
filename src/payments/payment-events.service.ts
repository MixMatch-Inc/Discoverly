import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { LessThanOrEqual, Repository } from "typeorm"
import { type PaymentEventStatus, PaymentEvent } from "./entities/payment-event.entity"

interface EnqueuePaymentEventInput {
  provider: string
  eventId: string
  txHash?: string
  orderId?: string
  destinationAddress?: string
  amount?: string
  memo?: string
  payload?: Record<string, unknown>
}

@Injectable()
export class PaymentEventsService {
  constructor(
    @InjectRepository(PaymentEvent)
    private readonly repository: Repository<PaymentEvent>,
  ) {}

  async enqueue(input: EnqueuePaymentEventInput): Promise<{ event: PaymentEvent; created: boolean }> {
    const existing = await this.repository.findOne({
      where: {
        provider: input.provider,
        eventId: input.eventId,
      },
    })

    if (existing) {
      return { event: existing, created: false }
    }

    const created = this.repository.create({
      provider: input.provider,
      eventId: input.eventId,
      txHash: input.txHash,
      orderId: input.orderId,
      destinationAddress: input.destinationAddress,
      amount: input.amount,
      memo: input.memo,
      payload: input.payload,
      status: "received",
      retries: 0,
      nextAttemptAt: new Date(),
    })

    return { event: await this.repository.save(created), created: true }
  }

  findPending(limit: number): Promise<PaymentEvent[]> {
    const now = new Date()
    return this.repository.find({
      where: [
        { status: "received", nextAttemptAt: LessThanOrEqual(now) },
        { status: "failed", nextAttemptAt: LessThanOrEqual(now) },
      ],
      order: { createdAt: "ASC" },
      take: limit,
    })
  }

  async markProcessing(event: PaymentEvent): Promise<PaymentEvent> {
    event.status = "processing"
    return this.repository.save(event)
  }

  async markProcessed(event: PaymentEvent): Promise<PaymentEvent> {
    event.status = "processed"
    event.processedAt = new Date()
    event.lastError = undefined
    event.nextAttemptAt = undefined
    return this.repository.save(event)
  }

  async markFailed(event: PaymentEvent, lastError: string, nextAttemptAt: Date): Promise<PaymentEvent> {
    event.status = "failed"
    event.retries += 1
    event.lastError = lastError
    event.nextAttemptAt = nextAttemptAt
    return this.repository.save(event)
  }

  async markRequeued(event: PaymentEvent): Promise<PaymentEvent> {
    event.status = "received"
    event.nextAttemptAt = new Date()
    return this.repository.save(event)
  }

  async updateStatusByTxHash(
    provider: string,
    txHash: string,
    status: PaymentEventStatus,
  ): Promise<void> {
    await this.repository.update(
      {
        provider,
        txHash,
      },
      {
        status,
        processedAt: status === "processed" ? new Date() : undefined,
      },
    )
  }
}
