import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ApsWebhookPayload } from './aps.service';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  // Initiate APS checkout — returns URL to redirect user
  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  initiate(@Body() dto: InitiatePaymentDto, @CurrentUser() user: AuthUser) {
    return this.svc.initiateCheckout(
      user.id,
      dto.packageId,
      dto.returnUrl,
      user.email,
      user.name ?? 'Customer',
    );
  }

  // APS redirect return (GET — user lands here after payment)
  @Post('return')
  @HttpCode(HttpStatus.OK)
  handleReturn(@Body() payload: ApsWebhookPayload) {
    return this.svc.verifyReturn(payload);
  }

  // APS server-to-server webhook (POST)
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  webhook(@Body() payload: ApsWebhookPayload) {
    return this.svc.handleWebhook(payload);
  }

  // User transaction history
  @Get('history')
  @UseGuards(JwtAuthGuard)
  history(@CurrentUser() user: AuthUser) {
    return this.svc.getUserTransactions(user.id);
  }
}
