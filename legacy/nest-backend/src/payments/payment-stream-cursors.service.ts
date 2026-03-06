import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { PaymentStreamCursor } from "./entities/payment-stream-cursor.entity"

@Injectable()
export class PaymentStreamCursorsService {
  constructor(
    @InjectRepository(PaymentStreamCursor)
    private readonly repository: Repository<PaymentStreamCursor>,
  ) {}

  async getCursor(provider: string, streamKey: string): Promise<string | undefined> {
    const record = await this.repository.findOne({
      where: { provider, streamKey },
    })

    return record?.cursor
  }

  async upsertCursor(provider: string, streamKey: string, cursor: string): Promise<PaymentStreamCursor> {
    const existing = await this.repository.findOne({
      where: { provider, streamKey },
    })

    if (!existing) {
      const created = this.repository.create({
        provider,
        streamKey,
        cursor,
      })
      return this.repository.save(created)
    }

    existing.cursor = cursor
    return this.repository.save(existing)
  }
}
