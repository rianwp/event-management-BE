export class RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  profilePicture: string;
  referralCodeUsed?: string;
}

export class LoginRequest {
  email: string;
  password: string;
}

export class ForgotPasswordRequest {
  email: string;
}

export class ResetPasswordRequest {
  password: string;
}

export enum BankName {
  BCA = 'BCA',
  BRI = 'BRI',
  BNI = 'BNI',
}

export class RegisterOrganizerRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  profilePicture: string;
  referralCodeUsed?: string;
  npwp: string;
  norek: string;
  bankName: BankName;
}

export class ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
