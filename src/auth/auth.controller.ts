import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterOrganizerRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../model/auth.model';
import { Auth } from '../common/auth/auth.decorator';
import { Users } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @HttpCode(200)
  async register(@Body() req: RegisterRequest) {
    const result = await this.authService.register(req);
    return {
      data: result,
    };
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() req: LoginRequest) {
    const result = await this.authService.login(req);
    return {
      data: result,
    };
  }

  @Post('/register-organizer')
  @HttpCode(200)
  async registerOrganizer(@Body() req: RegisterOrganizerRequest) {
    const result = await this.authService.registerOrganizer(req);
    return {
      data: result,
    };
  }

  @Post('/forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() req: ForgotPasswordRequest) {
    const result = await this.authService.forgotPassword(req);
    return {
      data: result,
    };
  }

  @Post('/reset-password')
  @HttpCode(200)
  async resetPassword(@Auth() user: Users, @Body() req: ResetPasswordRequest) {
    const result = await this.authService.resetPassword(req, user.id);
    return {
      data: result,
    };
  }

  @Post('/change-password')
  @HttpCode(200)
  async changePassword(
    @Auth() user: Users,
    @Body() req: ChangePasswordRequest,
  ) {
    const result = await this.authService.changePassword(req, user.id);
    return {
      data: result,
    };
  }
}
