import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

interface NotificationPayload {
  type: string;
  email: string;
  subject: string;
  message: string;
  preHeader?: string;
  footerText?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      await this.client.connect();
      this.client.emit('send_notification', payload);
      this.logger.log(`Notification sent to ${payload.email}`);
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }

  async sendUserCreatedNotification(
    email: string,
    nombre: string,
  ): Promise<void> {
    const payload: NotificationPayload = {
      type: 'custom-notification',
      email,
      subject: 'Cuenta creada con éxito',
      message: `Hola ${nombre}, tu cuenta ha sido registrada correctamente.`,
      preHeader: '¡Bienvenido a la plataforma!',
      footerText: 'Este es un correo automático. No respondas.',
    };

    await this.sendNotification(payload);
  }

  async sendUserUpdatedNotification(
    email: string,
    nombre: string,
  ): Promise<void> {
    const payload: NotificationPayload = {
      type: 'custom-notification',
      email,
      subject: 'Perfil actualizado',
      message: `Hola ${nombre}, tu perfil ha sido actualizado correctamente.`,
      preHeader: 'Información actualizada',
      footerText: 'Este es un correo automático. No respondas.',
    };

    await this.sendNotification(payload);
  }

  async sendUserDeletedNotification(
    email: string,
    nombre: string,
  ): Promise<void> {
    const payload: NotificationPayload = {
      type: 'custom-notification',
      email,
      subject: 'Cuenta eliminada',
      message: `Hola ${nombre}, tu cuenta ha sido eliminada de nuestro sistema.`,
      preHeader: 'Cuenta eliminada',
      footerText: 'Este es un correo automático. No respondas.',
    };

    await this.sendNotification(payload);
  }

  async sendCustomNotification(
    email: string,
    subject: string,
    message: string,
    type: string = 'custom-notification',
  ): Promise<void> {
    const payload: NotificationPayload = {
      type,
      email,
      subject,
      message,
      footerText: 'Este es un correo automático. No respondas.',
    };

    await this.sendNotification(payload);
  }
}
