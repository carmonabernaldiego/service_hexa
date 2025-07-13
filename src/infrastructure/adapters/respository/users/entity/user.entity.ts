import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, name: 'apellido_paterno' })
  apellidoPaterno: string;

  @Column({ type: 'varchar', length: 100, name: 'apellido_materno' })
  apellidoMaterno: string;

  @Column({ type: 'varchar', length: 18, unique: true })
  curp: string;

  @Column({ type: 'text', nullable: true })
  imagen: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'two_factor_auth_secret',
  })
  twoFactorAuthSecret: string;

  @Column({ type: 'boolean', default: false, name: 'is_two_factor_enable' })
  isTwoFactorEnable: boolean;

  @Column({
    type: 'enum',
    enum: ['paciente', 'admin', 'medico', 'farmacia'],
    default: 'paciente',
  })
  role: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'password_reset_code',
  })
  passwordResetCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ---- CAMPOS NUEVOS OPCIONALES ----
  @Column({ type: 'varchar', length: 20, nullable: true })
  rfc?: string;

  @Column({ type: 'date', nullable: true, name: 'fecha_nacimiento' })
  fechaNacimiento?: Date;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
    name: 'cedula_profesional',
  })
  cedulaProfesional?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string;

  @Column({ type: 'json', nullable: true, name: 'permisos_prescripcion' })
  permisosPrescripcion?: any;

  @Column({ type: 'json', nullable: true, name: 'declaracion_terminos' })
  declaracionTerminos?: any;
}
