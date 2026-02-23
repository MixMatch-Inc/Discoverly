import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PAYMENT_PROVIDER } from "./constants/payment.constants"
import type { PaymentProviderId } from "./interfaces/payment-provider.interface"
import { FlarePaymentProvider } from "./providers/flare-payment.provider"
import { StellarPaymentProvider } from "./providers/stellar-payment.provider"
import { PaymentsService } from "./payments.service"

const SUPPORTED_PAYMENT_PROVIDERS: PaymentProviderId[] = ["flare", "stellar"]

@Module({
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
    PaymentsService,
  ],
  exports: [PAYMENT_PROVIDER, PaymentsService],
})
export class PaymentsModule {}
