import { Response } from 'express';

export interface TwoFactorAuthProvider {
  generateSecret(
    userId: string,
    email: string,
  ): Promise<{
    secret: string;
    otpAuthUrl: string;
  }>;
  generateQrCode(stream: Response, otpPathUrl: string): Promise<void>;
  verifyCode(userId: string, code: string): Promise<boolean>;
}
