import { HttpException, Injectable } from '@nestjs/common';
import {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterOrganizerRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../model/auth.model';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ValidationService } from 'src/common/validation/validation.service';
import { PasswordService } from './password/password.service';
import { nanoid } from 'nanoid';
import { TokenService } from './token/token.service';
import dayjs from 'dayjs';
import { AuthValidation } from './auth.validation';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/common/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private passwordService: PasswordService,
    private tokenService: TokenService,
    private configService: ConfigService,
    private mailService: MailService,
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
      const newUser = await tx.users.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          phoneNumber,
          profilePicture,
          referralCode,
        },
        omit: { password: true, deletedAt: true, referralCode: true },
      });

      if (referralCodeUsed) {
        const refererUser = await tx.users.findFirst({
          where: { referralCode: referralCodeUsed },
        });

        if (!refererUser) {
          throw new HttpException('Referral code is invalid', 400);
        }

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
      this.configService.get('JWT_SECRET_KEY') || '',
      { expiresIn: '2h' },
    );

    const safeUser = {
      ...user,
      password: undefined,
    };

    return { user: safeUser, accessToken };
  }

  async forgotPassword(req: ForgotPasswordRequest) {
    const { email } = this.validationService.validate(
      AuthValidation.FORGOT_PASSWORD,
      req,
    ) as ForgotPasswordRequest;

    const user = await this.prismaService.users.findFirst({
      where: { email },
    });

    if (!user) {
      throw new HttpException('Invalid email address', 400);
    }

    const token = this.tokenService.generateToken(
      { id: user.id },
      this.configService.get('JWT_SECRET_KEY_FORGOT_PASSWORD') || '',
      { expiresIn: '1h' },
    );

    const link = `${this.configService.get('BASE_URL_FE')}/forgot-password/reset-password/${token}`;

    await this.mailService.sendEmail(
      email,
      'Link reset password',
      'forgot-password',
      { name: user.fullName, resetLink: link, expiryTime: 1 },
    );

    return { message: 'Send email succsess' };
  }

  async resetPassword(req: ResetPasswordRequest, authUserId: number) {
    const { password } = this.validationService.validate(
      AuthValidation.RESET_PASSWORD,
      req,
    ) as ResetPasswordRequest;

    const user = await this.prismaService.users.findFirst({
      where: { id: authUserId },
    });

    if (!user) {
      throw new HttpException('User not found', 400);
    }

    const hashedPassword = await this.passwordService.hashPassword(password);

    const update = await this.prismaService.users.update({
      where: { id: authUserId },
      data: { password: hashedPassword },
    });

    if (!update) {
      throw new HttpException('Error updating data', 500);
    }

    return { message: 'Reset password success' };
  }

  async registerOrganizer(req: RegisterOrganizerRequest) {
    const {
      name,
      email,
      password,
      profilePicture,
      phoneNumber,
      // referralCodeUsed,
      bankName,
      norek,
      npwp,
    } = this.validationService.validate(
      AuthValidation.REGISTER_ORGANIZER,
      req,
    ) as RegisterOrganizerRequest;

    const existingAdmin = await this.prismaService.users.findFirst({
      where: { email },
    });

    if (existingAdmin) {
      throw new HttpException('Email already exists', 400);
    }

    const hashedPassword = await this.passwordService.hashPassword(password);

    const referralCode = nanoid(10);

    const result = await this.prismaService.$transaction(async (tx) => {
      const newUser = await tx.users.create({
        data: {
          email,
          password: hashedPassword,
          fullName: name,
          phoneNumber,
          profilePicture,
          referralCode,
          role: 'ORGANIZER',
        },
      });

      const newOrganizer = await tx.organizer.create({
        data: {
          userId: newUser.id,
          name,
          phoneNumber,
          profilePicture,
          npwp,
          bankName,
          norek,
        },
      });

      return { newUser, newOrganizer };
    });

    const { newUser, newOrganizer } = result;

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
      organizer: newOrganizer,
    };
  }

  async changePassword(req: ChangePasswordRequest, authUserId: number) {
    const { oldPassword, newPassword } = this.validationService.validate(
      AuthValidation.CHANGE_PASSWORD,
      req,
    ) as ChangePasswordRequest;

    const user = await this.prismaService.users.findFirst({
      where: { id: authUserId },
    });

    if (!user) {
      throw new HttpException('Invalid user id', 400);
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      oldPassword,
      user?.password || '',
    );

    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', 400);
    }

    const hashedNewPassword =
      await this.passwordService.hashPassword(newPassword);

    const update = await this.prismaService.users.update({
      where: { id: authUserId },
      data: { password: hashedNewPassword },
    });

    if (!update) {
      throw new HttpException('Error updating data', 500);
    }

    return { message: 'Change password success' };
  }
}
