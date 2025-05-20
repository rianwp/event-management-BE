import { HttpException, Injectable } from '@nestjs/common';
import { LoginRequest, RegisterRequest } from '../model/auth.model';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ValidationService } from 'src/common/validation/validation.service';
import { PasswordService } from './password/password.service';
import { nanoid } from 'nanoid';
import { TokenService } from './token/token.service';
import dayjs from 'dayjs';
import { AuthValidation } from './auth.validation';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private passwordService: PasswordService,
    private tokenService: TokenService,
  ) {}

  async register(req: RegisterRequest) {
    const {
      fullName,
      email,
      password,
      profilePicture,
      phoneNumber,
      referralCodeUsed,
    } = this.validationService.validate(
      AuthValidation.REGISTER,
      req,
    ) as RegisterRequest;

    const existingUser = await this.prismaService.users.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException('Email already exist', 400);
    }

    const hashedPassword = await this.passwordService.hashPassword(password);
    const referralCode = nanoid(10);

    const result = await this.prismaService.$transaction(async (tx) => {
      const refererUser = await tx.users.findFirst({
        where: { referralCode: referralCodeUsed },
      });

      if (!refererUser) {
        throw new HttpException('Referral code is invalid', 400);
      }

      const newUser = await tx.users.create({
        data: {
          fullName: fullName,
          email: email,
          password: hashedPassword,
          phoneNumber: phoneNumber,
          profilePicture: profilePicture,
          referralCode: referralCode,
        },
        omit: { password: true, deletedAt: true, referralCode: true },
      });

      if (referralCodeUsed) {
        await tx.referrals.create({
          data: {
            refererUserId: refererUser.id,
            referredUserId: newUser.id,
          },
        });

        await tx.coupons.create({
          data: {
            name: 'Diskon Rp 20.000',
            userId: newUser.id,
            couponCode: `DISKON-h`,
            discount: 20000,
            expiredDate: dayjs().add(3, 'month').toDate(),
          },
        });

        const pointsUser = await tx.points.findFirst({
          where: { userId: refererUser.id },
        });

        if (!pointsUser) {
          await tx.points.create({
            data: {
              userId: refererUser.id,
              pointsValue: 10000,
              expiredDate: dayjs().add(3, 'month').toDate(),
            },
          });
        } else {
          await tx.points.update({
            where: { id: pointsUser.id },
            data: {
              pointsValue: { increment: 10000 },
              expiredDate: dayjs().add(3, 'month').toDate(),
            },
          });
        }
      }

      return newUser;
    });

    return result;
  }

  async login(req: LoginRequest) {
    const { email, password } = this.validationService.validate(
      AuthValidation.LOGIN,
      req,
    ) as LoginRequest;

    const user = await this.prismaService.users.findFirst({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        password: true,
      },
    });

    if (!user) {
      throw new HttpException('Invalid credentials', 400);
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', 400);
    }

    const accessToken = this.tokenService.generateToken(
      { id: user.id },
      { expiresIn: '2h' },
    );

    const safeUser = {
      ...user,
      password: undefined,
    };

    return { user: safeUser, accessToken };
  }

  registerOrganizer() {
    return 'register organizer';
  }

  forgotPassword() {
    return 'forgot password';
  }

  resetPassword() {
    return 'reset password';
  }

  changePassword() {
    return 'change password';
  }
}
