import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { DatabaseModule } from "./database/database.module"
import { UsersModule } from "./users/users.module"
import { PaymentsModule } from "./payments/payments.module"
import { PaymentEvent } from "./payments/entities/payment-event.entity"
import { PaymentStreamCursor } from "./payments/entities/payment-stream-cursor.entity"
import { User } from './users/entities/user.entity';
import { PaymentTransaction } from "./payments/entities/payment-transaction.entity"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
      TypeOrmModule.forRoot({
      type: 'postgres', 
      url: process.env.DATABASE_URL, 
      entities: [User, PaymentTransaction, PaymentEvent, PaymentStreamCursor], 
      synchronize: true, 
    }),
    AuthModule,
    DatabaseModule,
    UsersModule,
    PaymentsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AppService,
  ],
  controllers: [AppController],
})
export class AppModule {}
