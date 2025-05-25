import { Injectable } from '@nestjs/common';
import { hash, verify } from 'argon2';

@Injectable()
export class PasswordService {
  async hashPassword(password: string) {
    return await hash(password);
  }

  async comparePassword(plainPassword: string, hashedPassword: string) {
    return await verify(hashedPassword, plainPassword);
  }
}
