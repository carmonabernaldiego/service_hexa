import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export default class LoginCommand {
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  public email!: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  public password!: string;

  @IsOptional()
  @IsString()
  public twoFactorCode?: string;
}
