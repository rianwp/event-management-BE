import { Body, Controller, Get, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest } from 'src/model/auth.model';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/register')
  @HttpCode(200)
  async register(@Body() req: RegisterRequest) {
    const result = await this.authService.register(req);
    return {
      data: result,
    };
  }

  @Get('/login')
  @HttpCode(200)
  async login(@Body() req: LoginRequest) {
    const result = await this.authService.login(req);
    return {
      data: result,
    };
  }

  @Get('/register-organizer')
  @HttpCode(200)
  registerOrganizer() {
    return this.authService.registerOrganizer();
  }

  @Get('/forgot-password')
  @HttpCode(200)
  forgotPassword() {
    return this.authService.forgotPassword();
  }

  @Get('/reset-password')
  @HttpCode(200)
  resetPassword() {
    return this.authService.resetPassword();
  }

  @Get('/change-password')
  @HttpCode(200)
  changePassword() {
    return this.authService.changePassword();
  }
}
