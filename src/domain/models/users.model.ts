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

  // NUEVOS CAMPOS
  private rfc?: string;
  private fechaNacimiento?: string;
  private cedulaProfesional?: string;
  private telefono?: string;
  private domicilio?: string;
  private permisosPrescripcion?: any;
  private declaracionTerminos?: any;

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
    role: string = 'paciente',
    active: boolean = true,
    passwordResetCode?: string,
    rfc?: string,
    fechaNacimiento?: string,
    cedulaProfesional?: string,
    telefono?: string,
    domicilio?: string,
    permisosPrescripcion?: any,
    declaracionTerminos?: any,
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

    // Nuevos campos
    this.rfc = rfc;
    this.fechaNacimiento = fechaNacimiento;
    this.cedulaProfesional = cedulaProfesional;
    this.telefono = telefono;
    this.domicilio = domicilio;
    this.permisosPrescripcion = permisosPrescripcion;
    this.declaracionTerminos = declaracionTerminos;

    this.validate();
  }

  private validate(): void {
    this.validateEmail();
    this.validatePassword();
    this.validateNames();
    this.role === 'farmacia' ? this.validateRfc() : this.validateCurp();
  }

  /* ---------- Valida RFC (farmacia) ---------- */
  private validateRfc(): void {
    const rfc = (this.rfc ?? this.curp).toUpperCase();
    const regex =
      /^([A-ZÑ&]{3,4})\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[A-Z\d]{3}$/;
    if (!regex.test(rfc)) {
      throw new UserDomainException('RFC con formato inválido');
    }
  }

  private validateEmail(): void {
    if (!this.email || !this.email.includes('@')) {
      throw new UserDomainException('Email inválido');
    }
  }

  private validatePassword(): void {
    if (!this.password || this.password.length < 8) {
      throw new UserDomainException(
        'La contraseña debe tener al menos 8 caracteres',
      );
    }
  }

  private validateNames(): void {
    if (!this.nombre) {
      throw new UserDomainException('El nombre es obligatorio');
    }
    if (this.role !== 'farmacia') {
      // ← sólo pacientes/médicos/admin
      if (!this.apellidoPaterno || !this.apellidoMaterno) {
        throw new UserDomainException(
          'Apellidos paterno y materno son obligatorios',
        );
      }
    }
  }

  private validateCurp(): void {
    const curp = this.curp.toUpperCase();
    const regex =
      /^[A-Z][AEIOU][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS)([B-DF-HJ-NP-TV-Z]{3})([A-Z\d])(\d)$/;
    if (!regex.test(curp)) {
      throw new UserDomainException('CURP con formato inválido');
    }

    const blacklist = new Set([
      'BUEI',
      'BUEY',
      'CACA',
      'CACO',
      'CAGA',
      'CAGO',
      'CAKA',
      'COGE',
      'COGI',
      'COJA',
      'COJE',
      'COJI',
      'COJO',
      'CULO',
      'FETO',
      'GUEI',
      'GUEY',
      'JOTO',
      'KACA',
      'KACO',
      'KAGA',
      'KAGO',
      'KOGE',
      'KOGI',
      'KOJA',
      'KOJE',
      'KOJI',
      'KOJO',
      'KULO',
      'MAME',
      'MAMO',
      'MEAR',
      'MEAS',
      'MEON',
      'MIAR',
      'MION',
      'MOCO',
      'MULA',
      'PEDA',
      'PEDO',
      'PENE',
      'PIPI',
      'PITO',
      'POPO',
      'PUTA',
      'PUTO',
      'QULO',
      'RUIN',
    ]);
    const prefix = curp.substring(0, 4);
    if (blacklist.has(prefix)) {
      throw new UserDomainException(
        `CURP inválida, contiene palabra prohibida (“${prefix}”)`,
      );
    }

    // Cálculo del dígito verificador
    const diccionario = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
    let suma = 0;
    for (let i = 0; i < 17; i++) {
      const valor = diccionario.indexOf(curp.charAt(i));
      suma += valor * (18 - i);
    }
    const resto = suma % 10;
    const digitoCalculado = resto === 0 ? '0' : `${10 - resto}`;
    const digitoReal = curp.charAt(17);
    if (digitoCalculado !== digitoReal) {
      throw new UserDomainException('CURP con dígito verificador incorrecto');
    }
  }

  public getId(): string {
    return this.id;
  }

  public getEmail(): string {
    return this.email;
  }

  public getNombre(): string {
    return (
      this.nombre + ' ' + this.apellidoPaterno + ' ' + this.apellidoMaterno
    );
  }

  public getCurp(): string {
    return this.curp;
  }

  public getImagen(): string | undefined {
    return this.imagen;
  }

  public setImagen(url: string): this {
    (this as any).imagen = url;
    return this;
  }

  public setCreateAt(date: Date): this {
    this.createAt = date;
    return this;
  }

  // NUEVOS GETTERS
  public getRfc(): string | undefined {
    return this.rfc;
  }
  public getFechaNacimiento(): string | undefined {
    return this.fechaNacimiento;
  }
  public getCedulaProfesional(): string | undefined {
    return this.cedulaProfesional;
  }
  public getTelefono(): string | undefined {
    return this.telefono;
  }
  public getDomicilio(): string | undefined {
    return this.domicilio;
  }
  public getPermisosPrescripcion(): any {
    return this.permisosPrescripcion;
  }
  public getDeclaracionTerminos(): any {
    return this.declaracionTerminos;
  }
}
