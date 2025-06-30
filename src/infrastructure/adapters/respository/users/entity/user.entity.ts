import { Document } from 'mongoose';

export interface UserEntity extends Document {
  nombre: string;
  readonly apellidoPaterno: string;
  readonly apellidoMaterno: string;
  readonly curp: string;
  readonly imagen?: string;
  readonly email: string;
  readonly password: string;
  readonly twoFactorAuthSecret?: string;
  readonly isTwoFactorEnable: boolean;
  readonly role: string;
  readonly active: boolean;
  readonly passwordResetCode?: string;
  readonly createAt: Date;
}
