import CreateUserUseCase from './createUser.usecase';
import DeleteUserUseCase from './deleteUser.usecase';
import GetAllUsersUseCase from './getAllUsers.usecase';
import GetUserUseCase from './getUser.usecase';
import UpdateUserUseCase from './updateUser.usecase';

export const USERS_USECASES = [
  CreateUserUseCase,
  DeleteUserUseCase,
  GetAllUsersUseCase,
  GetUserUseCase,
  UpdateUserUseCase,
];
