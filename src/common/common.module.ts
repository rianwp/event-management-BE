import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './error/error.filter';
import { ValidationService } from './validation/validation.service';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail/mail.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    MailService,
  ],
  exports: [PrismaService, ValidationService, MailService],
})
export class CommonModule {}
