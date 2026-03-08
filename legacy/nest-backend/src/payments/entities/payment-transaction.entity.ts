import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

export type PaymentTransactionStatus = "submitted" | "pending" | "confirmed" | "failed"

@Entity({ name: "payment_transactions" })
export class PaymentTransaction {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  provider: string

  @Index({ unique: true })
  @Column()
  txHash: string

  @Index()
  @Column({ nullable: true })
  orderId?: string

  @Column({ nullable: true })
  destinationAddress?: string

  @Column({ nullable: true })
  asset?: string

  @Column({ nullable: true })
  memo?: string

  @Column({ type: "decimal", precision: 20, scale: 7, nullable: true })
  amount?: string

  @Column({ type: "varchar", default: "pending" })
  status: PaymentTransactionStatus

  @Column({ nullable: true })
  ledger?: string

  @Column({ type: "int", default: 0 })
  retries: number

  @Column({ type: "text", nullable: true })
  failureReason?: string

  @Column({ type: "timestamp", nullable: true })
  lastCheckedAt?: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
