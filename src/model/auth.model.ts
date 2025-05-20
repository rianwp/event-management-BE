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
