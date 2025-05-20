import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenService } from 'src/auth/token/token.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private tokenService: TokenService,
    private configService: ConfigService,
  ) {}
  use(req: any, res: any, next: () => void) {
    const token = (req as Request).headers['authorization'] as string;
    if (token) {
      const payload = this.tokenService.verfiyToken(
        token,
        this.configService.get('JWT_SECRET_KEY') || '',
      );

      if (payload) {
        req.user = payload;
      }
    }
    next();
  }
}
