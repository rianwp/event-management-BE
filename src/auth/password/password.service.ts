import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';

@Injectable()
export class PasswordService {
  async hashPassword(password: string) {
    return await argon2.hash(password);
  }

  async comparePassword(plainPassword: string, hashedPassword: string) {
    return await argon2.verify(hashedPassword, plainPassword);
  }
}
