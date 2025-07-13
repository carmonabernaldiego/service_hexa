import { IsEmail, IsString } from 'class-validator';

export class RequestPasswordResetCommand {
  @IsEmail()
  email: string;
}

export class ConfirmPasswordResetCommand {
  @IsString()
  code: string;

  @IsString()
  newPassword: string;

  @IsEmail()
  email: string;
}
