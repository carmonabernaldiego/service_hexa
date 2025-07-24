import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsObject,
  ValidateIf,
  Length,
} from 'class-validator';

export default class UserCommand {
  /* ---------- Nombre ---------- */
  @ValidateIf((o) => o.role !== 'farmacia') // requerido para todos excepto farmacia
  @IsString()
  @Transform(({ value }) => value?.trim())
  public nombre!: string;

  /* ---------- Apellidos ---------- */
  @IsOptional() // ← ahora opcional
  @ValidateIf((o) => o.role !== 'farmacia') // si NO es farmacia y viene ⇒ string
  @IsString()
  @Transform(({ value }) => value?.trim())
  public apellidoPaterno?: string; // ← ‘?’ porque puede faltar

  @IsOptional()
  @ValidateIf((o) => o.role !== 'farmacia')
  @IsString()
  @Transform(({ value }) => value?.trim())
  public apellidoMaterno?: string;
  /* ---------- CURP / RFC ---------- */
  @IsString()
  @Transform(({ value }) => value.trim().toUpperCase())
  public curp!: string; // Para farmacia se enviará el RFC aquí

  @IsOptional()
  @ValidateIf((o) => o.role === 'farmacia' && o.rfc && o.rfc.trim() !== '')
  @Length(12, 13, { message: 'El RFC debe tener entre 12 y 13 caracteres' })
  @IsString()
  public rfc?: string;

  /* ---------- Imagen ---------- */
  @IsOptional()
  @IsString()
  public imagen?: string;

  /* ---------- Credenciales ---------- */
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  public email?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  public password?: string;

  /* ---------- 2FA ---------- */
  @IsOptional()
  @IsString()
  public twoFactorAuthSecret?: string;

  @IsOptional()
  @IsBoolean()
  public isTwoFactorEnable?: boolean;

  /* ---------- Rol ---------- */
  @IsOptional()
  @IsEnum(['paciente', 'admin', 'medico', 'farmacia'] as const)
  public role?: string;

  /* ---------- Otros ---------- */
  @IsOptional()
  @IsBoolean()
  public active?: boolean;

  @IsOptional()
  @IsString()
  public passwordResetCode?: string;

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
  @Transform(({ value }) =>
    typeof value === 'string' ? safeJSON(value) : value,
  )
  public permisosPrescripcion?: any;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) =>
    typeof value === 'string' ? safeJSON(value) : value,
  )
  public declaracionTerminos?: any;
}

/* ---------- Helper ---------- */
function safeJSON(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
}
