import { HttpException, Injectable } from '@nestjs/common';
import {
  JwtPayload,
  sign,
  SignOptions,
  TokenExpiredError,
  verify,
} from 'jsonwebtoken';

@Injectable()
export class TokenService {
  constructor() {}
  generateToken(
    payload: object,
    secretKey: string,
    option: SignOptions,
  ): string {
    try {
      return sign(payload, secretKey, option);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(`Error generating token: ${errorMessage}`, 500);
    }
  }

  verfiyToken(token: string, secretKey: string) {
    let result: string | JwtPayload | undefined;
    verify(token, secretKey, (err, payload) => {
      if (err || !payload) {
        if (err instanceof TokenExpiredError) {
          throw new HttpException('Token expired', 401);
        } else {
          throw new HttpException('Unauthorized, invalid token', 401);
        }
      } else {
        result = payload;
      }
    });

    return result;
  }
}
