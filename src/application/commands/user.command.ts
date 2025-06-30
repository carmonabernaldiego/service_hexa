export default class UserCommand {
  public nombre: string;
  public apellidoPaterno: string;
  public apellidoMaterno: string;
  public curp: string;
  public imagen: string;
  public email: string;
  public password: string;
  public twoFactorAuthSecret?: string;
  public isTwoFactorEnable?: boolean;
  public role?: string;
  public active?: boolean;
  public passwordResetCode?: string;
}
