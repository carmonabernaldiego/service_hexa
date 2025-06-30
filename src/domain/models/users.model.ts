import UserDomainException from '../exceptions/user-domain.exception';

export default class User {
  private id: string;
  private readonly nombre: string;
  private readonly apellidoPaterno: string;
  private readonly apellidoMaterno: string;
  private readonly curp: string;
  private readonly imagen?: string;
  private readonly email: string;
  private readonly password: string;
  private twoFactorAuthSecret?: string;
  private isTwoFactorEnable: boolean;
  private role: string;
  private active: boolean;
  private passwordResetCode?: string;
  private createAt: Date;

  constructor(
    id: string,
    nombre: string,
    apellidoPaterno: string,
    apellidoMaterno: string,
    curp: string,
    imagen: string | undefined,
    email: string,
    password: string,
    twoFactorAuthSecret?: string,
    isTwoFactorEnable: boolean = false,
    role: string = 'client',
    active: boolean = true,
    passwordResetCode?: string,
  ) {
    this.id = id;
    this.nombre = nombre;
    this.apellidoPaterno = apellidoPaterno;
    this.apellidoMaterno = apellidoMaterno;
    this.curp = curp;
    this.imagen = imagen;
    this.email = email;
    this.password = password;
    this.twoFactorAuthSecret = twoFactorAuthSecret;
    this.isTwoFactorEnable = isTwoFactorEnable;
    this.role = role;
    this.active = active;
    this.passwordResetCode = passwordResetCode;
    this.createAt = new Date();
    this.validate();
  }

  private validate(): void {
    if (!this.email || !this.email.includes('@')) {
      throw new UserDomainException('Email inválido');
    }
    if (!this.password || this.password.length < 8) {
      throw new UserDomainException(
        'La contraseña debe tener al menos 8 caracteres',
      );
    }
    if (!this.nombre || !this.apellidoPaterno || !this.apellidoMaterno) {
      throw new UserDomainException('Nombre y apellidos son obligatorios');
    }
    if (!this.curp || this.curp.length !== 18) {
      throw new UserDomainException('CURP inválida');
    }
  }

  public getId(): string {
    return this.id;
  }

  public getEmail(): string {
    return this.email;
  }

  public setCreateAt(date: Date): this {
    this.createAt = date;
    return this;
  }
}
