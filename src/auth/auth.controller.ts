import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest } from 'src/model/auth.model';

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
  registerOrganizer() {
    return this.authService.registerOrganizer();
  }

  @Post('/forgot-password')
  @HttpCode(200)
  forgotPassword() {
    return this.authService.forgotPassword();
  }

  @Post('/reset-password')
  @HttpCode(200)
  resetPassword() {
    return this.authService.resetPassword();
  }

  @Post('/change-password')
  @HttpCode(200)
  changePassword() {
    return this.authService.changePassword();
  }
}
