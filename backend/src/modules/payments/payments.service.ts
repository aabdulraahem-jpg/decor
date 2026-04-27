import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ApsService, ApsWebhookPayload } from './aps.service';
import { PackagesService } from '../packages/packages.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aps: ApsService,
    private readonly packages: PackagesService,
    private readonly config: ConfigService,
  ) {}

  // Build APS credentials from DB ApiSetting (admin-managed)
  private async getApsConfig() {
    const setting = await this.prisma.apiSetting.findFirst({
      where: { provider: 'APS', isActive: true },
    });

    // Fallback to env vars if DB setting not yet configured
    const merchantId =
      (setting?.modelConfigJson as Record<string, string> | null)?.merchantId ??
      this.config.get<string>('APS_MERCHANT_ID') ??
      '';
    const accessCode =
      (setting?.modelConfigJson as Record<string, string> | null)?.accessCode ??
      this.config.get<string>('APS_ACCESS_CODE') ??
      '';
    const shaRequest =
      (setting?.modelConfigJson as Record<string, string> | null)?.shaRequestPhrase ??
      this.config.get<string>('APS_SHA_REQUEST') ??
      '';
    const shaResponse =
      (setting?.modelConfigJson as Record<string, string> | null)?.shaResponsePhrase ??
      this.config.get<string>('APS_SHA_RESPONSE') ??
      '';
    const baseUrl =
      (setting?.modelConfigJson as Record<string, string> | null)?.baseUrl ??
      this.config.get<string>('APS_BASE_URL') ??
      'https://checkout.paymentservices.amazon.com/FortAPI/paymentPage';

    return { merchantId, accessCode, shaRequest, shaResponse, baseUrl };
  }

  async initiateCheckout(
    userId: string,
    packageId: string,
    returnUrl: string,
    userEmail: string,
    userName: string,
  ) {
    const pkg = await this.packages.findOne(packageId);
    const cfg = await this.getApsConfig();

    if (!cfg.merchantId || !cfg.accessCode || !cfg.shaRequest) {
      throw new BadRequestException('Payment gateway not configured. Contact admin.');
    }

    // Create pending transaction
    const tx = await this.prisma.transaction.create({
      data: {
        userId,
        packageId,
        amountPaid: pkg.priceSar,
        pointsAdded: pkg.pointsAmount,
        paymentProvider: 'APS',
        status: 'PENDING',
      },
    });

    const checkoutUrl = this.aps.buildCheckoutUrl({
      merchantIdentifier: cfg.merchantId,
      accessCode: cfg.accessCode,
      shaRequestPhrase: cfg.shaRequest,
      baseUrl: cfg.baseUrl,
      merchantReference: tx.id,
      amountSar: Number(pkg.priceSar),
      customerEmail: userEmail,
      customerName: userName ?? 'Customer',
      returnUrl,
    });

    return { transactionId: tx.id, checkoutUrl };
  }

  async handleWebhook(payload: ApsWebhookPayload) {
    const cfg = await this.getApsConfig();

    if (!this.aps.verifyWebhook(payload, cfg.shaResponse)) {
      this.logger.warn('APS webhook: invalid signature — ignoring');
      return { received: true };
    }

    const txId = payload.merchant_reference;
    if (!txId) return { received: true };

    const tx = await this.prisma.transaction.findUnique({ where: { id: txId } });
    if (!tx || tx.status !== 'PENDING') return { received: true };

    if (this.aps.isSuccess(payload)) {
      await this.prisma.$transaction([
        this.prisma.transaction.update({
          where: { id: txId },
          data: {
            status: 'SUCCESS',
            apsTransactionId: payload.fort_id,
            apsPaymentMethod: payload.payment_option,
            apsResponsePayload: payload as unknown as Prisma.InputJsonValue,
          },
        }),
        this.prisma.user.update({
          where: { id: tx.userId },
          data: { pointsBalance: { increment: tx.pointsAdded } },
        }),
      ]);
      this.logger.log(`Payment SUCCESS: txId=${txId}, points=${tx.pointsAdded}`);
    } else {
      await this.prisma.transaction.update({
        where: { id: txId },
        data: {
          status: 'FAILED',
          apsResponsePayload: payload as unknown as Prisma.InputJsonValue,
        },
      });
      this.logger.warn(`Payment FAILED: txId=${txId}, code=${payload.response_code}`);
    }

    return { received: true };
  }

  async getUserTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: { package: { select: { name: true, pointsAmount: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // Verify return URL callback (after user returns from APS)
  async verifyReturn(payload: ApsWebhookPayload) {
    const cfg = await this.getApsConfig();

    if (!this.aps.verifyWebhook(payload, cfg.shaResponse)) {
      throw new BadRequestException('Invalid payment signature');
    }

    const txId = payload.merchant_reference;
    if (!txId) throw new NotFoundException('Transaction not found');

    const tx = await this.prisma.transaction.findUnique({
      where: { id: txId },
      include: { package: { select: { name: true, pointsAmount: true } } },
    });

    if (!tx) throw new NotFoundException('Transaction not found');

    return {
      transactionId: tx.id,
      status: tx.status,
      pointsAdded: tx.pointsAdded,
      packageName: tx.package.name,
      amount: tx.amountPaid,
    };
  }
}
