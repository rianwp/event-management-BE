import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JwtPayload,
  sign,
  SignOptions,
  TokenExpiredError,
  verify,
} from 'jsonwebtoken';

@Injectable()
export class TokenService {
  constructor(private configService: ConfigService) {}
  generateToken(payload: object, option: SignOptions): string {
    try {
      return sign(
        payload,
        this.configService.get('JWT_SECRET_KEY') || '',
        option,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(`Error generating token: ${errorMessage}`, 500);
    }
  }

  verfiyToken(token: string) {
    let result: string | JwtPayload | undefined;
    verify(
      token,
      this.configService.get('JWT_SECRET_KEY') || '',
      (err, payload) => {
        if (err || !payload) {
          if (err instanceof TokenExpiredError) {
            throw new HttpException('Token expired', 401);
          } else {
            throw new HttpException('Unauthorized, invalid token', 401);
          }
        } else {
          result = payload;
        }
      },
    );

    return result;
  }
}
