import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PAYMENT_PROVIDER } from "./constants/payment.constants"
import { PaymentTransaction } from "./entities/payment-transaction.entity"
import type { PaymentProviderId } from "./interfaces/payment-provider.interface"
import { PaymentTransactionsService } from "./payment-transactions.service"
import { PaymentsReconciliationService } from "./payments-reconciliation.service"
import { FlarePaymentProvider } from "./providers/flare-payment.provider"
import { StellarPaymentProvider } from "./providers/stellar-payment.provider"
import { PaymentsService } from "./payments.service"

const SUPPORTED_PAYMENT_PROVIDERS: PaymentProviderId[] = ["flare", "stellar"]

@Module({
  imports: [TypeOrmModule.forFeature([PaymentTransaction])],
  providers: [
    FlarePaymentProvider,
    StellarPaymentProvider,
    {
      provide: PAYMENT_PROVIDER,
      inject: [ConfigService, FlarePaymentProvider, StellarPaymentProvider],
      useFactory: (
        configService: ConfigService,
        flareProvider: FlarePaymentProvider,
        stellarProvider: StellarPaymentProvider,
      ) => {
        const provider = String(configService.get("PAYMENT_PROVIDER") ?? "flare").toLowerCase()

        if (!SUPPORTED_PAYMENT_PROVIDERS.includes(provider as PaymentProviderId)) {
          throw new Error(
            `Unsupported PAYMENT_PROVIDER: ${provider}. Supported values: ${SUPPORTED_PAYMENT_PROVIDERS.join(", ")}`,
          )
        }

        return provider === "stellar" ? stellarProvider : flareProvider
      },
    },
    PaymentTransactionsService,
    PaymentsService,
    PaymentsReconciliationService,
  ],
  exports: [PAYMENT_PROVIDER, PaymentsService, PaymentTransactionsService],
})
export class PaymentsModule {}
