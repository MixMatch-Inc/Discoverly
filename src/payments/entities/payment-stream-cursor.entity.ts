import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm"

@Entity({ name: "payment_stream_cursors" })
@Unique(["provider", "streamKey"])
export class PaymentStreamCursor {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  provider: string

  @Column()
  streamKey: string

  @Column({ type: "text", nullable: true })
  cursor?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
