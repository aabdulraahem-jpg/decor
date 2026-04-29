import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminService } from './admin.service';
import { StorageService } from '../storage/storage.service';
import { UpdateApsSettingsDto, UpdateAiSettingsDto } from './dto/settings.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly svc: AdminService,
    private readonly storage: StorageService,
  ) {}

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

  // ─── Admin design uploads (free designs for implementation clients) ──

  /** List a user's projects + their designs (for admin-uploaded designs UI). */
  @Get('users/:id/projects')
  listUserProjects(@Param('id') id: string) {
    return this.svc.listUserProjects(id);
  }

  /** Create a new project owned by the given user. */
  @Post('users/:id/projects')
  createProjectForUser(
    @Param('id') id: string,
    @Body() body: { name: string; roomType?: string; originalImageUrl?: string; kind?: 'SINGLE' | 'SKETCH' },
  ) {
    return this.svc.createProjectForUser(id, body);
  }

  /** Append a hand-uploaded design image to an existing project. */
  @Post('projects/:id/designs')
  addDesign(
    @Param('id') id: string,
    @Body() body: { generatedImageUrl: string; spaceLabel?: string; notes?: string; imageSize?: string },
  ) {
    return this.svc.addDesignToProject(id, body);
  }

  /** Delete a design that was uploaded by an admin (refuses non-admin rows). */
  @Delete('designs/:id')
  removeDesign(@Param('id') id: string) {
    return this.svc.deleteAdminDesign(id);
  }

  /** Multipart upload helper: admin uploads an image and gets back a hosted URL. */
  @Post('uploads/design')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDesignImage(@UploadedFile() file: Express.Multer.File): Promise<{ url: string }> {
    const url = await this.storage.saveAsWebp(file, 'references', { quality: 88 });
    return { url };
  }
}
