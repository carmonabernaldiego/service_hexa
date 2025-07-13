import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsObject,
} from 'class-validator';

export default class UserCommand {
  @IsString()
  @Transform(({ value }) => value.trim())
  public nombre!: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  public apellidoPaterno!: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  public apellidoMaterno!: string;

  @IsString()
  @Transform(({ value }) => value.trim().toUpperCase())
  public curp!: string;

  @IsOptional()
  @IsString()
  public imagen?: string;

  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  public email!: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  public password!: string;

  @IsOptional()
  @IsString()
  public twoFactorAuthSecret?: string;

  @IsOptional()
  @IsBoolean()
  public isTwoFactorEnable?: boolean;

  @IsOptional()
  @IsEnum(['paciente', 'admin', 'medico', 'farmacia'] as const)
  public role?: string;

  @IsOptional()
  @IsBoolean()
  public active?: boolean;

  @IsOptional()
  @IsString()
  public passwordResetCode?: string;

  @IsOptional()
  @IsString()
  public rfc?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return undefined;
    try {
      return new Date(value).toISOString().substring(0, 10);
    } catch {
      return undefined;
    }
  })
  public fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  public cedulaProfesional?: string;

  @IsOptional()
  @IsString()
  public telefono?: string;

  @IsOptional()
  @IsString()
  public domicilio?: string;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    return value;
  })
  public permisosPrescripcion?: any;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    return value;
  })
  public declaracionTerminos?: any;
}
