import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PAYMENT_PROVIDER } from "./constants/payment.constants"
import { PaymentEvent } from "./entities/payment-event.entity"
import { PaymentStreamCursor } from "./entities/payment-stream-cursor.entity"
import { PaymentTransaction } from "./entities/payment-transaction.entity"
import { PaymentEventsService } from "./payment-events.service"
import { PaymentsEventsProcessorService } from "./payments-events-processor.service"
import { PaymentsListenerService } from "./payments-listener.service"
import { PaymentsWebhookController } from "./payments-webhook.controller"
import { PaymentTransactionsService } from "./payment-transactions.service"
import { PaymentStreamCursorsService } from "./payment-stream-cursors.service"
import { PaymentsReconciliationService } from "./payments-reconciliation.service"
import { StellarPaymentProvider } from "./providers/stellar-payment.provider"
import { PaymentsService } from "./payments.service"

@Module({
  imports: [TypeOrmModule.forFeature([PaymentTransaction, PaymentEvent, PaymentStreamCursor])],
  providers: [
    StellarPaymentProvider,
    {
      provide: PAYMENT_PROVIDER,
      useExisting: StellarPaymentProvider,
    },
    PaymentTransactionsService,
    PaymentEventsService,
    PaymentStreamCursorsService,
    PaymentsService,
    PaymentsReconciliationService,
    PaymentsListenerService,
    PaymentsEventsProcessorService,
  ],
  controllers: [PaymentsWebhookController],
  exports: [PAYMENT_PROVIDER, PaymentsService, PaymentTransactionsService],
})
export class PaymentsModule {}
