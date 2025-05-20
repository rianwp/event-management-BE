import { TokenService } from 'src/auth/token/token.service';
import { AuthMiddleware } from './auth.middleware';
import { ConfigService } from '@nestjs/config';

describe('AuthMiddleware', () => {
  it('should be defined', () => {
    expect(
      new AuthMiddleware(new TokenService(), new ConfigService()),
    ).toBeDefined();
  });
});
