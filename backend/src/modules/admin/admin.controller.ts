import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminService } from './admin.service';
import { UpdateApsSettingsDto, UpdateAiSettingsDto } from './dto/settings.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  // Dashboard
  @Get('stats')
  getStats() {
    return this.svc.getStats();
  }

  // Users
  @Get('users')
  getUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('search') search?: string,
  ) {
    return this.svc.getUsers(Number(page), Number(limit), search);
  }

  @Patch('users/:id/points')
  adjustPoints(@Param('id') id: string, @Body('amount') amount: number) {
    return this.svc.adjustPoints(id, amount);
  }

  // Transactions
  @Get('transactions')
  getTransactions(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('status') status?: string,
  ) {
    return this.svc.getTransactions(Number(page), Number(limit), status);
  }

  // APS Settings
  @Get('settings/aps')
  getApsSettings() {
    return this.svc.getApsSettings();
  }

  @Put('settings/aps')
  updateApsSettings(@Body() dto: UpdateApsSettingsDto) {
    return this.svc.updateApsSettings(dto);
  }

  // AI Settings
  @Get('settings/ai')
  getAiSettings() {
    return this.svc.getAiSettings();
  }

  @Put('settings/ai')
  updateAiSettings(@Body() dto: UpdateAiSettingsDto) {
    return this.svc.updateAiSettings(dto);
  }

  // AI Logs
  @Get('logs/ai')
  getAiLogs(@Query('page') page = '1', @Query('limit') limit = '50') {
    return this.svc.getAiLogs(Number(page), Number(limit));
  }
}
