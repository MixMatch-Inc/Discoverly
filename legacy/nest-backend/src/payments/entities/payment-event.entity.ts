import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm"

export type PaymentEventStatus = "received" | "processing" | "processed" | "failed"

@Entity({ name: "payment_events" })
@Unique(["provider", "eventId"])
export class PaymentEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Index()
  @Column()
  provider: string

  @Index()
  @Column()
  eventId: string

  @Index()
  @Column({ nullable: true })
  txHash?: string

  @Column({ nullable: true })
  orderId?: string

  @Column({ nullable: true })
  destinationAddress?: string

  @Column({ nullable: true })
  amount?: string

  @Column({ nullable: true })
  memo?: string

  @Column({ type: "simple-json", nullable: true })
  payload?: Record<string, unknown>

  @Column({ type: "varchar", default: "received" })
  status: PaymentEventStatus

  @Column({ type: "int", default: 0 })
  retries: number

  @Column({ type: "timestamp", nullable: true })
  nextAttemptAt?: Date

  @Column({ type: "text", nullable: true })
  lastError?: string

  @Column({ type: "timestamp", nullable: true })
  processedAt?: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
