import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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

  // PATCH /api/v1/users/me — تعديل الاسم
  @Patch('me')
  updateMe(@Req() req: AuthedRequest, @Body() body: { name?: string }) {
    return this.users.updateName(req.user.id, body.name ?? '');
  }

  // GET /api/v1/users/:id — للأدمن فقط
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.users.findById(id);
  }
}
