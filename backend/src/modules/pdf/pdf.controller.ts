import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Request, Response } from 'express';
import { PdfService } from './pdf.service';

interface AuthedRequest extends Request {
  user: { id: string; email: string; role: string };
}

@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(private readonly pdf: PdfService) {}

  @Get('invoice/:transactionId')
  async invoice(@Param('transactionId') id: string, @Req() req: AuthedRequest, @Res() res: Response) {
    const buf = await this.pdf.invoiceForTransaction(id, req.user.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="sufuf-invoice-${id.slice(-8)}.pdf"`);
    res.send(buf);
  }

  @Get('design/:designId')
  async design(@Param('designId') id: string, @Req() req: AuthedRequest, @Res() res: Response) {
    const buf = await this.pdf.designPresentation(id, req.user.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="sufuf-design-${id.slice(-8)}.pdf"`);
    res.send(buf);
  }
}
