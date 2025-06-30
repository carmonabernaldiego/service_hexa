import { Schema } from 'mongoose';

const UserSchema = new Schema({
  nombre: { type: String, required: true },
  apellidoPaterno: { type: String, required: true },
  apellidoMaterno: { type: String, required: true },
  curp: { type: String, required: true, unique: true },
  imagen: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  twoFactorAuthSecret: { type: String },
  isTwoFactorEnable: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  active: { type: Boolean, default: true },
  passwordResetCode: { type: String, default: null },
  createAt: { type: Date, default: Date.now },
});

export default UserSchema;
