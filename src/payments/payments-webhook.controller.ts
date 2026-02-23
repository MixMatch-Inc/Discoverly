import { BadRequestException, Body, Controller, Post } from "@nestjs/common"
import { Public } from "../auth/decorators/public.decorator"
import type { StellarEventDto } from "./dto/stellar-event.dto"
import { PaymentEventsService } from "./payment-events.service"

@Controller("payments/webhooks")
export class PaymentsWebhookController {
  constructor(private readonly paymentEventsService: PaymentEventsService) {}

  @Public()
  @Post("stellar")
  async receiveStellarEvent(@Body() body: StellarEventDto) {
    if (!body.eventId?.trim()) {
      throw new BadRequestException("eventId is required")
    }

    const event = await this.paymentEventsService.enqueue({
      provider: "stellar",
      eventId: body.eventId,
      txHash: body.txHash,
      orderId: body.orderId,
      destinationAddress: body.destinationAddress,
      amount: body.amount,
      memo: body.memo,
      payload: body.payload,
    })

    return {
      accepted: true,
      duplicate: !event.created,
      eventId: body.eventId,
    }
  }
}
