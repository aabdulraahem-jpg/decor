import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { UsersService } from './users.service';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';

interface AuthedRequest extends Request {
  user: { id: string; email: string; role: string };
}

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // GET /api/v1/users/me — بيانات المستخدم الحالي
  @Get('me')
  me(@Req() req: AuthedRequest) {
    return this.users.findById(req.user.id);
  }

  // GET /api/v1/users/:id — للأدمن فقط
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.users.findById(id);
  }
}
