import { Injectable, NestMiddleware } from '@nestjs/common';
import { TokenService } from 'src/auth/token/token.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private tokenService: TokenService) {}
  use(req: any, res: any, next: () => void) {
    const token = (req as Request).headers['authorization'] as string;
    if (token) {
      const payload = this.tokenService.verfiyToken(token);

      if (payload) {
        req.user = payload;
      }
    }
    next();
  }
}
