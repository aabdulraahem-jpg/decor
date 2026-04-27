import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DesignsService } from './designs.service';
import { GenerateDesignDto } from './dto/generate-design.dto';

interface AuthUser { id: string }

@Controller('designs')
@UseGuards(JwtAuthGuard)
export class DesignsController {
  constructor(private readonly svc: DesignsService) {}

  @Post('generate')
  generate(@Body() dto: GenerateDesignDto, @CurrentUser() user: AuthUser) {
    return this.svc.generate(user.id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.svc.findOne(id, user.id);
  }
}
